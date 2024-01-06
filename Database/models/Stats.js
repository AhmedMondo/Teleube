const mongoose = require("mongoose");
let number = {
  type: Number,
  default: 0
}
const Schema = new mongoose.Schema({
  _id: String,
  botUsername : String,
  totalYoutubeMP4: number,
  totalYoutubeMP3: number,
  totalTikTiokMP4: number,
  totalTikTiokMP3: number,
  totalInstagram: number,
  totalSoundCloud: number,
  totalSpotify: number,
  totalVideos: number,
  totalSounds: number,
  totalEverything: number,
  currentConverting : number
});

const Model = mongoose.model("Stats", Schema);

module.exports = {

  getStats: async (bot) => {
    if (!bot) throw new Error("BotId is undefined");
    if (!bot.id) throw new Error("BotId is undefined");
    let botData = await Model.findById(bot.id);
    if (!botData) {
      botData = new Model({
        _id: bot.id,
        botUsername: bot.username,
        totalYoutubeMP4: 0,
        totalYoutubeMP3: 0,
        totalTikTiokMP4: 0,
        totalTikTiokMP3: 0,
        totalSoundCloud: 0,
        totalInstagram: 0,
        totalSpotify: 0,
        totalVideos: 0,
        totalSounds: 0,
        totalEverything: 0,
        currentConverting : 0
      });
      await botData.save();
    }
    return botData;
  },
};