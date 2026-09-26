const puppeteer = require('puppeteer');
const assert = require('assert');

(async () => {
  const browser = await puppeteer.launch();
  try {
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
    // Use default small viewport which triggers the max-width: 1024px rule
    
    // Login first
    console.log('Logging in...');
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
    console.log('Going to Explorer...');
    await page.goto('http://localhost:5173/explorer', { waitUntil: 'networkidle0' });
    
    async function testTabClick(tabName, expectedText) {
      console.log(`Testing click on ${tabName}...`);
      
      const targetBtn = await page.evaluateHandle((name) => {
        return Array.from(document.querySelectorAll('button')).find(el => el.innerText && el.innerText.includes(name));
      }, tabName);
      
      assert.ok(targetBtn, `Button ${tabName} not found`);
      
      // Perform a real mouse click which will fail if covered and not pointer-events: none
      await targetBtn.click();
      await new Promise(r => setTimeout(r, 500));
      
      const content = await page.evaluate(() => document.body.innerText);
      if (!content.includes(expectedText)) {
        await page.screenshot({ path: 'screenshot.png' });
        console.error(`EXPECTED: ${expectedText}`);
        console.error(`GOT CONTENT:\n${content}`);
      }
      assert.ok(content.includes(expectedText), `${tabName} content did not appear`);
      console.log(`${tabName} click: PASS`);
    }
    
    // 1. By Location
    await testTabClick('By Location', 'Select location to find parcels');
    
    // 3. Land Record
    await testTabClick('Land Record', 'Enter any one or more known land record');
    
    // 4. Find on Map
    await testTabClick('Find on Map', 'Interactive Map Mode');
    
    // 5. My Properties
    await testTabClick('My Properties', 'Properties linked to your account');
    
    // 6. Verify logged-out /explorer protection
    console.log('Logging out...');
    const logoutBtn = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Log Out'));
    });
    if (logoutBtn) {
      await logoutBtn.click();
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
    }
    
    console.log('Testing logged-out /explorer protection...');
    await page.goto('http://localhost:5173/explorer', { waitUntil: 'networkidle0' });
    const url = await page.url();
    assert.ok(url === 'http://localhost:5173/', 'Should redirect to / when logged out');
    console.log('Logged-out protection: PASS');
    
    console.log('All tests passed successfully!');
    
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
