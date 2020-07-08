const Discord = require("discord.js");
const MongoClient = require("mongodb").MongoClient;
const request = require("request");
const path = require("path");
module.exports = {
  name: "postmod",
  description: "post a mod, use ;postmod <name> then attach your file to that message. (CURRENTLY BROKEN)",
  documentation: "UNDER CONSTRUCTION (LOW PRIORITY)",
  execute(options) {
    let {message, cache, client, dbo, pre} = options;
    dbo.collection("settings").find({}).toArray((err, result) => {
      if(err) throw err;
    });
  }
}