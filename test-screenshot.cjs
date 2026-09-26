const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5175/explorer', { waitUntil: 'networkidle0' });
  
  await new Promise(r => setTimeout(r, 2000));
  
  await page.screenshot({ path: 'explorer-unauth.png' });
  console.log('Screenshot saved to explorer-unauth.png');
  console.log('Final URL:', await page.url());
  
  await browser.close();
})();
