function generateCollapsibles() {
  var coll = document.getElementsByClassName("collapsible");
  var i;

  for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function() {
      this.classList.toggle("active");
      var content = this.nextElementSibling;
      if (content.style.maxHeight){
        content.style.maxHeight = null;
      } else {
        content.style.maxHeight = content.scrollHeight + "px";
      }
    });
  }
}
function loadDocumentation() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      let descriptions = JSON.parse(this.responseText);
      let div = document.getElementById("docbox");
      for(let i in descriptions) {
        let button = document.createElement("button");
        button.type = "button";
        button.classList.add("collapsible");
        button.appendChild(document.createElement("h1").appendChild(document.createTextNode(`;${i}`)));
        let text = document.createElement("div");
        text.classList.add("content");
        let conttext = document.createElement("p");
        conttext.innerHTML = descriptions[i];
        text.appendChild(conttext);
        div.appendChild(button);
        div.appendChild(text);
        console.log(`Loaded ${i}`);
      }
      generateCollapsibles();
    }
  };
  xhttp.open("GET", "/api/documentation", true);
  xhttp.send();
  generateCollapsibles();
}