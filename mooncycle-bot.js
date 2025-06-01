const puppeteer = require('puppeteer-core');

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
      '--disable-gpu'
    ]
  });

  const page = await browser.newPage();

  // Navigate to Axiom Pro Pulse page
  await page.goto('https://axiom.trade/pulse', { waitUntil: 'networkidle2' });
  console.log('MoonCycle Bot is monitoring Axiom Pro Pulse...');

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
