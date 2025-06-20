const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const CHROME_PATH = process.env.CHROME_BIN || '/usr/bin/google-chrome';

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: CHROME_PATH,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--single-process',
      '--no-zygote'
    ]
  });

  const page = await browser.newPage();

  // Logging before navigation
  console.log('Navigating to https://example.com ...');
  try {
    await page.goto('https://example.com', { waitUntil: 'networkidle2', timeout: 60000 });
    console.log('Navigation successful. Example.com loaded!');
  } catch (err) {
    console.error('Navigation failed:', err);
    // Do not exit, keep the service alive
  }

  // Keep the process alive
  setInterval(() => console.log('Bot is still running...'), 60000);

  // Monitoring logic
  await page.exposeFunction('onNewTokenDetected', async (tokenName) => {
    console.log(`New token detected: ${tokenName}`);
    const buyButtons = await page.$x("//button[contains(text(), 'Buy')]");
    if (buyButtons.length > 0) {
      console.log('Clicking Buy button...');
      await buyButtons[0].click();

      try {
        await page.waitForSelector('.amount-input-class', { timeout: 5000 });
        await page.evaluate(() => {
          const input = document.querySelector('.amount-input-class');
          if (input) {
            input.value = '5';
            input.dispatchEvent(new Event('input'));
          }
        });

        const confirmButton = await page.$x("//button[contains(text(), 'Buy Now')]");
        if (confirmButton.length > 0) {
          console.log('Confirming buy...');
          await confirmButton[0].click();
        }
      } catch (error) {
        console.error('Error setting percentage or confirming buy:', error);
      }
    }
  });

  await page.evaluate(() => {
    const observer = new MutationObserver(() => {
      const rows = document.querySelectorAll('.pulse-row-class');
      const latestToken = rows[0]?.textContent;
      if (latestToken) {
        window.onNewTokenDetected(latestToken);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
})();
