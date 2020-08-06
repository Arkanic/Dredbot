function loadserversinfo() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if(this.readyState == 4 && this.status == 200) {
      let servers = JSON.parse(this.responseText);
      document.getElementById("servercount").innerHTML = `Used in over ${Object.keys(servers).length} servers, including:`;
      for(let i = 0; i < 10; i++) {
        let sn = [];
        for(let i in servers) {
          sn.push(i);
        }
        let div = document.createElement("div");
        div.className = "tooltip";
        let sern = Math.max(...sn);
        let text = document.createElement("span");
        text.appendChild(document.createTextNode(servers[sern].name));
        text.className = "tooltiptext";
        let iconimg = document.createElement("img");
        iconimg.classList.add("thumbnail");
        iconimg.src=servers[sern].icon;
        iconimg.width=64;
        iconimg.height=64;
        div.appendChild(iconimg);
        div.appendChild(text);
        document.getElementById("topservers").appendChild(div);
        delete servers[sern];
      }
    }
  }
  xhttp.open("GET", "/api/servers", true);
  xhttp.send();
}