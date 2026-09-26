const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  
  // Click Citizen Portal
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text === 'Citizen Portal') {
      await btn.click();
      break;
    }
  }
  
  await new Promise(r => setTimeout(r, 1000));
  
  const submitBtn = await page.$('button[type="submit"]');
  await submitBtn.click();
  
  await new Promise(r => setTimeout(r, 2000));
  
  // Navigate to explorer
  await page.goto('http://localhost:5173/explorer', { waitUntil: 'networkidle0' });
  
  await new Promise(r => setTimeout(r, 2000));
  console.log('FINAL URL:', await page.url());
  
  await browser.close();
})();
