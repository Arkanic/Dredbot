module.exports = (options, request, response) => {
  const {name, exts} = options;
  response.type("html");
  let msg = `<h1>Index of ${name}:</h1>`;
  for(let i in exts) {
    msg += `<p><a href="https://dredbot--tal0s.repl.co/${name}${exts[i]}">${exts[i]}</a></p>`;
  }
  return response.send(msg);
}