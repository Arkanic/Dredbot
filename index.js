/*
Made by Arkanic.
don't mind this mess of completely undocumented code.
*/


const discord = require("discord.js");
const client = new discord.Client();
const http = require("http");
const path = require("path");
const fs = require("fs");
const url = require("url");
const server = http.createServer(handleRequest);
const port = process.env.PORT || 8000;
let __dirname = path.resolve();

server.listen(port);
function handleRequest(request, response) {
  let pathname = request.url;
  if(pathname == "/") {
    pathname = "/index.html";
  }
  pathname = "/client" + pathname;
  let ext = path.extname(pathname);
  let typeExt = {
    ".html": "text/html",
    ".htm": "text/html",
    ".css": "text/css",
    ".js": "text/javascript",
    ".png": "image/png",
    ".jpg": "image/jpg"
  };
  let contentType = typeExt[ext] || "text/plain";
  fs.readFile(__dirname + pathname, (error, data) => {
    if(error) {
      console.log("request for " + pathname + " resulted with 500");
      response.writeHead(500);
      return response.end("Error loading: " + pathname);
    } else {
      console.log("Sent " + pathname + " (" + contentType + ")");
      response.writeHead(200, {"Content-Type": contentType});
      return response.end(data);
    }
  });
}

client.on("ready", () => {
  client.user.setActivity("Just started up! *yawn*");
  console.log("Watching " + client.guilds.size + " servers, or " + client.users.size + " users.");
});

client.on("guildCreate", guild => {
  console.log("Nikl::guildCreate")
  let channel = guild.channels.find(ch => ch.name === "general");
  if(!channel) return;
  channel.send("Heyo, thanks for using nikl!\n```To find out more, use the command n!help.```");
});

client.on("message", message => {
  if(message.content.startsWith("n!")) {
    if(commands[message.content.substr(2).split(" ")[0]]) {
      try{commands[message.content.substr(2).split(" ")[0]].run(message);}catch(error){message.channel.send(error || "undefined error")};
    } else {
      message.reply("That isn\'t a command!");
    }
  }
});

client.on("guildMemberAdd", member => {
  let channel = member.guild.channels.find(ch => ch.name === "log");
  if(!channel) {
    channel = member.guild.channels.find(ch => ch.name === "member-log");
  };
  if(!channel) return;
  channel.send(`Welcome to our server, ${member}`);
});

client.on("guildMemberRemove", member => {
  let channel = member.guild.channels.find(ch => ch.name === "log");
  if(!channel) {
    channel = member.guild.channels.find(ch => ch.name === "member-log");
  }
  if(!channel) return;
  channel.send(`${member} has left the server.`);
});

setInterval(() => {
  switch(Math.floor(Math.random() * 2)) {
    case 0:
      client.user.setActivity(client.guilds.size + " servers.");
      break;
    case 1:
      client.user.setActivity(client.users.size + " users.");
      break;
    case 2:
      client.user.setActivity("Game");
      break;
    default:
      client.user.setActivity("Breaking from the inside");
      break;
  }
}, 10000);

client.login(process.env.BOT_TOKEN);





/*
//
// c o m m a n d s
//
*/



const types = ["moderator", "fun", "music"];

