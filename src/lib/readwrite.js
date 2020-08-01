const fs = require("fs");

const read = (path) => {
  fs.readFile(path, (err, buf) => {
    return buf.toString();
  });
};
const write = (path, data) => {
  fs.writeFile(path, new Uint8Array(Buffer.from(data)), (err) => {
  });
}

module.exports = {read, write};