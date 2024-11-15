// pages/api/checkgrade.js
import puppeteer from 'puppeteer';
import User from '@/backend/models/User'; // Import your MongoDB User model
import mongodbConnect from '@/backend/lib/mongodb'; // Import mongodbConnect

export default async function handler(req, res) {
  const { lineUserId } = req.query; // Get lineUserId from the query parameter

  if (!lineUserId) {
    return res.status(400).json({ error: 'lineUserId is required' });
  }

  try {
    // 1. Connect to the MongoDB database
    await mongodbConnect();

    // 2. Find the user credentials by lineUserId
    const user = await User.findOne({ lineUserId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 3. Launch Puppeteer and login to the grade portal using credentials
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Go to the login page
    await page.goto('https://reg9.nu.ac.th/registrar/login_ssl.asp?avs224389944=6');

    // Type in the username and password and submit the form
    await page.type('input[name="username"]', user.username);
    await page.type('input[name="password"]', user.password);
    await page.click('button[type="submit"]'); // Submit the form

    // Wait for navigation to the grade page
    await page.waitForNavigation();

    // 4. Scrape the grade page
    await page.goto('https://reg9.nu.ac.th/registrar/grade.asp?avs224389636=41');
    await page.waitForSelector('table'); // Wait for tables to load

    const gradeData = await page.evaluate(() => {
      const tables = document.querySelectorAll('table');
      const semesterGrades = [];

      // Loop through each table (semester)
      tables.forEach((table, index) => {
        const semester = { semester: `Semester ${index + 1}`, subjects: [] };
        const rows = table.querySelectorAll('tr[valign="TOP"]');
        
        // Loop through each subject in the semester
        rows.forEach(row => {
          const gradeField = row.querySelector('font[size="2"]');
          const gradeText = gradeField ? gradeField.textContent.trim() : '';
          
          // Check for special conditions
          const isEVal = row.innerHTML.includes('<span style="color:#92a8d1;background-color:red">e-val</span>');
          
          semester.subjects.push({
            grade: gradeText || 'No Grade',
            isEVal,
          });
        });

        semesterGrades.push(semester);
      });

      return semesterGrades;
    });

    await browser.close();

    // 5. Analyze grades for leaks and send notifications
    const analysis = analyzeGrades(gradeData);
    
    // 6. Return the analyzed data
    res.status(200).json({ success: true, grades: gradeData, analysis });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while checking grades.' });
  }
}

// Function to analyze grades and detect leaks, e-val, and changes
function analyzeGrades(gradeData) {
  let message = '';
  let eValMessage = '';
  let gradeLeaks = 0;

  gradeData.forEach((semester) => {
    const totalSubjects = semester.subjects.length;
    const gradedSubjects = semester.subjects.filter(subject => subject.grade !== 'No Grade').length;
    gradeLeaks += semester.subjects.filter(subject => subject.grade !== 'No Grade').length;
    message += `${semester.semester} has ${gradedSubjects} out of ${totalSubjects} subjects with grades.\n`;

    // Check for e-val
    const eValSubjects = semester.subjects.filter(subject => subject.isEVal);
    if (eValSubjects.length > 0) {
      eValMessage += `In ${semester.semester}, you have ${eValSubjects.length} e-val subjects. Please review them to see your grade correctly.\n`;
    }
  });

  return { message, eValMessage, gradeLeaks };
}
