module.exports = {
    name: "ban",
    description: "Ban a specified user",
    execute(message) {
        const member = message.mentions.users.first();
        if(!message.member.hasPermission("BAN_MEMBERS")) return message.reply("You don't have permission to do that.");
        if(!message.guild) return message.reply("I can only do that in a server.");
        if(!member) return message.reply("You didn't specify a user, or you tried to ban a role.");

        return member.ban().then(() => message.reply(`${member.user.tag} was successfully banned.`)).catch(error => 
        message.reply("Some sort of error happened in the process..."));
    }
}