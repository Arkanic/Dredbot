module.exports = {
    name: "skip",
    description: "Skip a song",
    execute(message) {
        const serverQueue = message.client.queue.get(message.guild.id);
        if(!message.member.voiceChannel) return message.channel.send("You have to be in the voice channel to skip a song!");
        if(!serverQueue) return message.channel.send("There isn't a song to skip.");
        serverQueue.connection.dispatcher.end();
    }
};