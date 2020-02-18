module.exports = {
    name: "stop",
    description: "Stop the music.",
    execute(message) {
        const serverQueue = message.client.queue.get(message.guild.id);
        if(!message.member.voiceChannel) return message.channel.send("You have to be in a void channel to stop the songs!");
        serverQueue.songs = [];
        serverQueue.connection.dispatcher.end();
    }
};