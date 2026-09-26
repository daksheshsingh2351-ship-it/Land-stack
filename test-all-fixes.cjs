const puppeteer = require('puppeteer');
const assert = require('assert');

(async () => {
  const browser = await puppeteer.launch();
  try {
    const page = await browser.newPage();
    
    // 5. Verify logged-out /explorer protection still works
    console.log('Testing logged-out /explorer protection...');
    await page.goto('http://localhost:5176/explorer', { waitUntil: 'networkidle0' });
    let url = await page.url();
    assert.ok(url === 'http://localhost:5176/', 'Should redirect to / when logged out');
    console.log('Logged-out protection: PASS');
    
    // 6. Verify logged-in Citizen can still open GIS
    console.log('Logging in as Citizen...');
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
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    
    await page.goto('http://localhost:5176/explorer', { waitUntil: 'networkidle0' });
    url = await page.url();
    assert.ok(url.includes('/explorer'), 'Should be on /explorer as Citizen');
    console.log('Citizen GIS access: PASS');
    
    // Test tabs
    async function testTab(tabName, expectedText) {
      console.log(`Testing ${tabName} tab...`);
      const btns = await page.$$('button');
      let targetBtn = null;
      for (const b of btns) {
        const text = await page.evaluate(el => el.textContent, b);
        if (text.includes(tabName)) {
          targetBtn = b;
          break;
        }
      }
      
      assert.ok(targetBtn, `Button for ${tabName} not found`);
      await targetBtn.click();
      await new Promise(r => setTimeout(r, 500));
      
      const content = await page.evaluate(() => document.body.innerText);
      assert.ok(content.includes(expectedText), `${tabName} tab content did not render`);
      console.log(`${tabName} tab: PASS`);
    }
    
    // 1. By Location
    await testTab('By Location', 'Select location to find parcels');
    
    // 2. Land Record
    await testTab('Land Record', 'Enter any one or more known land record');
    
    // 3. Find on Map
    await testTab('Find on Map', 'Interactive Map Mode');
    
    // 4. My Properties
    await testTab('My Properties', 'Properties linked to your account');
    
    // Logout
    console.log('Logging out...');
    const logoutBtn = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Log Out'));
    });
    if (logoutBtn) {
      await logoutBtn.click();
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
    }
    
    // 6. Verify logged-in Officer can still open GIS
    console.log('Logging in as Officer...');
    await page.goto('http://localhost:5176/', { waitUntil: 'networkidle0' });
    const officerBtns = await page.$$('button');
    for (const btn of officerBtns) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('Officer Login')) {
        await btn.click();
        break;
      }
    }
    await page.waitForSelector('button[type="submit"]', { visible: true });
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    
    await page.goto('http://localhost:5176/explorer', { waitUntil: 'networkidle0' });
    url = await page.url();
    assert.ok(url.includes('/explorer'), 'Should be on /explorer as Officer');
    console.log('Officer GIS access: PASS');
    
    console.log('All tests passed successfully!');
    
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
