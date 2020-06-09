const WebSocket = require("ws");
module.exports = {
  name: "players",
  description: "Display the current amount of players on each server",
  documentation: "Displays the current amount of players online on both servers. Resets every 10 seconds. You can achieve this yourself by sending \"yo\" to d1.drednot.io:4000 and d0.drednot.io:4000 via Websocket.",
  async execute(message, cache, client, dbo, pre) {
    let msg = "";
    for(let i in cache.dredplayers) {
      msg += `**${i}**: ${cache.dredplayers[i].player_count}/${cache.dredplayers[i].player_max}`;
      if(cache.dredplayers[i].player_max - cache.dredplayers[i].player_count <= 0) {
        msg += " [SERVER FULL]";
      }
      msg += "\n"
    }
    message.channel.send(msg);
  }
}