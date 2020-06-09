module.exports = {
  name: "settings",
  description: "Various server-specific settings",
  documentation: "Change the bot's prefix for the server.",
  execute(message, cache, client, dbo, pre) {
    if(!message.member.hasPermission("ADMINISTRATOR")) return message.channel.send("**You don't have permission to do that!**");
    let newpre = message.content.substr(pre.length+1 + this.name.length);
    let query = {id: message.guild.id};
    cache.settings[message.guild.id].settings.prefix = newpre;
    console.log(cache.settings[message.guild.id]);
    let newvalues = {$set:{settings:{prefix:newpre}}};
    dbo.collection("settings").updateOne(query, newvalues, (err, res) => {
      if(err) throw err;
      message.channel.send(`**Prefix updated to \`${newpre}\`.**`);   
    });
  }
}