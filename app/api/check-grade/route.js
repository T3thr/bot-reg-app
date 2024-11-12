// api/check-grades/route.js
import puppeteer from 'puppeteer';
import mongodbConnect from '@/backend/lib/mongodb';
import User from '@/backend/models/User';
import GradeState from '@/backend/models/GradeState';
import { sendLineMessage } from '@/backend/utils/lineAPI';

export async function POST(req) {
  try {
    await mongodbConnect();
    const { lineUserId } = await req.json();

    const user = await User.findOne({ lineUserId });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Login to grade portal
    await page.goto("https://reg9.nu.ac.th/registrar/login_ssl.asp");
    await page.type("input[name='f_uid']", user.username);
    await page.type("input[name='f_pwd']", user.password);
    await page.click("input[type='submit']");
    await page.waitForNavigation();

    // Scrape grades
    await page.goto("https://reg9.nu.ac.th/registrar/grade.asp");
    const newGrades = await page.evaluate(() => {
      // Define your scraping logic here, similar to reg-bot.py
      return {}; // Example return object representing scraped data
    });

    await browser.close();

    // Load previous grade state
    let gradeState = await GradeState.findOne({ lineUserId });
    if (!gradeState) gradeState = new GradeState({ lineUserId, grades: {} });

    // Compare and update grade state
    const hasChanges = JSON.stringify(gradeState.grades) !== JSON.stringify(newGrades);
    if (hasChanges) {
      await sendLineMessage(lineUserId, 'Grade changes detected! Here are your updates: ...');
      gradeState.grades = newGrades;
      await gradeState.save();
    } else {
      await sendLineMessage(lineUserId, 'No new grade changes.');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error checking grades:', error);
    return NextResponse.json({ error: 'Error during grade check' }, { status: 500 });
  }
}
