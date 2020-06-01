module.exports = [
  (client, cache) => {
    return {
      status: "online",
      type: "WATCHING",
      name: `${client.guilds.size} Servers.`
    };
  },
  (client, cache) => {
    return {
      status: "online",
      type: "WATCHING",
      name: `${client.users.size} Users.`
    };
  },
  (client, cache) => {
    return {
      status: "online",
      type: "WATCHING",
      name: "for ;help"
    }
  },
  (client, cache) => {
    return {
      status: "online",
      type: "WATCHING",
      name: `${cache.dredplayers.US.player_count} Players on US Server.`
    }
  },
  (client, cache) => {
    return {
      status: "online",
      type: "WATCHING",
      name: `${cache.dredplayers.Poland.player_count} Players on EU Server.`
    }
  }
];