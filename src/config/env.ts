import dotenv from "dotenv"
dotenv.config()

export const Env = {
    BOT_TOKEN: process.env.BOT_TOKEN || "",
    GOOGLE_GENAI_API_KEY: process.env.GOOGLE_GENAI_API_KEY || ""
}