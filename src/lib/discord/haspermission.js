const admins = [
  {
    "alias": "Arkanic",
    "id": 608139132816064524
  }
];
module.exports = (message, permname) => {
  if(message.member.hasPermission(permname) || admins.filter(a => a.id == message.member.id)) return true;
  else return false;
}