import { Firestore } from '@google-cloud/firestore';
import dotenv from 'dotenv';
dotenv.config();

const projectId = process.env.GCP_PROJECT;
const keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!projectId) {
  throw new Error('GCP_PROJECT is not defined in .env');
}

// Firestore will use the provided service account JSON if keyFilename is set,
// otherwise Application Default Credentials (e.g., gcloud auth application-default login).
const firestore = new Firestore({
  projectId,
  keyFilename,
});

export const BOOKS_COLLECTION = 'books';
export const EMBEDDINGS_COLLECTION = 'book_chunks';

export default firestore;
