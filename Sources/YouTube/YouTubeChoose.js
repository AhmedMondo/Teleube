const ytdl = require("ytdl-core");
const ytpl = require("ytpl");
const language = require("../../Languages");
async function YouTubeChoose(bot, msg, url, userData , globalData)  {
  let lang = language[userData.language]

    try {
      // Get video information and thumbnail URL
      if (ytpl.validateID(url)) {
        return bot.editMessageText(
          lang.playlist_found,
          {
            chat_id: msg.chat.id,
            message_id: msg.message_id,
            parse_mode : "HTML",
            reply_markup: JSON.stringify({
              inline_keyboard: [
                [{ text: lang.buttons.playlist, callback_data: "youtube_playlist_choose" }],
                [{ text: lang.buttons.video, callback_data: "video_youtube" }],
              ],
              one_time_keyboard: true,
            }),
          }
        );
      }
      const videoInfo = await ytdl.getInfo(url);
      const { title, author, isLive } = videoInfo.videoDetails;
      if (isLive) {
        return bot.editMessageText(lang.error.live, {
          chat_id: msg.chat.id,
          message_id: msg.message_id,
          parse_mode: "HTML"
        });
      }
  
      await bot.editMessageText(
        `Video Title: *${title}*\nChannel: (${author.name})`,
        {
          chat_id: msg.chat.id,
          message_id: msg.message_id,
          reply_markup: JSON.stringify({
            inline_keyboard: [
              [{ text: lang.buttons.download_audio, callback_data: "audio_youtube" }],
              [{ text: lang.buttons.download_video, callback_data: "video_youtube" }],
            ],
            one_time_keyboard: true,
          }),
        }
      );
    } catch (error) {
      if (error.message == "Video unavailable") {
        return bot.editMessageText(lang.error.video_unavailable, {
          chat_id: msg.chat.id,
          message_id: msg.message_id,
        });
      }
      bot.editMessageText(lang.error.video_info_fail, {
        chat_id: msg.chat.id,
        message_id: msg.message_id,
      });
      console.error(error);
    }
  }


  module.exports = YouTubeChoose