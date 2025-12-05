import { MongoClient } from "mongodb";
import "dotenv/config";
// import { GoogleGenerativeAI } from "@google/generative-ai";
import { pipeline } from "@xenova/transformers";


// const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY!);
// const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

// xenova
let embedder: any = null;

// Lazily load a local, free embedding model (no external API / quotas)
async function getEmbedder() {
  if (!embedder) {
    embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", {
      quantized: true, // smaller, faster CPU inference
    });
  }
  return embedder;
}


const client = new MongoClient(process.env.MONGODB_URI!);

export async function search(query: string, ctx: any, loadingMsg: any, topK = 5): Promise<string[]> {
  await client.connect();
  const db = client.db();
  const collection = db.collection("chunks");

  await ctx.telegram.editMessageText(
    ctx.chat!.id,
    loadingMsg.message_id,
    undefined,
    "Semantic Search....",
    { parse_mode: "HTML" }
  );


  // Generate embedding for the user's query
  // const embedResult = await embeddingModel.embedContent(query);

  // console.log("embed-result", embedResult.embedding.values)


  // Correct way to extract the vector (handles both single and batch)
  // const queryVector = Array.isArray(embedResult.embedding)
  //   ? embedResult.embedding[0].values   // batch mode
  //   : embedResult.embedding.values;     // single string mode


  // xenova
  const model = await getEmbedder();

  // Generate embedding for the query (local, free model)
  const output: any = await model(query, { pooling: "mean", normalize: true });
  const queryVector: number[] = Array.from(
    output.data ? output.data : output[0].data ?? output[0]
  );

  // Atlas Vector Search pipeline
  const results = await collection
    .aggregate([
      {
        $vectorSearch: {
          index: "pdf_vector_index",
          path: "embedding",
          queryVector: queryVector,
          limit: topK,
          numCandidates: 100
        },
      },
      {
        $project: {
          text: 1,
          score: { $meta: "vectorSearchScore" },
          _id: 0,
        },
      },
    ])
    .toArray();

  await client.close();

  console.log("sematic search result: ", results)

  // Return just the raw text chunks
  return results.map((r: any) => r.text);
}