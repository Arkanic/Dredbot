module.exports = {
    name: "kick",
    description: "Kick a specified user",
    execute(message) {
        const member = message.mentions.users.first();
        if(!message.member.hasPermission("KICK_MEMBERS")) return message.reply("You don't have permission to do that.");
        if(!message.guild) return message.reply("I can only do that in a server.");
        if(!member) return message.reply("You didn't specify a user, or you tried to kick a role.");
        if(!member.kickable) return message.reply("I can't kick this user.");

        return member.kick().then(() => message.reply(`${member.user.tag} was successfully kicked.`))
        .catch(error => message.reply("Some sort of error happened in the process..."));
    }
};