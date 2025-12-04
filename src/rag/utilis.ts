export function dot(a: number[], b: number[]) {
    return a.reduce((s, v, i) => s + v * b[i], 0);
  }
  export function norm(a: number[]) {
    return Math.sqrt(a.reduce((s, v) => s + v * v, 0));
  }
  export function cosineSim(a: number[], b: number[]) {
    return dot(a, b) / (norm(a) * norm(b) + 1e-10);
  }