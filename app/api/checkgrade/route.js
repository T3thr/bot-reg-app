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
        subjects: []
      };

      const rows = table.querySelectorAll('tr[valign="TOP"][bgcolor="#F6F6FF"]');
      rows.forEach((row) => {
        const gradeField = row.querySelector('td[width="60"][align="LEFT"] font');
        const gradeText = gradeField ? gradeField.textContent.trim() : '';

        if (gradeText.includes('e-val')) {
          semesterGrades[semesterName].eValSubjects++;
          semesterGrades[semesterName].subjects.push('e-val');
        } else if (gradeText) {
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

    const user = await User.findOne({ lineUserId });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    try {
      // Step 1: Scrape new grades
      const newGrades = await scrapeGrades(user.username, user.password);

      // Step 2: Retrieve the old state and compare
      const oldState = await GradeState.findOne({ lineUserId });
      const oldGrades = oldState?.grades || {};

      const { message, gradeChanged } = generateNotificationMessage(newGrades, oldGrades);

      // Step 3: Save new state if there are changes
      if (gradeChanged || !oldState) {
        await GradeState.updateOne(
          { lineUserId },
          { grades: newGrades, lastChecked: new Date() },
          { upsert: true }
        );
      }

      // Step 4: Send response
      const finalMessage = gradeChanged
        ? `Grade has changed!\n\n${message}`
        : message || 'No new grade changes detected.';

      res.status(200).json({ success: true, notification: finalMessage });
    } catch (error) {
      console.error('Grade scraping error:', error);
      res.status(500).json({ success: false, error: 'Failed to scrape grades.' });
    }
  }
}
