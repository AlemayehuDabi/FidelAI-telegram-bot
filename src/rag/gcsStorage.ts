import { Storage } from '@google-cloud/storage';
import path from 'path';
import fs from 'fs/promises';
import dotenv from 'dotenv';
dotenv.config();

const BUCKET = process.env.GCS_BUCKET!;

if (!BUCKET) {
  throw new Error('GCS_BUCKET is required in .env');
}

// Storage client will pick up GOOGLE_APPLICATION_CREDENTIALS or ADC.
const storage = new Storage({
  projectId: process.env.GCP_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

async function ensureDirExists(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

/**
 * Upload a local file to GCS.
 * Returns the gs:// URI for the uploaded object.
 */
export async function uploadFileToGcs(localPath: string, destName: string) {
  const bucket = storage.bucket(BUCKET);
  await bucket.upload(localPath, {
    destination: destName,
    resumable: false,
    metadata: { cacheControl: 'public, max-age=31536000' },
  });
  return `gs://${BUCKET}/${destName}`;
}

/**
 * Download a GCS object to a local path (used if you need local access).
 */
export async function downloadFileFromGcs(objectName: string, localDir: string) {
  await ensureDirExists(localDir);
  const destPath = path.join(localDir, path.basename(objectName));
  await storage.bucket(BUCKET).file(objectName).download({ destination: destPath });
  return destPath;
}

/** Delete an object from the bucket (best-effort). */
export async function deleteFromGcs(objectName: string) {
  try {
    await storage.bucket(BUCKET).file(objectName).delete();
  } catch (err: any) {
    // ignore not-found to keep flow smooth during demos
    if (err?.code !== 404) throw err;
  }
}

/** Helper to build a gs:// URI without uploading. */
export function gcsUri(objectName: string) {
  return `gs://${BUCKET}/${objectName}`;
}

