import { Markup } from "telegraf";

export const postExplanationMenu = Markup.inlineKeyboard([
  [Markup.button.callback("📖 Lesson Summary", "action_summary")],
  [Markup.button.callback("🧑 Practice Questions", "action_practice")],
  [
    Markup.button.callback("🎥 Video Tutorial", "action_video"),
    Markup.button.callback("🖼️ AI Image Explanation", "action_image"),
  ],
  [Markup.button.callback("❓ I Have a Question", "action_question")],
  [
    Markup.button.callback("⬅️ Back", "nav_back"),
    Markup.button.callback("🏠 Home", "nav_home"),
  ],
]);

