// src/utils/pdfBuffer.ts
import puppeteer from "puppeteer";

export async function htmlToPdfBuffer(html: string) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 820, height: 1000 });
    await page.setContent(html, { waitUntil: "networkidle0" });

    const buffer = await page.pdf({
      format: "A5",             // smaller than A4
      printBackground: false,    // big size reduction
      scale: 0.85,               // reduce size
      margin: {
        top: "10mm",
        bottom: "10mm",
        left: "8mm",
        right: "8mm",
      },
    });

    return buffer;
  } finally {
    await browser.close();
  }
}
