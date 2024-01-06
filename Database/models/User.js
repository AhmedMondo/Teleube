const mongoose = require("mongoose");
let number = {
  type: Number,
  default: 0,
};
const Schema = new mongoose.Schema({
  _id: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  activated: { type: Boolean, default: false, required: true },
  language: {
    type: String,
    default: "English",
    required: true,
  },
  isPremium: { type: Boolean, default: false, required: true },
  totalYoutubeMP4: number,
  totalYoutubeMP3: number,
  totalTikTiokMP4: number,
  totalTikTiokMP3: number,
  totalSoundCloud: number,
  totalInstagram: number,
  totalSpotify: number,
  totalVideos: number,
  totalSounds: number,
  totalEverything: number,
  currentConverting: number,
});

const Model = mongoose.model("user", Schema);

module.exports = {
  getUser: async (user) => {
    if (!user) throw new Error("User is required.");
    if (!user.id) throw new Error("User Id is required.");

    let userDb = await Model.findById(user.id);
    if (!userDb) {
      userDb = new Model({
        _id: user.id,
        username: user.username,
        activated: false,
        language: "Arabic",
        isPremium: false,
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
        currentConverting: 0,
      });
      await userDb.save();
    }
    return userDb;
  },
};
