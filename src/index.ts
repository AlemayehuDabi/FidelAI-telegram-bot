import { bot } from "./bot.js";


const bootStrap = async() => {
    bot.launch()
    console.log("🚀 Fidel UI Bot is running...");
}

bootStrap()

// signal interupt for control c
process.once("SIGINT", () => {
    console.log("terminal stoped")
    bot.stop("SIGINT")
})

// signal terminate for deployment
process.once("SIGTERM", () => {
    bot.telegram.sendMessage("1" ,"Bot is going offline for restart/maintenance")
    bot.stop("SIGTERM")
})
