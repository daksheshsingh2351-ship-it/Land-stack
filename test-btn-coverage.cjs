const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 800, height: 600 });
    
    // Login first
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    let buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('Citizen Portal')) {
        await btn.click();
        break;
      }
    }
    await page.waitForSelector('button[type="submit"]', { visible: true });
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    
    // Go to explorer
    await page.goto('http://localhost:5173/explorer', { waitUntil: 'networkidle0' });
    
    const html = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(el => el.innerText && el.innerText.includes('By Location'));
      if (!btn) return 'NOT FOUND';
      
      const rect = btn.getBoundingClientRect();
      
      // Check multiple points on the button
      const points = [
        { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
        { x: rect.left + 5, y: rect.top + 5 },
        { x: rect.right - 5, y: rect.bottom - 5 },
      ];
      
      const coverage = points.map(p => {
        const el = document.elementFromPoint(p.x, p.y);
        return {
          point: p,
          element: el ? el.tagName + (el.id ? '#' + el.id : '') + (el.className ? '.' + el.className : '') : 'NONE',
          isCoveredBySelf: el === btn || btn.contains(el)
        };
      });
      
      return {
        text: btn.innerText,
        rect: JSON.parse(JSON.stringify(rect)),
        coverage
      };
    });
    
    console.log(JSON.stringify(html, null, 2));
    
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
