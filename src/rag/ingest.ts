import path from 'path';
import firestore, { EMBEDDINGS_COLLECTION } from './firestoreClient';
import { extractTextFromPdf, chunkText } from './pdfUtils';
import { embedTexts } from './vertexClient';
import { Storage } from '@google-cloud/storage';
import dotenv from 'dotenv';
dotenv.config();

const storage = new Storage();
const BUCKET = process.env.GCS_BUCKET!; // must exist

async function uploadPdfToGcs(localPath: string, destName: string) {
  await storage.bucket(BUCKET).upload(localPath, {
    destination: destName,
    resumable: false,
    metadata: {
      cacheControl: 'public, max-age=31536000',
    },
  });
  return `gs://${BUCKET}/${destName}`;
}

export async function ingestPdf(localPdfPath: string, bookId: string) {
  console.log('Extracting text...');
  const text = await extractTextFromPdf(localPdfPath);
  console.log('Chunking...');
  const chunks = chunkText(text, 3000, 300);

  console.log(`Uploading PDF to Cloud Storage (bucket=${BUCKET})...`);
  const gcsPath = await uploadPdfToGcs(localPdfPath, `${bookId}.pdf`);

  // Save book metadata
  await firestore.collection('books').doc(bookId).set({
    bookId,
    gcsPath,
    numChunks: chunks.length,
    ingestedAt: new Date(),
  });

  console.log('Embedding chunks in batches...');
  const batchSize = 16;
  for (let i = 0; i < chunks.length; i += batchSize) {
    const group = chunks.slice(i, i + batchSize);
    const texts = group.map((g) => g.text);
    const embeddings = await embedTexts(texts); // array of vectors
    const batch = firestore.batch();
    for (let j = 0; j < group.length; j++) {
      const docRef = firestore.collection(EMBEDDINGS_COLLECTION).doc();
      batch.set(docRef, {
        bookId,
        text: group[j].text,
        start: group[j].start,
        end: group[j].end,
        embedding: embeddings[j], // array of numbers
        chunkIndex: i + j,
        createdAt: new Date(),
      });
    }
    await batch.commit();
    console.log(`Committed chunks ${i}..${Math.min(i + batchSize, chunks.length)-1}`);
  }
  console.log('Ingest complete');
}

// Run if executed directly
// for now we will use a wrapper function to ingest the pdfs from the assets folder
if (require.main === module) {
  const localPdf = path.resolve(process.cwd(), '../../assets/books/physics_grade_10.pdf'); // adapt path
  const bookId = 'physics_grade_10';
  ingestPdf(localPdf, bookId).catch((e) => { console.error(e); process.exit(1); });
}
