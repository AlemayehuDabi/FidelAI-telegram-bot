import { Markup } from "telegraf";

/**
 * Builds the inline keyboard for a topic's learning-mode menu.
 * Example: Algebra → Linear Equations
 */
export const topicLearningModeKeyboard = (topicId: string) => {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback("📖 Lesson Summary", `lesson_summary:${topicId}`),
    ],
    [
      Markup.button.callback("🧑 Practice Questions", `practice:${topicId}`),
    ],
    [
      Markup.button.callback("🎥 Video Tutorial", `video:${topicId}`),
    ],
    [
      Markup.button.callback("🖼️ AI Image Explanation", `image_explain:${topicId}`),
    ],
    [
      Markup.button.callback("⬅ Home", `home`),
    ],
  ]);
};
