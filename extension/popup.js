let queryinput = document.getElementById("query");
let submit = document.getElementById("submit");
let results = document.getElementById("results");

submit.addEventListener("click", () => {
  chrome.storage.sync.get("token", (data) => {
    const token = data.token;
    const query = queryinput.value;
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "https://dredbot--tal0s.repl.co/api/ldb", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({
      search:query,
      token
    }));
    xhr.onreadystatechange = () => {
      if(xhr.readyState != 4) return;
      if(xhr.status == 200) {
        results.innerHTML = xhr.responseText;
      } else {
        results.innerHTML = `None-200 HTTP res code ${xhr.status}!`;
      }
    }
  });
});