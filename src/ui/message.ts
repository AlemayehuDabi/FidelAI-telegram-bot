import { Telegraf } from "telegraf";
import { gradeMenu } from "../keyboards/gradeMenu";
import { Grade, subjectMenu, subjectsAfterStream } from "../keyboards/subjectMenu";
import { topicMenu } from "../keyboards/topicMenu";
import { renderMenu } from "./renderer";
import llm from "../llm_call/llm_call";

// Telegram message limit is 4096 characters
const MAX_MESSAGE_LENGTH = 4096;

/**
 * Splits a long message into chunks that fit within Telegram's message limit
 * Tries to split at paragraph boundaries when possible
 */
function splitMessage(text: string, maxLength: number = MAX_MESSAGE_LENGTH): string[] {
  if (text.length <= maxLength) {
    return [text];
  }

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > maxLength) {
    // Try to split at a paragraph break (double newline) first
    const paragraphBreak = remaining.lastIndexOf('\n\n', maxLength);
    // If no paragraph break, try single newline
    const lineBreak = remaining.lastIndexOf('\n', maxLength);
    // If no line break, split at word boundary
    const wordBreak = remaining.lastIndexOf(' ', maxLength);
    
    let splitIndex = paragraphBreak > maxLength * 0.5 ? paragraphBreak 
                   : lineBreak > maxLength * 0.5 ? lineBreak
                   : wordBreak > maxLength * 0.5 ? wordBreak
                   : maxLength;

    chunks.push(remaining.substring(0, splitIndex).trim());
    remaining = remaining.substring(splitIndex).trim();
  }

  if (remaining.length > 0) {
    chunks.push(remaining);
  }

  return chunks;
}

export const setupStartUI = (bot: Telegraf) => {
  // --- /start command ---
  bot.start(async (ctx) => {
    return renderMenu(ctx, "👋 Welcome to Fidel — Your AI Tutor!\n\nChoose your grade:", gradeMenu);
  });

  // --- grade selected ---
  bot.action(/grade_.+/, async (ctx) => {
    console.log("grade selection",ctx.match);
    const grade = Number(ctx.match[0].split("_")[1]) as Grade;
    console.log("this is selected grade:", grade);
    await ctx.answerCbQuery();

    return renderMenu(ctx, `📘 Grade ${grade}\nSelect your subject:`, subjectMenu(grade));
  });

  bot.action(/^stream_(\d+)_(natural|social)$/, async(ctx) => {
  const grade = Number(ctx.match[1]) as 11 | 12;
  const stream = ctx.match[2] as "natural" | "social";

  console.log("stream selection", ctx.match);
  await ctx.answerCbQuery();

  return renderMenu(ctx,
    `You selected ${stream === "natural" ? "🌿 Natural" : "🏛 Social"} Science stream (Grade ${grade})` +
    `\n\nChoose a subject:`,
    subjectsAfterStream(grade, stream)
  );
});

  // --- subject selected ---
  bot.action(/subject_.+/, async (ctx) => {
    const [_, grade, subject] = ctx.match[0].split("_");
    await ctx.answerCbQuery();

    if(!grade || !subject) {
      return ctx.reply("❌ Invalid selection. Please try again.");
    }

    return renderMenu(
      ctx,
      `📚 ${subject}\nChoose a topic:`,
      topicMenu(Number(grade), subject)
    );
  });

  // --- topic selected ---
 bot.action(/topic_.+/, async (ctx) => {
  const parts = ctx.match[0].split("_");
  const grade = parts[1];
  const subject = parts[2];
  const topic = parts.slice(3).join(" ");

  console.log("Topic selected:", { grade, subject, topic });

  // Remove loading spinner instantly
  await ctx.answerCbQuery("Generating explanation... ⚡");

  // Show a temporary message so user knows it's working
  const loadingMsg = await ctx.reply(
    `🔄 Generating explanation for <b>${topic}</b> (${subject}, Grade ${grade})...\nThis can take 10–30 seconds.`,
    { parse_mode: "HTML" }
  );

  
  try {
    const prompt = `Give a clear, detailed, and student-friendly explanation of "${topic}" in ${subject} for Grade ${grade} (Ethiopian curriculum). Use simple language, examples, and short paragraphs.`;

    // 1. Create a logic to abort the request if it takes too long (e.g., 25 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); 

    // 2. Pass the signal to the invoke call
    const response = await llm.invoke(prompt, {
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId); // Clear timer if successful

    const text = typeof response.content === "string" 
      ? response.content 
      : "No explanation generated.";

    const header = `✨ <b>${topic}</b> – ${subject} (Grade ${grade})\n\n`;
    const fullMessage = header + text;
    
    // Split message into chunks if it's too long
    const chunks = splitMessage(fullMessage, MAX_MESSAGE_LENGTH);
    
    // Ensure we have at least one chunk
    if (chunks.length === 0) {
      throw new Error("Failed to split message");
    }
    
    // Edit the loading message with the first chunk
    await ctx.telegram.editMessageText(
      ctx.chat!.id,
      loadingMsg.message_id,
      undefined,
      `${chunks[0]!}`,
      { parse_mode: "HTML" }
    );

    // Send remaining chunks as new messages
    for (let i = 1; i < chunks.length; i++) {
      await ctx.reply(`${chunks[i]!}`, { parse_mode: "HTML" });
    }

  } catch (error: any) {
    console.error("LLM failed:", error);

    let userMessage = "Sorry, I couldn't generate the explanation right now. Please try again.";

    // Handle the specific Abort/Timeout error
    if (error.name === "AbortError" || error.name === "TimeoutError") {
      userMessage = "⚠️ The AI is taking too long to respond. Please try again in a few seconds.";
    }
    // Handle API key/model not found errors
    else if (error.message?.includes("404") || error.message?.includes("not found")) {
      userMessage = "❌ AI service configuration error. Please contact the bot administrator.\n\n(API key may need Generative Language API enabled in Google Cloud Console)";
    }
    // Handle authentication errors
    else if (error.message?.includes("401") || error.message?.includes("403") || error.message?.includes("API key")) {
      userMessage = "❌ AI service authentication error. Please contact the bot administrator.\n\n(API key may be invalid or missing permissions)";
    }

    // Wrap this in a try/catch too, in case the message was deleted by the user
    try {
      await ctx.telegram.editMessageText(
        ctx.chat!.id,
        loadingMsg.message_id,
        undefined,
        userMessage
      );
    } catch (e) {
      console.log("Could not update error message (user might have blocked bot or deleted chat)");
    }
  }
});

  // --- Navigation ---
  bot.action("nav_home", async (ctx) => {
    await ctx.answerCbQuery();
    return renderMenu(ctx, "🏠 Home — Select Grade", gradeMenu);
  });

  bot.action("nav_back", async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply("🔙 Back button pressed.\n(We will implement state soon.)");
  });
};
