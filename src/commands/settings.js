const trunc = require("../lib/truncatestr.js");
const hasPermission = require("../lib/discord/haspermission");
module.exports = {
  name: "settings",
  description: "give you your server id",
  documentation: "Give you your server id/login for the settings page.",
  execute(options) {
    let {message, cache, client, dbo, pre} = options;
    if(hasPermission(message, "ADMINISTRATOR")) return message.channel.send("You don't have permission to do that.");
    message.channel.send("DMed you instructions + server id.");
    message.author.send(`Your settings id is **\`${cache.settings[message.guild.id].loginid}\`**. go to https://dredbot--tal0s.repl.co/settings.html to login with that token and change your servers' settings.`);
  }
}