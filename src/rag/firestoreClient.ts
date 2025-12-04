import { Firestore } from '@google-cloud/firestore';
import dotenv from 'dotenv';
dotenv.config();

const firestore = new Firestore();

export const BOOKS_COLLECTION = 'books';
export const EMBEDDINGS_COLLECTION = 'book_chunks';

export default firestore;
