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
            showSettings(JSON.parse(xhr.responseText));
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
        showSettings(JSON.parse(xhr.responseText));
      } else {
        document.getElementById("info").innerHTML = "Invalid Token.";
      }
    } else {
      document.getElementById("info").innerHTML = `Server Error. (${xhr.status})`;
    }
  }
}
function showSettings(res) {
  setTimeout(() => {
    document.getElementById("info").style.display = "none";
  }, 1000);
  document.getElementById("settingsbox").style.display = "block";
  document.getElementById("loginbox").style.display = "none";
  document.getElementById("s-prefix").value = res.prefix;
}
function resetpre() {
  document.getElementById("s-prefix").value = ";";
}
/*settings: {
  prefix: ";",
  allowdefault: true,
  reactunidentified: true,
  dontreactfaces: false,
  adminallcommands: true,
  warnnoaccess: true
}*/
function submitsettings() {
  let id = "";
  let name = "dredsettingsid=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for(let i in ca) {
    let c = ca[i];
    while(c.charAt[0] == " ") {
      c = c.substring(1);
    }
    if(c.indexOf(name) == 0) {
      id = c.substring(name.length, c.length);
    }
  }
  let xhr = new XMLHttpRequest();
  xhr.open("POST", "https://dredbot--tal0s.repl.co/api/settingschange", true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify({
    prefix: document.getElementById("s-prefix").value,
    allowdefault: document.getElementById("s-allow-default").checked,
    reactunidentified: document.getElementById("s-react-unidentified").checked,
    dontreactfaces: document.getElementById("s-react-faces").checked,
    adminallcommands: document.getElementById("s-admin-command").checked,
    warnonaccess: document.getElementById("s-access-warn").checked
    id: id
  }));
  xhr.onreadystatechange = () => {
    if(xhr.readyState != 4) return;
    if(xhr.status == 200) {
      if(JSON.parse(xhr.responseText).check) {
        document.getElementById("saveinfo").innerHTML = "Success!";
        setTimeout(() => {
          document.getElementById("saveinfo").style.display = "none";
        }, 1000);
      } else {
        document.getElementById("saveinfo").innerHTML = "Invalid Token. You probably tried to do something you shouldn't have.";
      }
    } 
  }
}