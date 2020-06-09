function idcookiecheck() {
  let name = "dredsettingsid=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for(let i in ca) {
    let c = ca[i];
    while(c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if(c.indexOf(name) == 0) {
      let xhr = new XMLHttpRequest();
      xhr.open("POST", "https://dredbot--tal0s.repl.co/api/settingscheck", true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.send(JSON.stringify({
        id: c.substring(name.length, c.length)
      }));
      xhr.onreadystatechange = () => {
        if(xhr.readyState != 4) return;
        if(xhr.status == 200) {
          console.log(xhr.responseText);
          if(JSON.parse(xhr.responseText).check) {
            document.getElementById("info").innerHTML = "Success!";
            showSettings();
          } else {
            document.getElementById("info").innerHTML = "Invalid Cookie.";
          }
        } else {
          document.getElementById("info").innerHTML = `Server Error. (${xhr.status})`;
        }
      }
    }
  }
}
function login() {
  let xhr = new XMLHttpRequest();
  xhr.open("POST", "https://dredbot--tal0s.repl.co/api/settingscheck", true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify({
    id: document.getElementById("idin").value
  }));
  xhr.onreadystatechange = () => {
    if(xhr.readyState != 4) return;
    if(xhr.status == 200) {
      if(JSON.parse(xhr.responseText).check) {
        let d = new Date();
        d.setTime(d.getTime() + (30*24*60*60*1000));
        document.cookie = `dredsettingsid=${document.getElementById("idin").value};expires=${d.toUTCString()};path=/`;
        document.getElementById("info").innerHTML = "Success!";
        showSettings();
      } else {
        document.getElementById("info").innerHTML = "Invalid Token.";
      }
    } else {
      document.getElementById("info").innerHTML = `Server Error. (${xhr.status})`;
    }
  }
}
function showSettings() {
  document.getElementById("settingsbox").style.display = "block";
  document.getElementById("loginbox").style.display = "none";
}