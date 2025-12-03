import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { Env } from "../config/env";

const llm = new ChatGoogleGenerativeAI({
  temperature: 0.3,
  apiKey: Env.GOOGLE_GENAI_API_KEY,
  // Use a supported Gemini model. The old text-bison-001 is deprecated.
  // Supported models: gemini-1.5-flash, gemini-1.5-pro, gemini-pro
  // Allow overriding the model via `GOOGLE_GENAI_MODEL` env var.
  model: Env.GOOGLE_GENAI_MODEL,
  // Use v1 API version instead of v1beta for better model support
  apiVersion: "v1",
  streaming: false,
  maxRetries: 0, 
});

export default llm;