import { MongoClient, Collection } from "mongodb";
import fs from "fs";
import path from "path";
import { PDFParse } from "pdf-parse";
import { pipeline } from "@xenova/transformers";
import "dotenv/config";

// ========================= CONFIG =========================
const CHUNK_SIZE = 1000;          // characters per chunk
const CHUNK_OVERLAP = 200;        // overlap between chunks
const BATCH_SIZE = 20;            // Gemini allows up to 20 texts per batch
const EMBED_DELAY_MS = 200;       // small delay to avoid rate limits
const PDF_FOLDER = "./src/assets/books";  // change if needed

// ========================= INIT =========================
const client = new MongoClient(process.env.MONGODB_URI!);
let collection: Collection;
let embedder: any = null;

// Lazily load a local, free embedding model (no external API / quotas)
async function getEmbedder() {
  if (!embedder) {
    embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", {
      quantized: true, // smaller, faster CPU inference
    });
  }
  return embedder;
}

// ========================= DB CONNECTION =========================
async function connectDB() {
  await client.connect();
  const db = client.db(); // or client.db("your_db_name") if you want to specify
  collection = db.collection("chunks");
  console.log("Connected to MongoDB Atlas");
}

// ========================= SAFE CHUNKING =========================
function chunkText(text: string): string[] {
  const chunks: string[] = [];
  if (!text || text.trim().length === 0) return chunks;

  // Normalize whitespace (very helpful for scanned PDFs)
  text = text.replace(/\s+/g, " ").trim();

  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    const chunk = text.slice(start, end).trim();

    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    if (end === text.length) {
      break; // reached the end, avoid infinite loop when overlap exceeds remainder
    }

    start = end - CHUNK_OVERLAP;
    if (start >= text.length || start < 0) break;
  }

  return chunks;
}

// ========================= BATCH EMBEDDING (Fixed for latest Gemini SDK) =========================
async function embedBatch(texts: string[]): Promise<number[][]> {
  const model = await getEmbedder();
  const embeddings: number[][] = [];

  for (const text of texts) {
    const output: any = await model(text, {
      pooling: "mean",
      normalize: true,
    });
    const vector: number[] = Array.from(
      output.data ? output.data : output[0].data ?? output[0]
    );
    embeddings.push(vector);
  }

  return embeddings;
}

// ========================= INGEST SINGLE PDF =========================
async function ingestPdf(pdfPath: string) {
  if (!fs.existsSync(pdfPath)) {
    console.warn(`File not found: ${pdfPath}`);
    return;
  }

  console.log(`\nProcessing: ${path.basename(pdfPath)}`);

  const buffer = fs.readFileSync(pdfPath);
  const parser = new PDFParse({ data: buffer });
  const data = await parser.getText();

  let text = data.text;
  const pageCount = data.total ?? data.pages?.length ?? 0;
  console.log(`Extracted ${text.length.toLocaleString()} characters from ${pageCount} pages`);

  const chunks = chunkText(text);
  console.log(`Split into ${chunks.length} chunks`);

  // Process in batches
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batchTexts = chunks.slice(i, i + BATCH_SIZE);
    const embeddings = await embedBatch(batchTexts);

    const documents = batchTexts.map((chunkText, idx) => ({
      pdfName: path.basename(pdfPath),
      chunkIndex: i + idx,
      text: chunkText,
      embedding: embeddings[idx],
      pageCount,
      ingestedAt: new Date(),
    }));

    await collection.insertMany(documents);

    console.log(`  Indexed batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(chunks.length / BATCH_SIZE)} (${i + batchTexts.length}/${chunks.length} chunks)`);

    // Gentle delay to stay under Gemini rate limits
    if (EMBED_DELAY_MS > 0) {
      await new Promise((resolve) => setTimeout(resolve, EMBED_DELAY_MS));
    }
  }

  console.log(`Finished indexing ${path.basename(pdfPath)}\n`);
}

// ========================= MAIN =========================
async function main() {
  await connectDB();

  const pdfFiles = fs.readdirSync(PDF_FOLDER)
    .filter((file) => file.toLowerCase().endsWith(".pdf"))
    .map((file) => path.join(PDF_FOLDER, file));

  if (pdfFiles.length === 0) {
    console.log(`No PDFs found in ${PDF_FOLDER}`);
    await client.close();
    return;
  }

  console.log(`Found ${pdfFiles.length} PDF(s) to process\n`);

  for (const file of pdfFiles) {
    try {
      await ingestPdf(file);
    } catch (err) {
      console.error(`Failed to process ${file}:`, err);
    }
  }

  await client.close();
  console.log("All PDFs successfully ingested!");
}

// ========================= RUN =========================
main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});