module.exports = (str, num) => {
  if(!str) return null;
  if(str.length <= num) return str;
  return str.slice(0, num-3) + "...";
}