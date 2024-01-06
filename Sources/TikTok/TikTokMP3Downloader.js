const { TiktokDL } = require("@tobyg74/tiktok-api-dl");
const axios = require("axios");
const check = require("../../functions/fileSize");
const language = require("../../Languages");
async function TiktTokMP3Downloder(bot, msg, url, userData, globalData) {
  let opts = {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
    parse_mode: "HTML"
  };
  let lang = language[userData.language]

  TiktokDL(url, {
    version: "v1",
  }).then(async (result) => {
    if (result.status == "success" && result.result.type == "video") {
      var firstUrl = result.result.music.playUrl[0];
      try {
        const response = await axios({
          method: "GET",
          url: firstUrl,
          responseType: "arraybuffer",
        });
        let size = await check(firstUrl , userData);
        bot.editMessageText(`${lang.uploading} (${size})`, opts);
        return bot
          .sendAudio(msg.chat.id, response.data, {
            caption: `Caption: ${result.result?.description}\nUser: (${result.result.author.username})`,
          } , {
            filename : `${result.result?.description || result.result.author.username}`
          })
          .then(async () => {
            userData.totalTikTiokMP4 += 1;
            (userData.totalEverything += 1), (userData.currentConverting -= 1);
            await userData.save();
            (globalData.totalTikTiokMP4 += 1),
              (globalData.totalEverything += 1),
              (globalData.currentConverting -= 1);
            await globalData.save();
            bot.editMessageText(lang.thank_message, opts);
          })
          .catch((err) => {
            bot.editMessageText(lang.error.general + err.message, opts);
          });
      } catch (error) {
        bot.editMessageText(lang.error.download_audio + error, opts);
        console.error("Error downloading the audio:", error);
      }
    } else {
      globalData.currentConverting -= 1;
      await globalData.save();
      userData.currentConverting -= 1;
      await userData.save();
      bot.editMessageText("Failed to get Audio Information", opts);
    }
  });
}

module.exports = TiktTokMP3Downloder;
