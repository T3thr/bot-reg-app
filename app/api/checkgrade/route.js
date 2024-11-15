import puppeteer from 'puppeteer';
import mongodbConnect from '@/backend/lib/mongodb';
import User from '@/backend/models/User';
import GradeState from '@/backend/models/GradeState';

const scrapeGrades = async (username, password) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Step 1: Log into the grade portal
  await page.goto('https://reg9.nu.ac.th/registrar/login_ssl.asp?avs224389944=6');
  await page.type('input[name="f_uid"]', username);
  await page.type('input[name="f_pwd"]', password);
  await page.keyboard.press('Enter');
  await page.waitForNavigation();

  // Step 2: Navigate to the grades page
  await page.goto('https://reg9.nu.ac.th/registrar/grade.asp?avs224389636=41');

  // Step 3: Extract grade data for each semester
  const grades = await page.evaluate(() => {
    const semesterGrades = {};
    const tables = document.querySelectorAll('table[border="0"][width="70%"]');

    tables.forEach((table, index) => {
      const semesterName = `semester${index + 1}`;
      semesterGrades[semesterName] = {
        totalSubjects: 0,
        gradedSubjects: 0,
        eValSubjects: 0,
        subjects: [],
      };

      const rows = table.querySelectorAll('tr[valign="TOP"][bgcolor="#F6F6FF"]');
      rows.forEach((row) => {
        const gradeField = row.querySelector('font[face="Tahoma, Arial, Helvetica"][size="2"]');
        const gradeText = gradeField ? gradeField.textContent.trim() : '';

        // Check if the grade requires evaluation
        if (gradeField && gradeField.style.color === '#92a8d1' && gradeField.style.backgroundColor === 'red') {
          semesterGrades[semesterName].eValSubjects++;
          semesterGrades[semesterName].subjects.push('e-val');
        } else if (gradeText && gradeText !== '&nbsp;&nbsp;' && gradeText !== '') {
          semesterGrades[semesterName].gradedSubjects++;
          semesterGrades[semesterName].subjects.push(gradeText);
        } else {
          semesterGrades[semesterName].subjects.push('unknown');
        }
        semesterGrades[semesterName].totalSubjects++;
      });
    });
    return semesterGrades;
  });

  await browser.close();
  return grades;
};

const generateNotificationMessage = (newGrades, oldGrades) => {
  let message = '';
  let gradeChanged = false;
  const evalNotifications = [];

  for (const [semester, { totalSubjects, gradedSubjects, eValSubjects }] of Object.entries(newGrades)) {
    const oldSemester = oldGrades?.[semester] || {};
    const oldGradedSubjects = oldSemester.gradedSubjects || 0;

    // Check if the number of graded subjects has changed
    if (gradedSubjects !== oldGradedSubjects) {
      gradeChanged = true;
      message += `${semester} has ${gradedSubjects} out of ${totalSubjects} subjects with grades.\n`;
    }

    // Add special notification if there are e-val subjects
    if (eValSubjects > 0) {
      evalNotifications.push(`in ${semester} you got ${eValSubjects} e-val subjects requiring evaluation.`);
    }
  }

  // Include e-val notifications
  if (evalNotifications.length) {
    message += '\n' + evalNotifications.join('\n');
  }

  return { message, gradeChanged };
};

export default async function handler(req, res) {
  await mongodbConnect();

  if (req.method === 'POST') {
    const { lineUserId } = req.body;

    if (!lineUserId) {
      return res.status(400).json({ success: false, error: 'LINE User ID is required.' });
    }

    const user = await User.findOne({ lineUserId }).lean();
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    try {
      const newGrades = await scrapeGrades(user.username, user.password);
      const oldState = await GradeState.findOne({ lineUserId });
      const oldGrades = oldState?.grades || {};

      const { message, gradeChanged } = generateNotificationMessage(newGrades, oldGrades);

      if (gradeChanged || !oldState) {
        await GradeState.updateOne(
          { lineUserId },
          { grades: newGrades, lastChecked: new Date() },
          { upsert: true }
        );
      }

      const finalMessage = gradeChanged
        ? `Grade has changed!\n\n${message}`
        : message || 'No new grade changes detected.';

      return res.status(200).json({ success: true, notification: finalMessage });
    } catch (error) {
      console.error('Grade scraping error:', error);
      return res.status(500).json({ success: false, error: 'Failed to scrape grades.' });
    }
  } else if (req.method === 'GET') {
    const { lineUserId } = req.query;

    if (!lineUserId) {
      return res.status(400).json({ success: false, error: 'LINE User ID is required.' });
    }

    try {
      const gradeState = await GradeState.findOne({ lineUserId }).lean();
      if (!gradeState) {
        return res.status(404).json({ success: false, error: 'No grades found for this user.' });
      }

      return res.status(200).json({ success: true, grades: gradeState.grades });
    } catch (error) {
      console.error('Error retrieving grades:', error);
      return res.status(500).json({ success: false, error: 'Failed to retrieve grades.' });
    }
  } else {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}
