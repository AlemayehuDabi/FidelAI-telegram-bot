import { Markup } from "telegraf";

/**
 * Post-explanation menu - Professional, organized layout
 * Groups related actions together for better UX
 * 
 * Layout Strategy:
 * - Primary learning actions (Study & Practice) in top section
 * - Visual/Media resources grouped together
 * - Question action as prominent CTA
 * - Navigation always at bottom, clearly separated
 */
export const postExplanationMenu = Markup.inlineKeyboard([
  // Primary Learning Actions
  [
    Markup.button.callback("📝 Lesson Summary", "action_summary"),
    Markup.button.callback("✏️ Practice Questions", "action_practice"),
  ],
  
  // Visual & Media Resources
  [
    Markup.button.callback("🎥 Video Tutorial", "action_video"),
    Markup.button.callback("🖼️ AI Image", "action_image"),
  ],
  
  // Question Action - Prominent
  [
    Markup.button.callback("💬 I Have a Question", "action_question"),
  ],
  
  // Navigation - Always at bottom, visually separated
  [
    Markup.button.callback("⬅️ Back", "nav_back"),
    Markup.button.callback("🏠 Home", "nav_home"),
  ],
]);

