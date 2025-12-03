import { Context, Markup } from "telegraf";

export const renderMenu = async (
  ctx: Context,
  title: string,
  menu: ReturnType<typeof Markup.inlineKeyboard>
) => {
  await ctx.reply(`<b>${title}</b>`, {
    parse_mode: "HTML",
    ...menu,
  });
};
