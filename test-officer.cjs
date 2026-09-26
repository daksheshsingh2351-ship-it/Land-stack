const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));
  page.on('response', response => {
    if (response.url().includes('/api/auth/login')) {
      console.log('LOGIN RESPONSE:', response.status(), response.url());
      response.text().then(t => console.log('LOGIN BODY:', t)).catch(e => {});
    }
  });

  await page.goto('http://localhost:5175/', { waitUntil: 'networkidle0' });
  
  // Click Officer Login
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text === 'Officer Login') {
      await btn.click();
      break;
    }
  }
  
  await new Promise(r => setTimeout(r, 1000)); // wait for modal
  
  // Submit
  const submitBtn = await page.$('button[type="submit"]');
  await submitBtn.click();
  
  await new Promise(r => setTimeout(r, 2000));
  
  const currentUrl = await page.url();
  console.log('FINAL URL:', currentUrl);

  console.log('Navigating to /explorer as logged-in OFFICER...');
  await page.goto('http://localhost:5175/explorer', { waitUntil: 'networkidle0' });
  console.log('EXPLORER URL:', await page.url());
  
  await browser.close();
})();
