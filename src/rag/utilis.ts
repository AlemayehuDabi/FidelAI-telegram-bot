export function dot(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Vector length mismatch: ${a.length} vs ${b.length}`);
  }
  return a.reduce((sum, value, i) => sum + value * b[i]!, 0);
}

export function norm(a: number[]): number {
  return Math.sqrt(a.reduce((sum, value) => sum + value * value, 0));
}

export function cosineSim(a: number[], b: number[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same dimension');
  }
  const denominator = norm(a) * norm(b);
  if (denominator === 0) return 0; // avoid division by zero
  return dot(a, b) / denominator;
}