const gen = require("yet-another-name-generator");
module.exports = {
  name: "generatename",
  description: "Generate a default dred nick",
  documentation: "Generate one of the default nicknames assigned to players. Can be used to impersonate starter players for some... <i>reconnaissance...</i>",
  execute(options) {
    let {message, cache, client, dbo, pre} = options;
    message.channel.send(`\`${gen.generate({the:false, titleize:true, separator:false})}\``);
  }
}