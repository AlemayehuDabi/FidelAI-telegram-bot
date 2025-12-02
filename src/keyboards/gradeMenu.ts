import { Markup } from "telegraf";

export const gradeMenu = Markup.inlineKeyboard([
  [Markup.button.callback("📘 Grade 9", "grade_9")],
  [Markup.button.callback("📗 Grade 10", "grade_10")],
  [Markup.button.callback("📙 Grade 11", "grade_11")],
  [Markup.button.callback("📕 Grade 12", "grade_12")],
]);
