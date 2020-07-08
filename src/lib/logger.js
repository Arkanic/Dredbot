const chalk = require("chalk");
module.exports = class {
  constructor(name, color) {
    this.name = name;
    if(chalk[color]) {
      this.color = color;
    } else {
      this.color = "yellow";
    }
  }
  log(message) {
    console.log(`[${chalk[this.color](this.name)}]: ${message}`);
  }
  warn(message) {
    console.log(`[${chalk[this.color](this.name)}]: ${chalk.yellow(message)}`);
  }
  error(message) {
    console.log(`[${chalk[this.color](this.name)}]: ${chalk.red(message)}`);
  }
  success(message) {
    console.log(`[${chalk[this.color](this.name)}]: ${chalk.green(message)}`);
  }
  critical(message) {
    console.log(`[${chalk[this.color](this.name)}]: ${chalk.black.bgRed(message)}`);
  }
  info(message) {
    console.log(`[${chalk[this.color](this.name)}]: ${chalk.blue(message)}`);
  }
}