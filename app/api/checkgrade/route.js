import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const USER_STATE_FILE = path.resolve('user_state.json');

// Load user state (previous grades)
const loadUserState = () => {
  if (fs.existsSync(USER_STATE_FILE)) {
    return JSON.parse(fs.readFileSync(USER_STATE_FILE));
  }
  return {};
};

// Save user state (new grades)
const saveUserState = (state) => {
  fs.writeFileSync(USER_STATE_FILE, JSON.stringify(state, null, 2));
};

const scrapeGrades = async (username, password) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Login to the portal
  await page.goto('https://reg9.nu.ac.th/registrar/login_ssl.asp?avs224389944=6');
  await page.type('input[name="f_uid"]', username);
  await page.type('input[name="f_pwd"]', password);
  await page.keyboard.press('Enter');
  await page.waitForNavigation();

  // Scrape grade data from the page
  await page.goto('https://reg9.nu.ac.th/registrar/grade.asp?avs224389636=41');
  const grades = await page.evaluate(() => {
    let semesterGrades = {};
    let semesterCounter = 1;
    const tables = document.querySelectorAll('table[border="0"][width="70%"]');

    tables.forEach((table) => {
      const semesterName = `semester${semesterCounter}`;
      semesterGrades[semesterName] = { totalSubjects: 0, gradedSubjects: 0, eValSubjects: 0, subjects: [] };
      
      const rows = table.querySelectorAll('tr[valign="TOP"]');
      rows.forEach((row) => {
        const gradeField = row.querySelector('td[width="60"][align="LEFT"] font');
        const gradeText = gradeField ? gradeField.textContent.trim() : '';
        
        if (gradeText) {
          if (gradeText.includes('e-val')) {
            semesterGrades[semesterName].eValSubjects++;
            semesterGrades[semesterName].subjects.push('e-val');
          } else {
            semesterGrades[semesterName].gradedSubjects++;
            semesterGrades[semesterName].subjects.push(gradeText);
          }
          semesterGrades[semesterName].totalSubjects++;
        }
      });

      semesterCounter++;
    });

    return semesterGrades;
  });

  await browser.close();
  return grades;
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { username, lineUserId } = req.body;

    // Get grades by scraping
    try {
      const grades = await scrapeGrades(username, 'your_password_here'); // Provide the user's password here or request it
      const oldState = loadUserState();
      
      // Compare grades (optional step)
      const stateChanged = JSON.stringify(oldState) !== JSON.stringify(grades);
      if (stateChanged) {
        saveUserState(grades); // Save new state
      }

      res.status(200).json({ success: true, grades });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to scrape grades.' });
    }
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}
