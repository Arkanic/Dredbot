module.exports = {
    name: "nowplaying",
    description: "Show the current playing song.",
    execute(message) {
        const serverQueue = message.client.queue.get(message.guild.id);
        if(!serverQueue) return message.channel.send("There isn't anything playing.");
        return message.channel.send(`Now Playing: ${serverQueue.songs[0].title}`);
    }
};