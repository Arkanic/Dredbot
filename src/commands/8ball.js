const predictions = require("../assets/text/8ballpredictions.json");
module.exports = {
    name: "8ball",
    description: "predict some stuff",
    execute(message) {
        message.channel.send(predictions[Math.random()*predictions.length]);
    }
}