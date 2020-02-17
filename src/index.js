const fs = require("fs");
const Discord = require("discord.js");
const Client = require("./handler/Client");
const {prefix} = require("./config/config.json");

const client = new Client();
client.commands = new Discord.Collection();

const commands = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
for(const file of commands) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.once("ready", () => {
    console.log("<Ready>");
});
client.once("reconnecting", () => {
    console.log("<reconnecting>");
});
client.once("disconnect", () => {
    console.log("<disconnect>");
});

client.on("message", async message => {
    const args = message.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName);

    if(message.author.bot) return;
    if(!message.content.startsWith(prefix)) return;
    if(!command) return message.reply("That isn't a command!");

    try {
        command.execute(message);
    } catch(error) {
        console.log(error);
        message.channel.send("There was an error.\n```" + error + "```");
    }
});

client.login(process.env.BOT_TOKEN);