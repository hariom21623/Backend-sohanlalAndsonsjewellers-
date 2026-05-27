// src/utils/pdf.ts
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";

export async function ensureFolder(folder: string) {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
}

// htmlToPdf(html: string, outPath: string)
export async function htmlToPdf(html: string, outPath: string) {
  ensureFolder(path.dirname(outPath));
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" as any });
    await page.pdf({ path: outPath, format: "A4", printBackground: true });
  } finally {
    await browser.close();
  }
}
