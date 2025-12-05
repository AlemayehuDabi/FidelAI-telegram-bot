import { GoogleAuth } from 'google-auth-library';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const PROJECT = process.env.GCP_PROJECT!;
const LOCATION = process.env.VERTEX_LOCATION || 'us-central1';
// model identifier — gemini embedding on Vertex
const MODEL_ID = 'publishers/google/models/gemini-embedding-001';

async function getAccessToken() {
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  if (!tokenResponse || !tokenResponse.token) {
    throw new Error('Failed to get access token');
  }
  return tokenResponse.token;
}

/**
 * Embed a list of texts (batch).
 * Returns array of floats[] per input (embedding vectors).
 */
export async function embedTexts(texts: string[]) {
  const accessToken = await getAccessToken();

  // Global endpoint pattern for Vertex Generative/Embeddings
  const url = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT}/locations/${LOCATION}/${MODEL_ID}:embed`;

  const body = {
    instances: texts.map((t) => ({ content: t })),
    // optional: specify output config e.g. dimension reduction
    parameters: {
      // e.g. outputDimension: 1536
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Vertex embed error: ${res.status} ${txt}`);
  }

  const json = await res.json();
  // Response shape: { predictions: [ { embeddings: [...] } , ... ] } or { embeddings: [...] } depending on API
  // We'll try to find embeddings in the common patterns:
  const embeddings: number[][] =
    (json as any)?.predictions?.map((p: any) => p?.embedding ?? p?.embeddings) ??
    (json as any)?.embeddings ??
    [];

  // Normalise extraction if nested
  return embeddings.map((e: any) => Array.isArray(e) ? e : (e?.values ?? e));
}
