const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5175/explorer', { waitUntil: 'networkidle0' });
  
  const currentUrl = await page.url();
  console.log('UNAUTH URL:', currentUrl);
  
  await browser.close();
})();
