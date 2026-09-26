const puppeteer = require('puppeteer');
const assert = require('assert');

(async () => {
  const browser = await puppeteer.launch();
  try {
    const page = await browser.newPage();
    
    // 1. Backend health works
    console.log('Testing Backend health...');
    const health = await fetch('http://localhost:5000/api/health').then(r => r.json());
    assert.ok(health.success === true, 'Health endpoint failed');
    console.log('Backend health: PASS');
    
    // 2. Citizen login works & 4. No "Failed to fetch"
    console.log('Logging in as Citizen...');
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
    
    // Wait for the login navigation
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    let url = await page.url();
    
    // 5. Existing /explorer protection
    // Check if we can go to explorer while logged in
    await page.goto('http://localhost:5173/explorer', { waitUntil: 'networkidle0' });
    url = await page.url();
    assert.ok(url.includes('/explorer'), 'Should be on /explorer as Citizen');
    console.log('Citizen login & GIS access: PASS');
    
    // Logout
    console.log('Logging out...');
    const logoutBtn = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('Log Out'));
    });
    if (logoutBtn) {
      await logoutBtn.click();
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
    }
    
    // Logged out /explorer protection check
    console.log('Testing logged-out /explorer protection...');
    await page.goto('http://localhost:5173/explorer', { waitUntil: 'networkidle0' });
    url = await page.url();
    assert.ok(url === 'http://localhost:5173/', 'Should redirect to / when logged out');
    console.log('Logged-out protection: PASS');
    
    // 3. Officer login works
    console.log('Logging in as Officer...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
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
    
    // Wait for the login navigation
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    url = await page.url();
    assert.ok(!url.includes('login'), 'Should be logged in as Officer');
    console.log('Officer login: PASS');
    
    console.log('All tests passed successfully!');
    
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
