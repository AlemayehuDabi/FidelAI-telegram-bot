import fs from 'fs/promises';
import path from 'path';

const BASE_DIR = path.resolve(process.cwd(), 'local_storage');
const FILES_DIR = path.join(BASE_DIR, 'files');

async function ensureStorageDir() {
  await fs.mkdir(FILES_DIR, { recursive: true });
}

/**
 * Persist a file inside the app's local storage folder.
 * Returns the absolute path to the stored file.
 */
export async function saveLocalFile(sourcePath: string, destName: string) {
  await ensureStorageDir();
  const destPath = path.join(FILES_DIR, destName);
  await fs.copyFile(sourcePath, destPath);
  return destPath;
}

/** Get absolute path for a stored file without touching the fs. */
export function getLocalFilePath(destName: string) {
  return path.join(FILES_DIR, destName);
}

/** Delete a stored file; ignores if it does not exist. */
export async function deleteLocalFile(destName: string) {
  const target = getLocalFilePath(destName);
  try {
    await fs.unlink(target);
  } catch (err: any) {
    if (err?.code !== 'ENOENT') {
      throw err;
    }
  }
}

