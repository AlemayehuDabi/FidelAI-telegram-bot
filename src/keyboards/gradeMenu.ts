import { Markup } from "telegraf";
import { addNavigation } from "./navigation";

/**
 * Grade selection menu - Professional 2x2 grid layout
 * Optimized for mobile, visually balanced and engaging
 */
export const gradeMenu = Markup.inlineKeyboard(
  addNavigation([
    [
      Markup.button.callback("9️⃣ Grade 9", "grade_9"),
      Markup.button.callback("🔟 Grade 10", "grade_10"),
    ],
    [
      Markup.button.callback("1️⃣1️⃣ Grade 11", "grade_11"),
      Markup.button.callback("1️⃣2️⃣ Grade 12", "grade_12"),
    ],
  ])
);
