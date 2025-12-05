import firestore, { EMBEDDINGS_COLLECTION } from './firestoreClient';
import { embedTexts } from './vertexClient';
import { cosineSim } from './utilis';
import dotenv from 'dotenv';
dotenv.config();

interface BookEmbedding {
  bookId: string;
  text: string;
  start: number;
  end: number;
  embedding: number[];
  chunkIndex: number;
  createdAt: Date | FirebaseFirestore.Timestamp;
}

/**
 * Simple retrieval:
 * 1) embed query
 * 2) fetch all chunks for the book from Firestore (small dataset) and compute cosine
 * 3) return top-K chunks
 *
 * For real scale, fetch candidates using Vector Search or use Firestore vector queries if available.
 */
export async function retrieveContext(bookId: string, query: string, topK = 4) {
  const qEmb = (await embedTexts([query]))[0];

  // naive: fetch all embeddings for this book (fine for small books)
  const snapshot = await firestore.collection(EMBEDDINGS_COLLECTION)
    .where('bookId', '==', bookId)
    .get();

  console.log('W/out The Type - Snapshot:', snapshot.docs.map((d) => d.data()));

  const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() as BookEmbedding }));

  const scored = docs.map((d) => ({
    ...d,
    score: cosineSim(qEmb, d.embedding),
  }));

  scored.sort((a, b) => b.score - a.score);

  const top = scored.slice(0, topK);
  const context = top.map((t) => t.text).join('\n\n---\n\n');

  return { top, context };
}
