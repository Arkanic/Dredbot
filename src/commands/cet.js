module.exports = {
  name: "cet",
  description: "-",
  documentation: "test feature.",
  execute(message, cache, client, dbo, pre) {
    message.react("719056273194090526");
    const emoji = client.emojis.find(emoji => emoji.name === "ayy");
    message.channel.send(emoji);
  }
}