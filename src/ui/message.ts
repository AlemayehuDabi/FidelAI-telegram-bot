import { Markup, type Telegraf } from "telegraf";

export const setupStartUi = (bot: Telegraf) => {
    bot.start(
        async(ctx) => {
            await ctx.reply(
                "👋 <b>Welcome to Fidel — Your AI Tutor!</b>\n\n" +
                "Let's begin learning.\n" +
                "Choose your grade to continue:",
                {
                    parse_mode: "HTML",
                    ...Markup.inlineKeyboard([
                        [Markup.button.callback("📘 Grade 9", "grade_9")],
                        [Markup.button.callback("📘 Grade 10", "grade_10")],
                        [Markup.button.callback("📘 Grade 11", "grade_11")],
                        [Markup.button.callback("📘 Grade 12", "grade_12")]
                    ])
                }
            )

        }
    ),

    // basic action
    bot.action(/grade_.+/, async(ctx) => {
        const selected = ctx.match[0].replace("grade_", "")
        await ctx.answerCbQuery()
        await ctx.reply(`You selected Grade ${selected}.`)
    })

}

