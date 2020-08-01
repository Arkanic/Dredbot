const reactionHandler = require("../lib/discord/reactionhandler");
module.exports = {
  name: "test",
  description: "dev testing command",
  documentation: "dev testing command",
  execute(options) {
    let {message, cache, client, dbo, pre} = options;
    reactionHandler(message, ["👍", "👎"], 60000, (collected) => {
      const reaction = collected.first();
      message.channel.send(reaction.emoji.name);
    }, (collected) => {
      message.channel.send(`No emoji detected.`);
    });
  }
};