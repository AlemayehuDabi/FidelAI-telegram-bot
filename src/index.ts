process.env.NODE_OPTIONS = "--dns-result-order=ipv4first"; 
import { bot } from "./bot";
import { setupStartUi } from "./ui/message";


const bootStrap = async() => {
    setupStartUi(bot)
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
