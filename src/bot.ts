import { Telegraf } from "telegraf";
import { Env } from "./config/env";

export const bot:Telegraf = new Telegraf(Env.BOT_TOKEN)