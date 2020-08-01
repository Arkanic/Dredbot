const request = require("request");
module.exports = {
  name: "wst",
  description: "-",
  documentation: "-",
  execute(options) {
    let {message, cache, client, dbo, pre} = options;
    request({
      url: "https://master.drednot.io:4100/shiplist",
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=UTF-8",
        "DNT": 1,
        "Cookie": "__cfduid=dbb97d6e0682f875f1ed0b1a00baff2721594497817; user_settings=eyJwcm9mYW5pdHlfbW9kZSI6Miwidm9sdW1lIjowLjMsImNoYXRfaGlkZV9tZXNzYWdlcyI6ZmFsc2UsImNoYXRfaGlkZV9idWJibGVzIjpmYWxzZX0%3D; notice_version=12; _ga=GA1.2.1191822253.1594497830; _gid=GA1.2.1804605653.1594497830; _gat_gtag_UA_134208590_1=1"
      },
      body: '{"invite_code": "", "server_id": 0}'
    },
    (error, response, body) => {
      if(error) throw error;
      message.channel.send(JSON.stringify(body));
    });
  }
}
/*
"Accept": "/*"*
"Accept-Encoding": gzip, deflate, br
Accept-Language: en-GB,en-US;q=0.9,en;q=0.8
Connection: keep-alive
Content-Length: 32
Content-Type: text/plain;charset=UTF-8

DNT: 1
Host: master.drednot.io:4100
Origin: https://drednot.io
Referer: https://drednot.io/
Sec-Fetch-Dest: empty
Sec-Fetch-Mode: cors
Sec-Fetch-Site: same-site
User-Agent: Mozilla/5.0 (X11; CrOS x86_64 13020.87.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.119 Safari/537.36
*/