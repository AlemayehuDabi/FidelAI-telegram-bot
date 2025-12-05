import { Markup } from "telegraf";

/**
 * Professional navigation buttons with consistent styling
 * Designed for mobile-first, teen-friendly experience
 */
export const backButton = Markup.button.callback("⬅️ Back", "nav_back");
export const homeButton = Markup.button.callback("🏠 Home", "nav_home");

/**
 * Adds professional navigation bar to any menu
 * Navigation buttons are always prominent and easy to tap
 */
export const addNavigation = (rows: any[][]) => [
  ...rows,
  [
    backButton,
    homeButton,
  ],
];