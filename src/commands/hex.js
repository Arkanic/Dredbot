function comNum(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
module.exports = {
  name: "hex",
  description: "Get info about ship from it's hex code",
  documentation: "Get information about a ship from it's hex code.",
  execute(options) {
    let {message, cache, client, dbo, pre} = options;
    let query = message.content.split(" ")[1];
    let match = cache.leaderboard.filter(s => s.hex_code.toLowerCase() == query.toLowerCase())[0];
    if(match) {
      const embed = {
        color: match.color,
        title: match.ship_name,
        fields: [
          {
            name: "Points",
            value: comNum(match.score),
            inline: true
          },
          {
            name: "Leaderboard Placement",
            value: match.x,
            inline: false
          },
          {
            name: "Hex Code",
            value: match.hex_code,
            inline: true
          }
        ],
        timestamp: new Date()
      };
      message.channel.send({embed});
    } else {
      message.channel.send("**There is no ship with that hex code.**");
    }
  }
}