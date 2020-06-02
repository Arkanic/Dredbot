// hi, GOTO README.TXT
const http = require("http");
const path = require("path");
const url = require("url");
const fs = require("fs");
const express = require("express");

const app = express();
app.use(express.static("public"));
const port = process.env.PORT || 8080;
const server = app.listen(port);

const Discord = require("discord.js");
const Client = require("./src/handler/Client");
const {prefix} = require("./src/etc/config/config.json")
const presencetypes = require("./src/etc/presencetypes.js");
const client = new Client();
client.commands = new Discord.Collection();

const commands = fs.readdirSync("./src/commands").filter(file => file.endsWith(".js"));
for(const file of commands) {
  const command = require(`./src/commands/${file}`);
  client.commands.set(command.name, command);
}

app.get("/api/documentation", (request, response) => {
  response.type("json");
  let msg = {};
  client.commands.forEach(command => {
    msg[command.name] = command.documentation;
  });
  response.send(JSON.stringify(msg));
});
app.get("/api/servers", (request, response) => {
  response.type("json");
  let msg = {};
  client.guilds.forEach(guild => {
    msg[guild.memberCount] = {
      name:guild.name,
      icon:`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
    };
  });
  response.send(JSON.stringify(msg));
});

client.once("ready", () => {
  console.log(`Servers: ${client.guilds.size}`);
  console.log(`Users: ${client.users.size}`);
  client.user.setPresence({
    status: "idle",
    game: {
      type: "WATCHING",
      name: "myself start up..."
    }
  });
  let pi = setInterval(() => {
    let cp = presencetypes[Math.floor(Math.random()*presencetypes.length)](client, cache);
    client.user.setPresence({
      status: cp.status,
      game: {
        type: cp.type,
        name: cp.name
      }
    });
  }, 1000*5);
  console.log("<Ready>");
});
client.once("reconnecting", () => {
  console.log("<reconnecting>");
});
client.once("disconnect", () => {
  console.log("<disconnect>");
});
client.on("message", async message => {
  let args = message.content.slice(prefix.length).split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command = client.commands.get(commandName);

  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;
  if (!command) return message.react("🤔");
  if (!cache.leaderboard) return message.channel.send(`**BOT CURRENTLY CACHING...**\n(please wait a couple of seconds and try again)\n**ACTIVE EVTS:**\n${JSON.stringify(events.events)}`);

  try {
    await command.execute(message, cache, client);
    console.log(`Command: ${command.name} | ${message.content}`);
  } catch (error) {
    console.log(error);
    message.channel.send("There was an error.\n```" + error + "```");
  }
});

const WebSocket = require("ws");
const request = require("request");

let cache = {
  dredplayers:{},
  leaderboard:{}
};

const EventGroup = require("./src/lib/eventgroup.js");

const events = new EventGroup();

function getLb() {
  const constants = {
    lb_cycles: 50
  };
  let lb = [];
  for(let i = 0; i < constants.lb_cycles; i++) {
    events.on(`lb-${i}`, (e) => {
      let apiopt = "";
      if(e.base) {
        apiopt = "?count=1000";
      } else {
        apiopt = `?count=1000&offset_score=${e.offset}`;
      }
      request(`https://master.drednot.io/api/scoreboard${apiopt}`, (error, response, body) => {
        let tmplb = JSON.parse(body).ships;
        lb = lb.concat(tmplb);
        setTimeout(() => {
          if(i < constants.lb_cycles-1) {
            events.trigger(`lb-${i+1}`, {
              base: false,
              offset: JSON.parse(body).ships[JSON.parse(body).ships.length-1].score
            });
          } else {
            cache.leaderboard = lb;
            console.log("Done. RECACHE-1H");
          }
        }, 500);
      });
    });
  }
  events.trigger("lb-0", {base:true});
};

getPlayers();
setInterval(() => {
  getPlayers();
}, 1000*10);

cache.leaderboard = getLb();
setInterval(() => {
  cache.leaderboard = getLb();
}, (1000*60)*60)

function getPlayers() {
  const sockets = {
    US: new WebSocket("wss://d0.drednot.io:4000"),
    Poland: new WebSocket("wss://d1.drednot.io:4000"),
    Test: new WebSocket("wss://t0.drednot.io:4000")
  };
  for(let i in sockets) {
    sockets[i].addEventListener("open", (e) => {
      sockets[i].send("yo");
    });
    sockets[i].addEventListener("message", (e) => {
      cache.dredplayers[i] = JSON.parse(e.data);
    });
  }
}

client.login(process.env.BOT_TOKEN);