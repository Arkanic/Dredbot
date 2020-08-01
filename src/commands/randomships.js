function comNum(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
module.exports = {
  name: "randomships",
  description: "get 10 random ships",
  documentation: "get 10 ships randomly from the master leaderboard",
  execute(options) {
    let {message, cache, client, dbo, pre} = options;
    let str = "";
    for(let i = 0; i < 10; i++) {
      let ship = cache.leaderboard[Math.floor(Math.random() * cache.leaderboard.length)];
      str += `${ship.ship_name} \`{${ship.hex_code}}\`\n`;
    }
    message.channel.send(str);
  }
}