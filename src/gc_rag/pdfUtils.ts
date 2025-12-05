import fs from 'fs/promises';
import { PDFParse } from 'pdf-parse';


interface TextChunk {
  text: string;
  start: number;
  end: number;
}

export async function extractTextFromPdf(path: string): Promise<string> {
  const data = await fs.readFile(path);
  const parsed = new PDFParse({data});
  const result = await parsed.getText(); // single big string
  return result.text;
}

/**
 * Simple chunker: splits text by paragraphs and builds chunks with approx token/char target.
 * Tokenization is model-dependent; we use character heuristics (e.g., ~1000 chars ~ 200 tokens).
 */
export function chunkText(text: string, chunkSizeChars = 3000, overlap = 300): TextChunk[] {
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
