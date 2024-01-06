const fs = require("fs");
var languages = fs.readdirSync("./Languages");
var language = {};
for (const lang of languages.filter((file) => file.endsWith(".json"))) {
  language[`${lang.split(".json").join("")}`] = require(`./${lang}`);
}
Object.freeze(language);
module.exports = language;
