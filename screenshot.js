const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('https://karmen87.github.io/enthusiast-blog/', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: 'Enthusiast Docs Thumbnail.png', type: 'png' });
  await browser.close();
  console.log('Screenshot saved as: Enthusiast Docs Thumbnail.png');
})();
