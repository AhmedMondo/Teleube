const language = require("../../Languages");
const ytdl = require("ytdl-core");
async function YouTubeMP3Downloder(bot, msg, url, userData, globalData) {

    var opts = {
        chat_id: msg.chat.id,
        message_id: msg.message_id,
        parse_mode: "HTML",
      };
      let lang = language[userData.language]

      bot.editMessageText(lang.quality_audio_load, opts);
      try {
        ytdl(`${url}`).on("info", async(info) => {
            let durationInSeconds = info.videoDetails.lengthSeconds;
            let tenMinutesInSeconds = 10 * 60;
      
            if (!userData.isPremium && durationInSeconds > tenMinutesInSeconds) {
                userData.currentConverting -= 1;
                await userData.save();
                globalData.currentConverting -= 1;
                await globalData.save();
              return bot.editMessageText(lang.premium.long_audio, {
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
      
            // Options for ytdl-core specifying audio format and quality
            const options = {
              quality: "highestaudio",
              filter: "audioonly",
            };
      
            const audioStream = ytdl(url, options);
            bot.editMessageText(lang.merging, opts);
            const chunks = [];
      
            audioStream.on("data", (chunk) => {
              chunks.push(chunk);
            });
            audioStream.on("end", () => {
              const audioBuffer = Buffer.concat(chunks);
              bot.editMessageText(lang.extracting_audio, opts).then(() => {
                bot
                  .sendAudio(
                    msg.chat.id,
                    audioBuffer,
                    {
                      caption: info.videoDetails.title,
                      reply_to_message_id: msg.message_id,
                    },
                    {
                      contentType: "audio/mpeg",
                      filename: `${info.videoDetails.title}.mpeg`,
                    }
                  )
                  .then(async () => {
                    userData.totalYoutubeMP3 += 1;
                    (userData.totalEverything += 1), (userData.currentConverting -= 1);
                    await userData.save();
                    (globalData.totalYoutubeMP3 += 1),
                      (globalData.totalEverything += 1),
                      (globalData.currentConverting -= 1);
                    await globalData.save();
                    bot.editMessageText(lang.thank_message, opts);
                  })
              });
            });
          });
      } catch (error) {
        userData.currentConverting -= 1;
        await userData.save();
        globalData.currentConverting -= 1;
        await globalData.save();
        bot.editMessageText(lang.error.download_audio + error, opts);

      }

}

module.exports = YouTubeMP3Downloder;
