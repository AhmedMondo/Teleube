const https = require("https");
const http = require("http");

/**
 * @example file_size_url("https://example.com")
 * @param {string} url - url of file
 * @returns {Promise} resolves once complete, otherwise rejects
 **/

async function check(url) {
  if (!url) return Promise.reject(new Error("Invalid Url"));

  return new Promise(async (res, rej) => {
    try {
      if (url.startsWith("https://") || url.startsWith("http://")) {
        let req = url.startsWith("https://") ? https.get(url) : http.get(url);
        req.once("response", async (r) => {
          let c = parseInt(r.headers["content-length"]);
          if (!isNaN(c) && r.statusCode === 200) res(formatBytes(c));
          else return 'Size Error';
        });
        req.once("error", async (e) => rej(e));
      } else {
        throw "error: The address should be http or https";
      }
    } catch (error) {
      console.log(error);
    }
  });
}

function formatBytes(x) {
  let units = ["B", "KB", "MB", "GB", "TB"];
  let bytes = x;
  let i;

  for (i = 0; bytes >= 1024 && i < 4; i++) {
    bytes /= 1024;
  }

  return bytes.toFixed(2) + " " + units[i];
}

module.exports = check;
