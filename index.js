// hi, GOTO README.TXT
const http = require("http");
const path = require("path");
const url = require("url");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const bodyparser = require("body-parser");
const shortid = require("shortid");

const app = express();
app.use(cors());
app.use(bodyparser.json());
app.use(express.static("public"));
const port = process.env.PORT || 8080;
const server = app.listen(port);

const Discord = require("discord.js");
const Client = require("./src/handler/Client");
const {prefix} = require("./src/etc/config/config.json")
const presencetypes = require("./src/etc/presencetypes.js");
const client = new Client();
client.commands = new Discord.Collection();

let cache = {
  dredplayers:{},
  leaderboard:{},
  settings: {}
};

const commands = fs.readdirSync("./src/commands").filter(file => file.endsWith(".js"));
for(const file of commands) {
  const command = require(`./src/commands/${file}`);
  client.commands.set(command.name, command);
}

const apiexts = require("./src/etc/apiexts.js");
const indexmenu = require("./src/lib/indexmenu.js");

app.get("/api", (request, response) => {
  indexmenu({name:"api",exts:apiexts}, request, response);
});
app.get("/api"+apiexts.documentation, (request, response) => {
  response.type("json");
  let msg = {};
  client.commands.forEach(command => {
    msg[command.name] = command.documentation;
  });
  response.send(JSON.stringify(msg));
});
app.get("/api"+apiexts.discservers, (request, response) => {
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
app.post("/api"+apiexts.settingscheck, (request, response) => {
  let id = request.body.id;
  response.type("json");
  let ls = Object.values(cache.settings).find(guild => guild.loginid == id);
  if(ls != undefined) {
    response.send(JSON.stringify({
      check:true
    }));
  } else {
    response.send(JSON.stringify({
      check:false
    }));
  }
});

const MongoClient = require("mongodb");
let dbo;
const IntervalGroup = require("./src/lib/intervalgroup.js");
const intervals = new IntervalGroup();
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
  MongoClient.connect(process.env.MONGODB, (err, db) => {
    if(err) throw err;
    let mdb = db.db("dredbot");
    dbo = mdb;
    dbo.collection("settings").find({}).toArray((err, results) => {
      if(err) throw err;
      for(let i in results) {
        cache.settings[results[i].id] = results[i];
      };
    });
    setInterval(() => {
      dbo.collection("settings").find({}).toArray((err, results) => {
        if(err) throw err;
        for(let i in results) {
          cache.settings[results[i].id] = results[i];
        };
      });
    }, 60*60*1000);
  });
  console.log("<Ready>");
});
client.on("guildCreate", guild => {
  let obj = {
    id: guild.id,
    settings: {
      prefix: ";"
    }
  };
  dbo.collection("settings").insertOne(obj, (err, res) => {
    if(err) throw err;
    console.log(`Added to ${guild.name}, created db inst.`);
    let query = {id:guild.id};
    dbo.collection("settings").findOne(query).toArray((err, result) => {
      cache.settings[guild.id] = result[0];
    });
  });
});
client.once("reconnecting", () => {
  console.log("<reconnecting>");
});
client.once("disconnect", () => {
  console.log("<disconnect>");
});
client.on("message", async message => {
  let pre = "";
  if(cache.settings != {}) {
    if(!message.content.startsWith(cache.settings[message.guild.id].settings.prefix)) return;
    pre = cache.settings[message.guild.id].settings.prefix;
  } else {
    if(!message.content.startsWith(prefix)) return;
    pre = prefix;
  }
  let args = message.content.slice(pre.length).split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command = client.commands.get(commandName);
  if (message.author.bot) return;
  
  if (!command) return message.react("🤔");
  if (!cache.leaderboard) return message.channel.send(`**BOT CURRENTLY CACHING...**\n(please wait a couple of seconds and try again)\n**ACTIVE EVTS:**\n${JSON.stringify(events.events)}`);
  if (!dbo) return message.channel.send("DB not yet connected...");

  try {
    await command.execute(message, cache, client, dbo, pre);
    console.log(`Command: ${command.name} In: ${message.guild.name} | ${message.content}`);
  } catch (error) {
    console.log(error);
    message.channel.send("There was an error.\n```" + error + "```");
  }
});

const WebSocket = require("ws");
const request = require("request");



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

function getPlayers() {
  try {
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
  } catch(err) {
    console.log("PLAYERCOUNT FAIL (Server offline)");
  }
};

getPlayers();
setInterval(() => {
  getPlayers();
}, 1000*10);

cache.leaderboard = getLb();
setInterval(() => {
  cache.leaderboard = getLb();
}, (1000*60)*60)


client.login(process.env.BOT_TOKEN);