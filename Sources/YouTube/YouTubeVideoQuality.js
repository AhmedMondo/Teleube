const language = require("../../Languages");
const ytdl = require("ytdl-core");
const { performAsyncTasks } = require("../../functions/functions");
async function YouTubeVideoQuality(bot, msg, url, userData, globalData) {
  const opts = {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
    parse_mode: "HTML",
  };
  let lang = language[userData.language];

  bot.editMessageText(lang.quality_video_load, opts);
  ytdl(`${url}`).on("info", (info) => {
    let formats = info.formats.filter((s) => s.hasVideo && s.hasAudio); // get Videos
    performAsyncTasks(formats, msg.chat.id, "Video" , userData)
      .then((finalResults) => {
        var finalOpts = {
          chat_id: msg.chat.id,
          message_id: msg.message_id,
          parse_mode: "HTML",
          reply_markup: JSON.stringify({
            inline_keyboard: [finalResults],
            one_time_keyboard: true,
          }),
        };
        bot
          .editMessageText(lang.choose_video_quality, finalOpts)
          .catch(async(err) => {
            globalData.currentConverting -= 1;
            await globalData.save();
            userData.currentConverting -= 1;
            await userData.save();
            bot.editMessageText(lang.error.general + err.message, opts);
            console.log("🚀 ~ file: YouTubeVideoQuality.js:34 ~ .then ~ message:", message)
          });
      })
      .catch(async(err) => {
        globalData.currentConverting -= 1;
        await globalData.save();
        userData.currentConverting -= 1;
        await userData.save();
        bot.editMessageText(lang.error.general + err.message, ops);
        console.log("🚀 ~ file: YouTubeVideoQuality.js:43 ~ ytdl ~ message:", message)
        console.error("Error:", err);
      });
  });
}

module.exports = YouTubeVideoQuality;
