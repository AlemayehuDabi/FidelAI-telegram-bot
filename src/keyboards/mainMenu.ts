import { Markup } from "telegraf";

/**
 * Main menu - First impression matters!
 * Modern, engaging, and clear call-to-actions
 */
export const mainMenu = Markup.inlineKeyboard([
  [
    Markup.button.callback("🎓 Start Learning", "mode_explain"),
  ],
  [
    Markup.button.callback("💬 Ask a Question", "mode_question"),
  ],
]);

