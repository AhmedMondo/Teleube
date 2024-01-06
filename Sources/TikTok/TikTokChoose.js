const { TiktokDL } = require("@tobyg74/tiktok-api-dl");
const language = require("../../Languages");
async function TikTokChoose(bot, msg, url, userData, globalData) {
  let lang = language[userData.language]
  let opts = {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
    parse_mode: "HTML",
  };
  TiktokDL(url, {
    version: "v1",
  })
    .then(async (result) => {
      if (result.status == "success" && result.result.type == "video") {
        try {
          await bot.editMessageText(
            `Caption: ${result.result?.description}\nUser: (${result.result.author.username})`,
            {
              chat_id: msg.chat.id,
              message_id: msg.message_id,
              parse_mode: "HTML",
              reply_markup: JSON.stringify({
                inline_keyboard: [
                  [
                    {
                      text: lang.buttons.download_audio,
                      callback_data: "audio_tiktok",
                    },
                  ],
                  [
                    {
                      text: lang.buttons.download_video,
                      callback_data: "video_tiktok",
                    },
                  ],
                ],
                one_time_keyboard: true,
              }),
            }
          );
        } catch (error) {
          globalData.currentConverting -= 1;
          await globalData.save();
          userData.currentConverting -= 1;
          await userData.save();
          bot.editMessageText(
            lang.error.download_video + error.message,
            opts
          );
          console.error("Error downloading the video:", error);
        }
      } else {
        globalData.currentConverting -= 1;
        await globalData.save();
        userData.currentConverting -= 1;
        await userData.save();
        bot.editMessageText(lang.error.video_info_fail, opts);
      }
    })
    .catch(async () => {
      globalData.currentConverting -= 1;
      await globalData.save();
      userData.currentConverting -= 1;
      await userData.save();
      bot.editMessageText(lang.error.video_info_fail, opts);
    });
}

module.exports = TikTokChoose;
