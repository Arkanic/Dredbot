module.exports = {
    name: "ping",
    description: "Replies with 'pong'",
    execute(message) {
        message.channel.send("pong");
    }
};