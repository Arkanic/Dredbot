function loadserversinfo() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if(this.readyState == 4 && this.status == 200) {
      let servers = JSON.parse(this.responseText);
      document.getElementById("servercount").innerHTML = `Used in over ${Object.keys(servers).length} servers, including:`;
      for(let i = 0; i<5; i++) {
        let sn = [];
        for(let i in servers) {
          sn.push(i);
        }
        let sern = Math.max(...sn);
        let text = document.createElement("figcaption").appendChild(document.createTextNode(servers[sern].name));
        let iconimg = document.createElement("img");
        iconimg.src=servers[sern].icon;
        iconimg.width=64;
        iconimg.height=64;
        document.getElementById("topservers").appendChild(iconimg);
        document.getElementById("topservers").appendChild(text);
        document.getElementById("topservers").appendChild(document.createElement("hr"));
        delete servers[sern];
      }
    }
  }
  xhttp.open("GET", "/api/servers", true);
  xhttp.send();
}