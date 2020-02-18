const {Util} = require("discord.js");
const ytdl = require("ytdl-core");

module.exports = {
    name: "play",
    description: "Play a song in your current voice channel",
    execute(message) {
        try {
            const args = message.content.split(" ");
            const queue = message.client.queue;
            const serverQueue = message.client.queue.get(message.guild.id);

            const voiceChannel = message.member.voiceChannel;
            if(!voiceChannel) return message.channel.send("You need to be in a voice channel!");
            const permissions = voiceChannel.permissionsFor(message.client.user);
            if(!permissions.has("CONNECT") || !permissions.has("SPEAK")) return message.channel.send("I don\'t have permission to be in this voice channel!");

            const songInfo = await ytdl.getInfo(args[1]);
            const song = {
                title: songInfo.title,
                url: songInfo.video_url
            };

            if(!serverQueue) {
                const queueConstruct = {
                    textChannel: message.channel,
                    voiceChannel: voiceChannel,
                    connection: null,
                    songs: [],
                    volume: 5,
                    playing: true
                };

                queue.set(message.guild.id, queueConstruct);
                queueConstruct.songs.push(song);

                try {
                    let connection = await voiceChannel.join();
                    queueConstruct.connection = connection;
                    this.play(message, queueConstruct.songs[0]);
                } catch(error) {
                    console.log(error);
                    queue.delete(message.guild.id);
                    return message.channel.send(error);
                }
            } else {
                serverQueue.songs.push(song);
                return message.channel.send(`${song.title} has been added to the queue.`);
            }
        } catch(error) {
            console.log(error);
            message.channel.send(error.message);
        }
    },
    play(message, song) {
        const queue = message.client.queue;
        const guild = message.guild;
        const serverQueue = queue.get(message.guild.id);

        if(!song) {
            serverQueue.voiceChannel.leave();
            queue.delete(guild.id);
            return;
        }

        const dispatcher = serverQueue.connection.playStream(ytdl(song.url, {filter: "audioonly"})).on("end", () => {
            serverQueue.songs.shift();
            this.play(message, serverQueue.songs[0]);
        }).on("error", error => {
            console.log(error);
        });
        dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    }
};