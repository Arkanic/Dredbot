const regpar = require("regex-parser");
const trunc = require("../lib/truncatestr");

function comNum(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

module.exports = {
  name: "ldb",
  description: "A better Leaderboard",
  documentation: "search through all ships by name; also view the total points for that search. Currently not case-sensitive. Supports advanced regex search. Use -r at the end of the command name (with a space at either side) to use regex formatting. Example: ;ldb -r /[a-z]/i",
  execute(options) {
    let {message, cache, client, dbo, pre} = options;
    let query = message.content.substr(pre.length+1 + this.name.length);
    let matches = [];
    
    message.channel.send("Fetching...").then(msg => {
      msg.delete({timeout:1000});
    });

    if(query.startsWith("-r ")) { // regex
      let regexstr = regpar(query.substr(3));
      matches = cache.leaderboard.filter(s => s.ship_name.match(regexstr));
    } else {
      let lb = cache.leaderboard;
      matches = lb.filter(s => s.ship_name.toLowerCase().includes(query.toLowerCase()));
    }
    let m = "";
    function gss(match) {
      return `\n**${match.x}**: ${match.ship_name.replace(/http/gi, "htpp").replace(/\*/gi, "").replace(/\`/gi, "").replace(/discord.gg/gi, "discord,gg")} (*${comNum(match.score)}pts*) \`{${match.hex_code}}\``;
    }
    if(matches === []) {
      m = "**[No Results]**";
    } else {
      let j = 0;
      for(let i in matches) {
        let nstr = gss(matches[i]);
        if(m.length + nstr.length < 2000) {
          m += nstr;
        } else if(j <= 2) {
          message.channel.send(trunc(m || "**[No Results]**", 2000));
          m = gss(matches[i]);
          j++;
        } else {
          j++;
        }
      }
      if(j == 0) {
        message.channel.send(trunc(m || "**[No Results]**", 2000));
      }
    }
    let tp = 0;
    for(let i in matches) {
      tp += parseInt(matches[i].score);
    }
    message.channel.send(`Total points from the term *${query || "~"}*: **${tp}pts** (${matches.length} ships, out of ${cache.leaderboard.length} ships.)`);
  }
}