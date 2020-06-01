const WikiaAPI = require("nodewikiaapi");
const wiki = new WikiaAPI("drednotio");
const {prefix} = require("../etc/config/config.json");
module.exports = {
  name: "wiki",
  description: "Display information about an item from the unofficial wiki",
  documentation: "Displays the top paragraph from the page of the sent wiki query; not the best, and might be improved.",
  execute(message, cache, client) {
    let query = message.content.substr(prefix.length + this.name.length);
    wiki.getSearchList({query:query}).then((data) => {
      if(!data.items[0]) return message.reply("no results for this query.");
      let id = data.items[0].id;
      wiki.getArticleAsSimpleJson({id:id}).then((data) => {
        if(!data.sections[0].content[0].text) return message.reply("No description for this page.");
        message.channel.send("Information from wiki: \n" + data.sections[0].content[0].text);
      });
    });
  }
}