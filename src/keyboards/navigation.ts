import { Markup } from "telegraf";

export const backButton = Markup.button.callback("🔙 Back", "back");
export const homeButton = Markup.button.callback("🏠 Home", "home");

export const addNavigation = (button: any[]) => {
    return [...button, [backButton, homeButton]];
}