chrome.runtime.onInstalled.addListener(() => {
  let xhr = new XMLHttpRequest();
  xhr.open("GET", "https://dredbot--tal0s.repl.co/api/getextensiontoken", true);
  xhr.send();
  xhr.onreadystatechange = () => {
    if(xhr.readyState != 4) return;
    if(xhr.status == 200) {
      let token = JSON.parse(xhr.responseText).token;
      chrome.storage.sync.set({token}, () => {
        chrome.tabs.create({url: chrome.extension.getURL("static/welcome.html")});
      })
    }
  }
});
chrome.runtime.setUninstallURL("https://dredbot--tal0s.repl.co/extension/uninstall.html");