module.exports = class {
  constructor() {
    this.intervals = {};
  }
  start(name, func, t) {
    func();
    this.intervals[name] = setInterval(func, parseInt(t));
  }
  stop(name) {
    clearInterval(this.intervals[name]);
    delete this.intervals[name];
  }
};