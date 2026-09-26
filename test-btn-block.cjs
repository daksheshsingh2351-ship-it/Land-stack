const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Login first
  await page.goto('http://localhost:5176/', { waitUntil: 'networkidle0' });
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('Citizen Portal')) {
      await btn.click();
      break;
    }
  }
  
  await page.waitForSelector('button[type="submit"]', { visible: true });
  await page.click('button[type="submit"]');
  
  // Wait for login to complete (url changes)
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  
  // Go to explorer
  await page.goto('http://localhost:5176/explorer', { waitUntil: 'networkidle0' });
  
  const html = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(el => el.innerText && el.innerText.includes('By Location'));
    if (!btn) return 'NOT FOUND';
    
    const rect = btn.getBoundingClientRect();
    
    // Check if covered by another element
    const elAtPoint = document.elementFromPoint(rect.left + rect.width/2, rect.top + rect.height/2);
    
    return {
      text: btn.innerText,
      rect: JSON.parse(JSON.stringify(rect)),
      coveredBy: elAtPoint ? elAtPoint.tagName + '.' + elAtPoint.className : 'NONE',
      isCoveredBySelf: elAtPoint === btn || btn.contains(elAtPoint)
    };
  });
  
  console.log(JSON.stringify(html, null, 2));
  
  await browser.close();
})();
