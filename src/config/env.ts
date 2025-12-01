import dotenv from "dotenv"
dotenv.config()

export const Env = {
    BOT_TOKEN: process.env.BOT_TOKEN || ""
}