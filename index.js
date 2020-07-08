// hi, GOTO README.TXT
const http = require("http");
const path = require("path");
const url = require("url");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const bodyparser = require("body-parser");
const shortid = require("shortid");

const Logger = require("./src/lib/logger.js");
const logger = new Logger("core", "blue");
logger.log("starting...");
const dbolog = new Logger("mongo", "yellow");
const cachelog = new Logger("cache", "red");
const commandlog = new Logger("chandle", "green");

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
  leaderboard:[],
  settings: {}
};

const commands = fs.readdirSync("./src/commands").filter(file => file.endsWith(".js"));
for(const file of commands) {
  const command = require(`./src/commands/${file}`);
  client.commands.set(command.name, command);
  logger.info(`loaded ${command.name}`);
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
    let settings = {};
    for(let i in ls.settings) {
      settings[i] = ls.settings[i];
    }
    response.send(JSON.stringify({
      check:true,
      ...(settings)
    }));
  } else {
    response.send(JSON.stringify({
      check:false
    }));
  }
});
app.post("/api"+apiexts.settingschange, (request, response) => {
  response.type("json");
  let prefix = request.body.prefix;
  let id = request.body.id;
  let guild = Object.values(cache.settings).find(guild => guild.loginid == id);
  if(!guild) {
    response.send(JSON.stringify({
      check:false
    }));
    return;
  }
  response.send(JSON.stringify({
    check:true
  }));
  cache.settings[guild.id].settings.prefix = prefix;
  let newvalues = {$set:{"settings.prefix":prefix}};
  dbo.collection("settings").updateOne({id:guild.id}, newvalues, (err, res) => {
    if(err) throw err;
    dbolog.success(`Updated GP`);
  });
});

const MongoClient = require("mongodb");
let dbo;
client.once("ready", () => {
  logger.info(`cached servers: ${client.guilds.size}`);
  logger.info(`cached users: ${client.users.size}`);
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
  logger.success("<Ready>");
});
client.on("guildCreate", guild => {
  let obj = {
    id: guild.id,
    loginid: shortid(),
    settings: {
      prefix: ";",
      allowdefault: true,
      reactunidentified: true,
      dontreactfaces: false,
      adminallcommands: true,
      warnnoaccess: true
    }
  };
  dbo.collection("settings").insertOne(obj, (err, res) => {
    if(err) throw err;
    dbolog.success(`Added to ${guild.name}, created db inst.`);
    let query = {id:guild.id};
    dbo.collection("settings").findOne(query).toArray((err, result) => {
      cache.settings[guild.id] = result[0];
    });
  });
});
client.once("reconnecting", () => {
  console.warn("<reconnecting>");
});
client.once("disconnect", () => {
  console.warn("<disconnect>");
});
client.on("message", async message => {
  if (!message.guild) return;
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
  if (!dbo) return message.channel.send("DB not yet connected...");

  try {
    await command.execute({message:message, cache:cache, client:client, dbo:dbo, pre:pre, logger:new Logger(`c-${command.name}`, "green")});
    commandlog.log(`${new Date().toUTCString()}: Command: ${command.name} In: ${message.guild.name} | ${message.content}`);
  } catch (error) {
    message.channel.send(`\`\`\`${error}\`\`\``);
    commandlog.error(error);
  }
});

const WebSocket = require("ws");
const request = require("request");

function getLb() {
  function done(ships) {
    cachelog.success("DONE.");
  }
  function getSec(offset, rvar, done) {
    request(`https://master.drednot.io/api/scoreboard?count=1000&offset_score=${offset}`, (error, response, body) => {
      if(error) throw error;
      let result = JSON.parse(body);
      if(result.error) console.error(result.error);
      let ships = result.ships;
      for(let i in ships) {
        rvar.push(ships[i]);
      }
      let newoffset = ships[ships.length-1].score;
      cachelog.log(`lb ${offset}-${newoffset}`);
      if(newoffset >= offset) {
        done();
      } else {
        setTimeout(() => {
          getSec(newoffset, rvar, done);
        }, 1000);
      }
    });
  }
  request("https://master.drednot.io/api/scoreboard?count=1000", (error, response, body) => {
    if(error) throw error;
    let o = JSON.parse(body).ships[0].score;
    setTimeout(() => {
      getSec(o, cache.leaderboard, done);
    });
  });
}

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
      sockets[i].onerror = (e) => {
        cachelog.error(e);
      }
    }
  } catch(err) {
    cachelog.critical("PLAYERCOUNT FAIL (Server offline)");
  }
};

getPlayers();
setInterval(() => {
  getPlayers();
}, 1000*10);

getLb();
setInterval(() => {
  getLb();
}, 1000*60*60*3)


client.login(process.env.BOT_TOKEN);