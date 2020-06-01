const Discord = require("discord.js");
const MongoClient = require("mongodb").MongoClient;
const request = require("request");
const path = require("path");
const {prefix} = require("../etc/config/config.json");
module.exports = {
  name: "postmod",
  description: "post a mod, use ;postmod <name> then attach your file to that message. (CURRENTLY BROKEN)",
  documentation: "UNDER CONSTRUCTION (LOW PRIORITY)",
  execute(message, cache, client) {
    let url = (message.attachments).array()[0]
    request(url, (error, response, body) => {
      if(error) throw error;
      let attachment = new Discord.MessageAttachment("hi", "file.txt");
      message.channel.send(attachment);
      MongoClient.connect(process.env.MONGODB, (error, db) => {
        if(error) throw error;
        const dbo = db.db("mods");
        db.close();
      });
    });
  }
}