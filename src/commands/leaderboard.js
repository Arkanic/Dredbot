const request = require("request");
module.exports = {
  name: "leaderboard",
  sname: "lb",
  description: "display the top 10 ships in the production servers",
  documentation: "Old leaderboard. Displays the top 10 ships in the production server. Probably not ideal for anything other that looking at the very top ships.",
  execute(message, cache, client) {
    request(`https://master.drednot.io/api/scoreboard?count=25`, (error, response, body) => {
      if (error) {
        message.channel.send(`There was an error.\n\`${error}\``);
        return;
      }
      let shipJSON = JSON.parse(body);
      let embed = require("../assets/js/leaderboard-embed");
      for (let j = 1; j <= 20; j++) {
        if(shipJSON.ships[0]) {
          embed.embed.fields.push({
            "name": shipJSON.ships[0].ship_name,
            "value": "Points: " + shipJSON.ships[0].score + ", Hex: " + shipJSON.ships[0].hex_code
          });
          shipJSON.ships.shift();
        }
      }
      message.channel.send(embed);
    });
  }
}