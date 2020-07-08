module.exports = {
  name: "total",
  description: "The totals of everything on the dredbot ship map",
  documentation: "The total points of every one of the 50k ships on the dredbot cache.",
  execute(options) {
    let {message, cache, client, dbo, pre} = options;
    let tp = 0;
    for(let i in cache.leaderboard) {
      tp += parseInt(cache.leaderboard[i].score);
    }
    message.channel.send(`***TOTALS:***\n**Number of ships**: *${cache.leaderboard.length}*\n**Total Points**: *${tp}*`);
  }
}