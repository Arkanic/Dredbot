const fs = require("fs");
module.exports = {
  name: "help",
  description: "List all available commands",
  documentation: "List all the available commands and their descriptions. Run this when you first instsall dredbot to get a good idea of what commands you want to use.",
  execute(message, cache, client) {
    let li = "";
    const commandNs = fs.readdirSync("./src/commands").filter(file => file.endsWith(".js"));
    for(const commandN of commandNs) {
      const command = require(`./${commandN}`);
      li += `Name: \`${command.name}\`, Description: \`${command.description}\`\n`;
    }
    message.channel.send({
      "embed": {
        "title": "Dredbot is still in development",
        "description": "ATM the prefix is locked to \";\", I will probably implement a way to have custom prefixes sometime in the future.",
      }
    });
    message.channel.send(li);
  }
}