import { Telegraf } from "telegraf";
import { gradeMenu } from "../keyboards/gradeMenu";
import { Grade, subjectMenu, subjectsAfterStream } from "../keyboards/subjectMenu";
import { topicMenu } from "../keyboards/topicMenu";
import { renderMenu } from "./renderer";

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
    const topic = parts.slice(3).join("_");

    await ctx.answerCbQuery();

    await ctx.reply(
      `✨ <b>${topic}</b> in <b>${subject}</b> (Grade ${grade})\n\n` +
        `This is where the AI explanation will come.`,
      { parse_mode: "HTML" }
    );
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
