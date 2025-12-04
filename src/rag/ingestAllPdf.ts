import fs from "fs/promises";
import path from "path";
import { ingestPdf } from "./ingest";

async function ingestAllBooks() {
  const booksDir = path.resolve(process.cwd(), "../../assets/books");

  const files = await fs.readdir(booksDir);

  // Filter only PDFs
  const pdfFiles = files.filter((f) => f.endsWith(".pdf"));

  console.log(`Found PDF books:`, pdfFiles);

  for (const pdf of pdfFiles) {
    const filePath = path.join(booksDir, pdf);
    const bookId = pdf.replace(".pdf", "");

    console.log(`\n📘 Ingesting book: ${bookId}`);
    await ingestPdf(filePath, bookId);
  }

  console.log("\n✅ All books ingested successfully.");
}

ingestAllBooks().catch((err) => {
  console.error(err);
  process.exit(1);
});
