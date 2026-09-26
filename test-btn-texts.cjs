const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Login first
  await page.goto('http://localhost:5176/', { waitUntil: 'networkidle0' });
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text === 'Citizen Portal') {
      await btn.click();
      break;
    }
  }
  
  await new Promise(r => setTimeout(r, 1000));
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 2000));
  
  // Go to explorer
  await page.goto('http://localhost:5176/explorer', { waitUntil: 'networkidle0' });
  
  await new Promise(r => setTimeout(r, 2000));
  
  const texts = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).map(b => b.innerText || b.textContent);
  });
  
  console.log(JSON.stringify(texts, null, 2));
  
  await browser.close();
})();
