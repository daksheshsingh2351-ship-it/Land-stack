const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));
  page.on('response', response => {
    if (response.url().includes('/api/auth/register')) {
      console.log('REGISTER RESPONSE:', response.status(), response.url());
      response.text().then(t => console.log('REGISTER BODY:', t)).catch(e => console.log('Error reading body:', e.message));
    }
  });

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
  
  await new Promise(r => setTimeout(r, 1000)); // wait for modal
  
  // Click Register toggle
  const modalButtons = await page.$$('button');
  for (const btn of modalButtons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes("Don't have an account? Register")) {
      await btn.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 500));

  // Fill form
  await page.type('input[name="name"]', 'Test Citizen');
  await page.type('input[name="email"]', 'testcitizen@example.com');
  await page.type('input[name="password"]', 'password123');
  
  // Submit
  const submitBtn = await page.$('button[type="submit"]');
  await submitBtn.click();
  
  await new Promise(r => setTimeout(r, 2000));
  
  const currentUrl = await page.url();
  console.log('FINAL URL:', currentUrl);
  
  await browser.close();
})();
