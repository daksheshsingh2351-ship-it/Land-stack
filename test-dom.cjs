const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5174/explorer', { waitUntil: 'networkidle0' });
  
  // Wait a second for React to render
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const content = await page.evaluate(() => document.body.innerHTML);
  console.log('UNAUTH DOM:', content.substring(0, 500));
  console.log('UNAUTH URL:', await page.url());
  
  await browser.close();
})();
