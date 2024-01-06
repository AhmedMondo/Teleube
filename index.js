require("dotenv").config();
process.env["NTBA_FIX_350"] = 1;
const TelegramBot = require("node-telegram-bot-api");
const ytdl = require("ytdl-core");
const ytpl = require("ytpl");
const MongoDB = require("./Database/database");
const db = new MongoDB();
const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: true,
  filepath: false,
});
const {
  validateScURL,
  validateTiktTokURL,
  getTikTokLink,
  validateInstagramURL,
  getInstagramID,
} = require("./functions/validateURL");
const { getUser } = require("./Database/models/User");
const { getStats } = require("./Database/models/Stats");
const YouTubeChoose = require("./Sources/YouTube/YouTubeChoose.js");
const TikTokChoose = require("./Sources/TikTok/TikTokChoose.js");
const language = require("./Languages");
const InstagramDownloader = require("./Sources/Instagram/instagramDownloader.js");
const SoundcloudDownloader = require("./Sources/SoundCloud/soundcloudDownloader.js");
const YouTubeVideoQuality = require("./Sources/YouTube/YouTubeVideoQuality.js");
const YouTubeMP3Downloder = require("./Sources/YouTube/YouTubeMP3Downloader.js");
const TiktTokMP3Downloder = require("./Sources/TikTok/TikTokMP3Downloader.js");
const TiktTokMP4Downloder = require("./Sources/TikTok/TikTokMP4Downloader.js");
const YouTubeMP4Downloder = require("./Sources/YouTube/YouTubeMP4Downloader.js");

