const axios = require("axios");
const SoundCloud = require("soundcloud-scraper");
const language = require("../../Languages");
const { getSoundcloudLink } = require("../../functions/validateURL");
const check = require("../../functions/fileSize");
const soundcloud = new SoundCloud.Client();
async function SoundcloudDownloader(bot, msg, text, userData, globalData) {
  let opts = {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
    parse_mode: "HTML"
  };
  let lang = language[userData.language]

  soundcloud
    .getSongInfo(await getSoundcloudLink(text))
    .then(async (song) => {
      let url = await soundcloud.fetchStreamURL(song.trackURL);
      try {
        const response = await axios({
          method: "GET",
          url: url,
          responseType: "arraybuffer",
        });
        let size = await check(url, userData);
        bot.editMessageText(`${lang.uploading} (${size})`, opts);

        return bot
          .sendAudio(
            msg.chat.id,
            response.data,
            {
              caption: `${song.title}`,
              reply_to_message_id: msg.message_id,
            },
            {
              contentType: "audio/mpeg",
              filename: `${song.title}.mpeg`,
            }
          )
          .then(async () => {
            userData.totalSoundCloud += 1;
            (userData.totalEverything += 1),
              (userData.currentConverting -= 1);
            await userData.save();
            (globalData.totalSoundCloud += 1),
              (globalData.totalEverything += 1),
              (globalData.currentConverting -= 1);
            await globalData.save();
            bot.editMessageText(lang.thank_message, opts);
          })
          .catch((err) => {
            bot.editMessageText(lang.error.general + err.message, opts);
          });
      } catch (error) {
        bot.editMessageText(
          lang.error.download_video + error,
          opts
        );
        console.error("Error downloading the video:", error);
      }
    })
    .catch(async () => {
      globalData.currentConverting -= 1;
      await globalData.save();
      userData.currentConverting -= 1;
      await userData.save();
      bot.editMessageText(lang.soundcloud.invalid_track, opts);
    });

}

module.exports = SoundcloudDownloader;
