module.exports = class {
  constructor() {
    this.events = {};
  }
  on(name, handle) {
    this.events[name]=(options)=>{handle(options)};
  }
  trigger(name, options) {
    this.events[name](options);
  }
}