bot.on("message", async (msg) => {
  if (msg.from.is_bot) return;
  let text = msg.text;
  const chatId = msg.chat.id;
  let userData = await getUser(msg.from);
  let botUser = await bot.getMe();
  let globalData = await getStats(botUser);
  let lang = language[userData.language];
  if (text.startsWith("/")) return;
  if (userData.currentConverting >= 3 && !userData.isPremium) {
    return bot.sendMessage(msg.chat.id, lang.premium.max_operation, {
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
  //Youtube Handler
  if (ytdl.validateURL(text)) {
    const message = await bot.sendMessage(chatId, lang.info_load, {
      reply_to_message_id: msg.message_id,
      parse_mode: "HTML",
    });
    globalData.currentConverting += 1;
    await globalData.save();
    userData.currentConverting += 1;
    await userData.save();
    YouTubeChoose(bot, message, msg.text, userData, globalData);
  }
  //TikTok Handler
  else if (validateTiktTokURL(text)) {
    const tiktok_url = getTikTokLink(text);
    let message = await bot.sendMessage(chatId, lang.info_load, {
      reply_to_message_id: msg.message_id,
      parse_mode: "HTML",
    });
    globalData.currentConverting += 1;
    await globalData.save();
    userData.currentConverting += 1;
    await userData.save();
    TikTokChoose(bot, message, tiktok_url, userData, globalData);
  }
  //SoundCloud Handler
  else if (validateScURL(text)) {
    let message = await bot.sendMessage(chatId, lang.info_load, {
      reply_to_message_id: msg.message_id,
      parse_mode: "HTML",
    });

    globalData.currentConverting += 1;
    await globalData.save();
    userData.currentConverting += 1;
    await userData.save();

    SoundcloudDownloader(bot, message, text, userData, globalData);
  }
  //YouTube Playlist Handler
  else if (ytpl.validateID(text)) {
    if (!userData.isPremium) {
      return bot.sendMessage(msg.chat.id, lang.premium.playlist, {
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
    const message = await bot.sendMessage(chatId, lang.info_load, {
      parse_mode: "HTML",
      reply_to_message_id: msg.message_id,
    });
    let playlistInfo = await ytpl(text);
    await bot.editMessageText(
      `Playlist Title: *${playlistInfo.title}*\nChannel: (${playlistInfo.author.name})\nVideos: ${playlistInfo.estimatedItemCount}`,
      {
        chat_id: chatId,
        message_id: message.message_id,
        reply_markup: JSON.stringify({
          inline_keyboard: [
            [
              {
                text: lang.buttons.download_audio,
                callback_data: "audio_playlist",
              },
            ],
            [
              {
                text: lang.buttons.download_video,
                callback_data: "video_playlist",
              },
            ],
          ],
          one_time_keyboard: true,
        }),
      }
    );
  }
  //Instagram Handler
  else if (validateInstagramURL(text)) {
    const postId = getInstagramID(text);
    let message = await bot.sendMessage(chatId, lang.info_load, {
      reply_to_message_id: msg.message_id,
      parse_mode: "HTML",
    });

    globalData.currentConverting += 1;
    await globalData.save();
    userData.currentConverting += 1;
    await userData.save();
    InstagramDownloader(bot, message, postId, userData, globalData);
  }
  //Invalid Links
  else {
    bot.sendMessage(chatId, lang.invalid_link, {
      parse_mode: "HTML",
    });
  }
});

bot.on("callback_query", async function onCallbackQuery(callbackQuery) {
  const action = callbackQuery.data;
  const msg = callbackQuery.message;
  let userData = await getUser(callbackQuery.from);
  let botUser = await bot.getMe();
  let globalData = await getStats(botUser);
  let url = msg.reply_to_message.text;
  let lang = language[userData.language];
  const regexPattern =
    /(\d+)_([0-9a-zA-Z]+)_type_([a-zA-Z]+)_size_([\d.]+ [KMGT]?B)/;
  const matchResult = action.match(regexPattern);
  //YouTube Video Choose Quality
  if (action === "video_youtube") {
    YouTubeVideoQuality(bot, msg, url, userData, globalData);
  }
  //YouTube Video Download
  else if (matchResult && matchResult[3] == "Video") {
    YouTubeMP4Downloder(bot, msg, url, userData, globalData, matchResult);
  }
  //YouTube Audio Download
  else if (action === "audio_youtube") {
    YouTubeMP3Downloder(bot, msg, url, userData, globalData);
  }
  //Change Arabic Language
  else if (action === "arabic_lang") {
    const opts = {
      chat_id: msg.chat.id,
      message_id: msg.message_id,
      parse_mode: "HTML",
    };

    bot.editMessageText("*البوت الآن باللغة العربية* 🇵🇸", opts);

    userData.language = "Arabic";
    userData.activated = true;
    await userData.save();
  }
  //Change English Language
  else if (action === "english_lang") {
    const opts = {
      chat_id: msg.chat.id,
      message_id: msg.message_id,
      parse_mode: "HTML",
    };

    bot.editMessageText("*The bot is now in English* 🇬🇧", opts);

    userData.language = "English";
    userData.activated = true;
    await userData.save();
  }
  //Handle Subscribe System
  else if (action === "subscribe") {
    return bot.sendMessage(msg.chat.id, lang.soon, {
      parse_mode : "HTML",
      reply_to_message_id: callbackQuery.message.message_id,
    });
  }
  //TikTok Audio Download
  else if (action === "audio_tiktok") {
    TiktTokMP3Downloder(bot, msg, url, userData, globalData);
  }
  //TikTok Video Download
  else if (action === "video_tiktok") {
    TiktTokMP4Downloder(bot, msg, url, userData, globalData);
  }
  //YouTube Playlist Download
  else if (action === "youtube_playlist_choose") {
    return bot.sendMessage(msg.chat.id, lang.soon, {
      parse_mode : "HTML",
      reply_to_message_id: callbackQuery.message.message_id,
    });
  }
});

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  let userData = await getUser(msg.from);
  // Send a message with the introduction and instructions
  bot.sendMessage(chatId, language[userData.language].welcome_message, {
    parse_mode: "HTML",
  });
});
bot.onText(/\/lang/ || /\/language/ || /\/لغة/ || /\/لغه/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    `Hello <b>${msg.from.first_name || msg.from.username}</b>! 🌟
  You can change the language by choosing your preferred language: 🌐
  مرحبًا <b>${msg.from.first_name || msg.from.username}</b>! 🌟
  يمكنك تغيير اللغة عن طريق اختيار لغتك المفضلة: 🌐`,
    {
      parse_mode: "HTML",
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [{ text: "عربي 🇵🇸", callback_data: "arabic_lang" }],
          [{ text: "English 🇬🇧", callback_data: "english_lang" }],
        ],
        one_time_keyboard: true,
      }),
      reply_to_message_id: msg.message_id,
    }
  );
});

bot.getMe().then(async (client) => {
  console.log(`Logged as ${client.username}`);
  await db.init();
});
