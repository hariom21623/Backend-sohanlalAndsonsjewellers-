import puppeteer from 'puppeteer';

export const htmlToPdfBuffer = async (html: string) => {
  // ✅ FIX: "new" ki jagah 'true' use karo
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html);
  const pdfBuffer = await page.pdf({ format: 'A4' });
  await browser.close();
  return pdfBuffer;
};