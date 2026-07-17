import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
  
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle2' });
  
  const bodyContent = await page.evaluate(() => document.body.innerHTML);
  console.log('BODY LENGTH:', bodyContent.length);
  
  await browser.close();
})();
