module.exports = {
    name: "userinfo",
    description: "Get details about a user",
    execute(message) {
        const member = message.mentions.users.first();
        const user = member.user;
        message.channel.send(`name:${user.username}\nid: ${user.id}\nusername: ${user.lastMessage.member.nickname}`);
    }
};