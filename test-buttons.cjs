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
  
  console.log('Testing "By Location" button...');
  const locationBtn = await page.evaluateHandle(() => {
    return Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('By Location'));
  });
  
  if (locationBtn) {
    console.log('Button found. Clicking...');
    await page.evaluate(btn => btn.click(), locationBtn);
    await new Promise(r => setTimeout(r, 500));
    
    // Check if the button is active
    const isActive = await page.evaluate(btn => {
      const style = window.getComputedStyle(btn);
      return style.borderBottomColor !== 'rgba(0, 0, 0, 0)' && style.borderBottomColor !== 'transparent';
    }, locationBtn);
    console.log('Is button active (border bottom)?', isActive);
    
    // Check if the tab content changed
    const contentText = await page.evaluate(() => document.body.innerText);
    if (contentText.includes('Select location to find parcels')) {
      console.log('SUCCESS: Tab content changed successfully.');
    } else {
      console.log('FAIL: Tab content did not change.');
    }
  } else {
    console.log('Button not found.');
  }
  
  await browser.close();
})();
