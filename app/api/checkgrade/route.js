// app/api/checkgrade/route.js
import puppeteer from 'puppeteer';
import { NextResponse } from 'next/server';
import mongodbConnect from '@/backend/lib/mongodb';
import User from '@/backend/models/User';
import { sendLineNotification } from '@/utils/lineNotification';

async function loginAndGetGrades(username, password) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  const loginUrl = 'https://reg9.nu.ac.th/registrar/login_ssl.asp?avs224389944=6';
  const gradesUrl = 'https://reg9.nu.ac.th/registrar/grade.asp?avs224389636=41';
  const semesterGrades = {};
  
  await page.goto(loginUrl);
  await page.type('input[name="f_uid"]', username);
  await page.type('input[name="f_pwd"]', password);
  await page.keyboard.press('Enter');
  await page.waitForNavigation();

  await page.goto(gradesUrl);
  
  const tables = await page.$$('table[border="0"][width="70%"][cellspacing="2"][cellpadding="0"]');
  
  for (let i = 0; i < tables.length; i++) {
    const semesterName = `semester${i + 1}`;
    const subjects = await tables[i].$$('tr[valign="TOP"]');
    semesterGrades[semesterName] = { totalSubjects: subjects.length, gradedSubjects: 0, eValSubjects: 0, subjects: [] };

    for (const subject of subjects) {
      const grade = await subject.$eval('td[width="60"][align="LEFT"] font', el => el.innerText.trim());
      const isEval = await subject.$('span[style="color:#92a8d1;background-color:red"]');
      
      semesterGrades[semesterName].subjects.push(isEval ? 'e-val' : grade);
      if (isEval) semesterGrades[semesterName].eValSubjects += 1;
      if (grade) semesterGrades[semesterName].gradedSubjects += 1;
    }
  }

  await browser.close();
  return semesterGrades;
}

export async function POST(req) {
  const { username, password, lineUserId } = await req.json();
  
  try {
    await mongodbConnect();
    const user = await User.findOne({ lineUserId });
    if (!user) return NextResponse.json({ error: 'User not registered' }, { status: 403 });

    const grades = await loginAndGetGrades(username, password);
    await sendLineNotification(lineUserId, 'Grade check complete.', grades);
    
    return NextResponse.json({ success: true, grades });
  } catch (error) {
    console.error('Grade check error:', error);
    return NextResponse.json({ error: 'Error checking grades' }, { status: 500 });
  }
}
