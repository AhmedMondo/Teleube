const axios = require("axios");
const check = require("../../functions/fileSize");
const language = require("../../Languages");
async function InstagramDownloader(bot, msg, id, userData, globalData) {
  let opts = {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
    parse_mode: "HTML"
  };
  let lang = language[userData.language]

  await axios
    .get(`https://api.ticket-manager.xyz/post?post=${id}`)
    .then(async (result) => {
      let data = result.data.items[0]
      let videoUrl = data.video_versions[0].url;
      try {
        const response = await axios({
          method: "GET",
          url: `${videoUrl}`,
          responseType: "arraybuffer",
        });
        let size = await check(videoUrl , userData);
        bot.editMessageText(`${lang.uploading} (${size})`, opts);
        return bot
          .sendVideo(msg.chat.id, response.data, {
            caption: `Caption: ${
              data?.caption?.text || "No Caption"
            }\nUser: (${data?.user?.username || "Unknown"})`,
          })
          .then(async () => {
            userData.totalInstagram += 1;
            (userData.totalEverything += 1), (userData.currentConverting -= 1);
            await userData.save();
            (globalData.totalInstagram += 1),
              (globalData.totalEverything += 1),
              (globalData.currentConverting -= 1);
            await globalData.save();
            bot.editMessageText(lang.thank_message, opts);
          })
          .catch(async (err) => {
              globalData.currentConverting -= 1;
              await globalData.save();
              userData.currentConverting -= 1;
              await userData.save();
           return  bot.editMessageText(lang.error.general + err.message, opts);
          });
      } catch (error) {
        globalData.currentConverting -= 1;
        await globalData.save();
        userData.currentConverting -= 1;
        await userData.save();
       return  bot.editMessageText(lang.error.video_info_fail, opts);
      }
    }).catch(async() => {
        globalData.currentConverting -= 1;
        await globalData.save();
        userData.currentConverting -= 1;
        await userData.save();
       return  bot.editMessageText(lang.error.video_info_fail, opts);
    })

}

module.exports = InstagramDownloader;