const commands = {
  "ping": {
    "run": function(message) {
      message.channel.send("pong");
    },
    "description": "The first command implemented, replies with \"pong\"",
    "type": "utility"
  },
  "kick": {
    "run": function(message) {
      if(!message.member.hasPermission("KICK_MEMBERS")) return message.reply("You aren\'t an admin!");
      if(!message.guild) return message.reply("I can only do that in a guild!");
      const user = message.mentions.users.first();
      if(!user) return message.reply("You didn\'t mention the user to kick!");
      const member = message.guild.member(user);
      if(!member) return message.reply("That isn\'t a user in this guild!");
      member.kick("Kicked by bot (nikl)").then(() => {
        message.reply("Successfully kicked " + user.tag);
      }).catch(err => {
        message.reply("I was unable to kick " + user.tag);
      });
    },
    "description": "Kicks the pinged user",
    "type": "moderator"
  },
  "ban": {
    "run": function(message) {
      if(message.member.hasPermission("BAN_MEMBERS")) {
        if(message.guild) {
          const user = message.mentions.users.first();
          if(user) {
            const member = message.guild.member(user);
            if(member) {
              member.ban({
                reason: "They were mean!"
              }).then(() => {
                message.reply("Successfully banned " + user.tag);
              }).catch(err => {
                message.reply("I was unable to kick " + user.tag + "!");
              });
            } else {
              message.reply("That isn\'t a member in this guild!");
            }
          } else {
            message.reply("You didn\'t mention the user to kick!");
          }
        } else {
          message.reply("I can only do that in a guild!");
        }
      } else {
        message.reply("You don\'t have admin permissions!");
      }
    },
    "description": "Bans the pinged user",
    "type": "moderator"
  },
  "8ball": {
    "run": function(message) {
      switch(Math.floor(Math.random() * 18)) {
        case 0:
          message.reply("It is decidedly so."); //y
          break;
        case 1:
          message.reply("Without a doubt"); //y
          break;
        case 2:
          message.reply("Yes - definitely"); //y
          break;
        case 3:
          message.reply("You may rely on it"); //y
          break;
        case 4:
          message.reply("As I see it, yes"); //y
          break;
        case 5:
          message.reply("Most likely"); //y
          break;
        case 6:
          message.reply("Outlook good"); //y
          break;
        case 7:
          message.reply("Yes"); //y
          break;
        case 8:
          message.reply("Signs point to yes"); //m
          break;
        case 9:
          message.reply("Reply hazy, try again."); //m
          break;
        case 10:
          message.reply("Ask again later"); //m
          break;
        case 11:
          message.reply("Better not tell you now"); //m
          break;
        case 12:
          message.reply("Cannot predict now"); //m
          break;
        case 13:
          message.reply("Concentrate and ask again"); //m
          break;
        case 14:
          message.reply("Don't count on it"); //n
          break;
        case 15:
          message.reply("My reply is no"); //n
          break;
        case 16:
          message.reply("My sources say no"); //n
          break;
        case 17:
          message.reply("No");
          break;
        case 18:
          message.reply("Nope.");
          break;
        default:
          message.reply("I can\'t figure that out."); //?
          break;
      }
    },
    "description": "Answer your questions.",
    "type": "fun"
  },
  "tableflip": {
    "run": function(message) {
      message.channel.send("(╯°□°）╯︵ ┻━┻");
    },
    "description": "(╯°□°）╯︵ ┻━┻",
    "type": "fun"
  },
  "unflip": {
    "run": function(message) {
      message.channel.send(" ┬─┬ ノ( ゜-゜ノ)");
    },
    "description": " ┬─┬ ノ( ゜-゜ノ)",
    "type": "fun"
  },
  "shrug": {
    "run": function(message) {
      message.channel.send("¯\\_(ツ)_/¯");
    },
    "description": "¯\\_(ツ)_/¯",
    "type": "fun"
  },
  "hexamethylenetetramine": {
    "run": function(message) {
      message.channel.send("Yes.", {files: ["https://www.sigmaaldrich.com/content/dam/sigma-aldrich/structure6/011/mfcd00006895.eps/_jcr_content/renditions/mfcd00006895-large.png"]});
    },
    "description": "Display some tasty hexamethylenetetramine",
    "type": "fun"
  },
  "spam": {
    "run": function(message) {
      if(message.member.hasPermission("ADMINISTRATOR")) {
        if(message.guild) {
          for(let i = 0; i < 10; i++) {
            message.channel.send("@everyone");
          }
        } else {
          message.reply("I can only do that in a guild!");
        }
      } else {
        message.reply("You don\'t have admin permissions!");
      }
    },
    "description": "spam",
    "type": "utility"
  },
  "nick": {
    "run": function(message) {
      if(message.content.replace("n!nick", "").length > 32) return message.reply("That nickname is too long!");
      message.member.setNickname(message.content.replace("n!nick", ""));
    },
    "description": "Change your nickname for this server",
    "type": "utility"
  },
  "say": {
    "run": function(message) {
      message.channel.send(message.content.substr(6));
    },
    "description": "Make the bot say whatever you want",
    "type": "fun"
  },
  "ree": {
    "run" :function(message) {
      message.channel.send("REEEEEEEEEEEEEEEEEEEEEEE", {files: ["https://media.tenor.com/images/ffc3ac4648c1a3c7aa890589b09dc8aa/tenor.gif"]});
    },
    "description": "REEEEEEEEEEEEEEEEEEEEEEEEEEE",
    "type": "fun"
  },
  "invite": {
    "run": function(message) {
      message.channel.send("https://discordapp.com/api/oauth2/authorize?client_id=637868014926168124&permissions=8&scope=bot");
    },
    "description": "Invite this bot to another server of yours ;)",
    "type": "utility"
  },
  "purge": {
    "run": function(message) {
      if(message.member.hasPermission("DELETE_MESSAGES")) {
        const user = message.mentions.users.first();
        const amount = !!parseInt(message.content.split(" ")[1]) ? parseInt(message.content.split(" ")[1]) : parseInt(message.content.split(" ")[2]);
        if(!amount) return message.reply("Please specify an amount to delete!");
        if(!amount && !user) return message.reply("You must specify an amount, or a specific user and amount to delete!");
        message.channel.fetchMessages({
          limit: 100
        }).then(messages => {
          if(user) {
            const filterby = user ? user.id : Client.user.id;
            messages = messages.filter(m => m.author.id === filterby).array().slice(0, amount);
          }
          message.channel.bulkDelete(messages).catch(error => console.log(error.stack));
        });
      } else {
        message.reply("You don\'t have admin permissions!");
      }
    },
    "description": "purge a specific amount of messages, or a specific amount of messages from a single user.",
    "type": "moderator"
  },
  "unban": {
    "run": function(message) {
      if(message.member.hasPermission("ADMINISTRATOR")) {
        const user = message.mentions.users.first();
        if(user) {
          guild.unban(member).then(user => {
            message.reply("Successfully unbanned " + user.tag);
          }).catch(error => {
            message.reply("I couldn\'t unban the user!");
          });
        } else {
          message.reply("Please specify a user!");
        }
      } else {
        message.reply("You don\'t have admin permissions!");
      }
    },
    "description": "Unban the pinged user",
    "type": "moderator"
  },
  "softban": {
    "run": function(message) {
      commands.ban.run(message);
      commands.unban.run(message);
    },
    "description": "Softban the pinged user",
    "type": "moderator"
  },
  "userinfo": {
    "run": function(message) {
      message.reply("\nYour username: ```" + message.author.username + "```\nYour user id: ```" + message.author.id + "```");
    },
    "description": "Shows basic information about yourself",
    "type": "utility"
  },
  "help": {
    "run": function(message) {
      const item = message.content.substr(7).split(" ")[0];
      if(item) {
        if(commands[item]) {
          message.channel.send("```n!" + item + "```\n" + commands[item].description);
        } else {
          message.reply("That isn\'t a command! please check your spelling.");
        }
      } else {
        let m = "```";
        for(let i in commands) {
          m += "\n" + i;
        }
        m += "```";
        message.channel.send(m);
      }
    },
    "description": "Display help about a particular command. leave arguments blank for a list of commands.",
    "type": "utility"
  },
  "marvin": {
    "run": function(message) {
      const plate = message.content.substr(9).split(" ")[0];
      message.channel.send("", {files:["https://dr15.sdss.org/sas/dr15/manga/spectro/redux/v2_4_3/" + plate.split("-")[0] + "/stack/images/" + plate.split("-")[1] + ".png"]})
    },
    "description": "Display the galaxy image of a specific plate from the SDSS-DR15 library.",
    "type": "utility"
  },
  "bonk": {
    "run": function(message) {
      for(i = 0; i < 5; i++) {
        message.channel.send("bonk");
      }
    },
    "description": "bonk",
    "type": "fun"
  }
}