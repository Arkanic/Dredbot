// hi, GOTO README.TXT

fetch = require('node-fetch')
fetch("https://master.drednot.io:4100/shiplist",{
            method: "POST",
            headers: {
              "Content-Type": "text/plain;charset=UTF-8",
              "origin" : "https://drednot.io",
              "user-agent" : "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36"
            },
            body: JSON.stringify({server_id : 0, invite_code: ''})
          }).then(async (res) => {
            console.log(await res.json());
          });

const http = require("http");
const path = require("path");
const url = require("url");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const bodyparser = require("body-parser");
const shortid = require("shortid");

const constants = require("./src/etc/constants");

const Logger = require("./src/lib/logger.js");
const logger = new Logger("core", "blue");
logger.log("starting...");
const dbolog = new Logger("mongo", "yellow");
const cachelog = new Logger("cache", "red");
const commandlog = new Logger("comhandle", "green");
const apilog = new Logger("api", "purple");

const app = express();
// was getting a bunch of CORS errors for some dumb reason
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

const envs = require("./env");

// main cache variables
// TODO: see if there is a better system for this
let cache = {
  dredplayers:{},
  leaderboard:[],
  tleaderboard:[],
  botmeta:{},
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

// API path list all api res types
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
// API view discord servers bot is on, along with limited info
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
// API check token, return true/false value if token in valid
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
// API change settings for server (requires valid key)
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
// ldb api for chrome extension
app.post("/api"+apiexts.ldb, (request, response) => {
  response.type("json");
  let query = request.body.search;
  let token = request.body.token;
  dbo.collection("tokens").find({token}).toArray((err, result) => {
    if(err) dbolog.error(err);
    if(!result[0]) {
      response.send(JSON.stringify({
        error: "invalid token"
      }));
      apilog.warn(`invalid token ${token || "[none]"} provided for ldb api.`);
    } else {
      let matches = cache.leaderboard.filter(s => s.ship_name.toLowerCase().includes(query.toLowerCase()));
      response.send(JSON.stringify({
        error: false,
        matches
      }));
      apilog.log(`sent ldb api results for ${query} to token ${token}`);
    }
  });
});
// extension token generator
app.get("/api"+apiexts.getextensiontoken, (request, response) => {
  response.type("json");
  let token = shortid();
  response.send(JSON.stringify({
    token
  }));
  dbo.collection("tokens").insertOne({token}, (err, res) => {
    if(err) dbolog.error(err);
    else dbolog.success(`extension token ${token} generated!`);
  });
});

const MongoClient = require("mongodb");
let dbo;
client.once("ready", () => {
  logger.log(`cached servers: ${client.guilds.size}`);
  logger.log(`cached users: ${client.users.size}`);
  client.user.setPresence({
    status: "idle",
    game: {
      type: "WATCHING",
      name: "myself start up..."
    }
  });
  // start the random presences
  let pi = setInterval(() => {
    let cp = presencetypes[Math.floor(Math.random()*presencetypes.length)](client, cache);
    client.user.setPresence({
      status: cp.status,
      game: {
        type: cp.type,
        name: cp.name
      }
    });
  }, constants.BOT_REFRESH_PRESENCE);
  // initial mongodb
  let mongodblogin;
  if(process.env.NODE_ENV == "production") mongodblogin = envs.MONGODB;
  else if(process.env.NODE_ENV == "development") mongodblogin = require("./env.js").MONGODB
  MongoClient.connect(mongodblogin, {useUnifiedTopology:true}, (err, db) => {
    if(err) logger.critical(err);
    let mdb = db.db("dredbot");
    dbo = mdb;
    dbo.collection("settings").find({}).toArray((err, results) => {
      if(err) throw err;
      for(let i in results) {
        if(cache.settings) {
          cache.settings[results[i].id] = results[i];
        } else {
          logger.critical(`MongoDB Inst "${i}" has no settings object`);
        }
      };
    });
    setInterval(() => {
      dbo.collection("settings").find({}).toArray((err, results) => {
        if(err) throw err;
        for(let i in results) {
          if(cache.settings) {
            cache.settings[results[i].id] = results[i];
          } else {
            logger.critical(`MongoDB Inst "${i}" has no settings`);
          }
        };
      }).catch(err => {
      });
    }, constants.CACHE_REFRESH_MONGODB);
  });
  logger.success("<Ready>");
});
client.on("guildCreate", guild => {
  // create instance for mongodb when guild is created
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
    cache.settings[guild.id] = obj;
  });
});
client.once("reconnecting", () => {
  logger.warn("<reconnecting>");
});
client.once("disconnect", () => {
  logger.warn("<disconnect>");
});
client.on("message", async message => {
  if (!message.guild) return;
  let pre = "";
  if(message.isMemberMentioned(client.user)) return message.channel.send(cache.settings[message.guild.id].settings.prefix);
  // get prefix if cache.settings exists, if not default to ;
  if(cache.settings) {
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
  // noexistant command
  if (!command) {
    const faces = [";-;", ";)", ";(", ";|"];
    if(!faces.includes(face => face == message.content)) return message.react("🤔");
  }
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

// NOTE: i use a recursive function for the leaderboard 
// because currently i can't find a way to create a in-series
// async for loop. this probably consumes a lot more cpu than
// it should as well.
// TODO: faster system, maybe only reset vars if ship in
// question has been edited or created.
function getLb(test) {
  let x = 1;
  if(test) {
    cache.tleaderboard = [];
  } else {
    cache.leaderboard = [];
  }
  function done(ships) {
    let t;
    if(test) t = "test-master";
    else t = "master";
    cachelog.success(`finished collecting ships. [${t}]`);
  }
  function getSec(url, offset, rvar, done) {
    request(`${url}?count=1000&offset_score=${offset}`, (error, response, body) => {
      if(error) throw error;
      let result = JSON.parse(body);
      if(result.error) cachelog.critical(result.error);
      let ships = result.ships;
      for(let i in ships) {
        // "x" is the global leaderboard placement (e.g. 1st, 2nd, 3rd, etc.)
        rvar.push({
          ...(ships[i]),
          x
        });
        x++;
      }
      // this checks whether the the last ship of the leaderboard sector
      // has the same number of points as the first ship in said sector,
      // if it does this means that the bot can't loop through any more ships
      // (would just request the same page again and again)
      let newoffset = ships[ships.length-1].score;
      if(newoffset >= offset) {
        done();
      } else {
        // request it timed to stop the bot from incurring the DDOS cooldown
        setTimeout(() => {
          if(test) getSec(url, newoffset, cache.tleaderboard, done);
          else getSec(url, newoffset, cache.leaderboard, done);
        }, 1000);
      }
    });
  }
  let u = "https://master.drednot.io/api/scoreboard";
  if(test) u = "https://test-master.drednot.io/api/scoreboard";
  // get very first ship of very first sector to figure out
  // how many points the top ship has so it can correctly
  // figure out what the next offset is
  request(`${u}?count=1000`, (error, response, body) => {
    if(error) throw error;
    let o = JSON.parse(body).ships[0].score;
    setTimeout(() => {
      if(test) getSec(u, o, cache.tleaderboard, done);
      else getSec(u, o, cache.leaderboard, done);
    });
  });
}

// get the amount of players on each server by accessing
// a specific websocket port. currently fatally errors
// when a server is down because wss api is absolutely horrible.
function getPlayers() {
  try {
    const sockets = {
      US: new WebSocket("wss://d0.drednot.io:4000"),
      Poland: new WebSocket("wss://d1.drednot.io:4000"),
      Test: new WebSocket("wss://t0.drednot.io:4000"),
      Singapore: new WebSocket("wss://s2.drednot.io:4000")
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

function getBotMetadata(client) {
  let guilds = client.guilds.array();
  cache.botmeta["guilds"] = guilds.length;
  cache.botmeta["users"] = [];

  for(let i = 0; i < guilds.length; i++) {
    client.guilds.get(guilds[i].id).fetchMembers().then(r => {
      r.members.array().forEach(r => {
        let username = `${r.user.username}#${r.user.discriminator}`;
        cache.botmeta["users"].push(username);
      });
    });
  }
  logger.success(`Got bot-related metadata. Guilds: ${cache.botmeta["guilds"]}, Users: ${cache.botmeta["users"].length}`)
}

// cache reset intervals
getPlayers();
setInterval(() => {
  getPlayers();
}, constants.CACHE_REFRESH_PLAYERS);

getLb(true);
getLb(false);
setInterval(() => {
  getLb(true);
  getLb(false);
}, constants.CACHE_REFRESH_LEADERBOARD);

// login
// why is this at the bottom
if(process.env.NODE_ENV == "production") {
  client.login(envs.BOT_TOKEN);
} else if(process.env.NODE_ENV == "development") {
  const gitconfig = require("./env.js");
  client.login(gitconfig.DEV_TOKEN);
}