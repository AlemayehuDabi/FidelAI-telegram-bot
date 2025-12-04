import fs from 'fs/promises';
import pdfParse from 'pdf-parse';

export async function extractTextFromPdf(path: string): Promise<string> {
  const data = await fs.readFile(path);
  const parsed = await pdfParse(data);
  return parsed.text; // single big string
}

/**
 * Simple chunker: splits text by paragraphs and builds chunks with approx token/char target.
 * Tokenization is model-dependent; we use character heuristics (e.g., ~1000 chars ~ 200 tokens).
 */
export function chunkText(text: string, chunkSizeChars = 3000, overlap = 300) {
  const chunks: { text: string; start: number; end: number }[] = [];
  let pos = 0;
  while (pos < text.length) {
    const end = Math.min(text.length, pos + chunkSizeChars);
    const chunk = text.slice(pos, end).trim();
    if (chunk.length > 20) {
      chunks.push({ text: chunk, start: pos, end });
    }
    pos = Math.max(pos + chunkSizeChars - overlap, end);
  }
  return chunks;
}
