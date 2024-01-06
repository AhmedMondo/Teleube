const language = require("../../Languages");
const ytdl = require("ytdl-core");
const {
  convertToBytes,
  megabytesToBytes,
} = require("../../functions/functions");
const { default: axios } = require("axios");
async function YouTubeMP4Downloder(bot, msg, url, userData, globalData, matchResult) {
  const opts = {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
    parse_mode: "HTML",
  };
  let lang = language[userData.language];
  let size = matchResult[4]

  let sizeCheck = convertToBytes(size);
  let mainChekcer = megabytesToBytes(100);
  if (sizeCheck > mainChekcer) {
    userData.currentConverting -= 1;
    await userData.save();
    globalData.currentConverting -= 1;
    await globalData.save();
    return bot.editMessageText(lang.premium.big_videos, {
      chat_id: msg.chat.id,
      message_id: msg.message_id,
      parse_mode: "HTML",
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [{ text: lang.buttons.subscribe, callback_data: "subscribe" }],
        ],
        one_time_keyboard: true,
      }),
      reply_to_message_id: msg.message_id,
    });
  }
  bot.editMessageText(lang.loading, opts).then(() => {
    ytdl(`${url}`).on("info", async (info) => {
      let video = info.formats.filter(
        (s) => s.hasVideo && s.hasAudio && s.qualityLabel == matchResult[2]
      )[0]; // get the Video
      try {
        const response = await axios({
          method: "GET",
          url: video.url,
          responseType: "arraybuffer",
        });
        bot.editMessageText(`${lang.uploading} (${matchResult[4]})`, opts);
        return bot
          .sendVideo(msg.chat.id, response.data)
          .then(async () => {
            userData.totalYoutubeMP4 += 1;
            (userData.totalEverything += 1), (userData.currentConverting -= 1);
            await userData.save();
            (globalData.totalYoutubeMP4 += 1),
              (globalData.totalEverything += 1),
              (globalData.currentConverting -= 1);
            await globalData.save();
            bot.editMessageText(lang.thank_message, opts);
          })
          .catch(async (err) => {
            userData.currentConverting -= 1;
            await userData.save();
            globalData.currentConverting -= 1;
            await globalData.save();
            bot.editMessageText(lang.error.general + err.message, opts);
            console.log("🚀 ~ file: YouTubeMP4Downloader.js:66 ~ ytdl ~ err:", err)
          });
      } catch (error) {
        userData.currentConverting -= 1;
        await userData.save();
        globalData.currentConverting -= 1;
        await globalData.save();
        bot.editMessageText(lang.error.download_video + error, opts);
        console.error("Error downloading the video:", error);
      }
    });
  });
}

module.exports = YouTubeMP4Downloder;
