import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { Env } from "../config/env";

const llm = new ChatGoogleGenerativeAI({
  temperature: 0.3,
  apiKey: Env.GOOGLE_GENAI_API_KEY,
  // Use a supported model and disable SSE streaming by default.
  // Streaming can cause the library to call the SSE endpoint
  // (streamGenerateContent) which some models or API versions
  // don't support and leads to 404s / long timeouts.
  // Allow overriding the model via `GOOGLE_GENAI_MODEL` env var.
  // Default to a text model which is commonly supported by the
  // generateText/generate endpoints. If you need chat behavior,
  // set `GOOGLE_GENAI_MODEL=models/chat-bison-001` (if supported
  // for your API version) in your environment.
  model: "models/text-bison-001",
  streaming: false,
  maxRetries: 0, 
});

export default llm;