module.exports = (message, emojis, time, res, afkres) => {
  message.react(emojis[0]).then(() => {
    message.react(emojis[1]);
  });
  const filter = (reaction, user) => {
    return emojis.includes(reaction.emoji.name) && user.id == message.author.id;
  };
  message.awaitReactions(filter, {max:1, time, errors:["time"]})
  .then(res)
  .catch(afkres);
};