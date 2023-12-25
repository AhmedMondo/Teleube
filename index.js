require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const ytdl = require("ytdl-core");
const check = require("./functions/fileSize");
const axios = require("axios");
// Create a bot instance
const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new TelegramBot(BOT_TOKEN, { polling: true });
// Function to download a YouTube video and send it as a video file
async function downloadVideo(msg, url) {
  try {
    // Get video information and thumbnail URL
    const videoInfo = await ytdl.getInfo(url);
    const { title, author, isLive } = videoInfo.videoDetails;
    if (isLive) {
      return bot.editMessageText("Live cannot be downloaded.", {
        chat_id: msg.chat.id,
        message_id: msg.message_id,
      });
    }

    await bot.editMessageText(
      `Video Title: *${title}*\nChannel: (${author.name})`,
      {
        chat_id: msg.chat.id,
        message_id: msg.message_id,
        reply_markup: JSON.stringify({
          inline_keyboard: [
            [{ text: "Download as Audio MP3", callback_data: "audio" }],
            [{ text: "Download as Video MP4", callback_data: "video" }],
          ],
          one_time_keyboard: true,
        }),
      }
    );
    // When the download is complete, send the video and delete the file
  } catch (error) {
    if (error.message == "Video unavailable") {
      return bot.editMessageText("This Video is deleted or unavailable", {
        chat_id: msg.chat.id,
        message_id: msg.message_id,
      });
    }
    bot.editMessageText("Error while getting Video Info", {
      chat_id: msg.chat.id,
      message_id: msg.message_id,
    });
    console.error(error);
  }
}

bot.on("message", async (msg) => {
  /* if(msg.chat.type !== "private") return; */
  let text = msg.text;
  const chatId = msg.chat.id;
  if (text == "/start") return;
  if (ytdl.validateURL(text)) {
    const message = await bot.sendMessage(
      chatId,
      "⏳ Obtaining Information...",
      {
        reply_to_message_id: msg.message_id,
      }
    );
    downloadVideo(message, text);
  } else {
    bot.sendMessage(chatId, "This is not Valid YouTube URL");
  }
});

bot.on("callback_query", async function onCallbackQuery(callbackQuery) {
  const action = callbackQuery.data;
  const msg = callbackQuery.message;
  let url = msg.reply_to_message.text;
  const regexPattern =
    /(\d+)_([0-9a-zA-Z]+)_type_([a-zA-Z]+)_size_([\d.]+ [KMGT]?B)/;
  const matchResult = action.match(regexPattern);

  if (action === "video") {
    var opts = {
      chat_id: msg.chat.id,
      message_id: msg.message_id,
    };
    bot.editMessageText("Getting video Quality", opts);
    ytdl(`${url}`).on("info", (info) => {
      let formats = info.formats.filter((s) => s.hasVideo && s.hasAudio); // get Videos
      performAsyncTasks(formats, msg.chat.id, "Video")
        .then((finalResults) => {
          var finalOpts = {
            chat_id: msg.chat.id,
            message_id: msg.message_id,
            reply_markup: JSON.stringify({
              inline_keyboard: [finalResults],
              one_time_keyboard: true,
            }),
          };
          bot
            .editMessageText("Choose Video Quality: ", finalOpts)
            .catch((err) => {
              bot.editMessageText("Error Happened:\n" + err.message, opts);
            });
        })
        .catch((err) => {
          bot.editMessageText("Error Happened:\n" + err.message, ops);
          console.error("Error:", err);
        });
    });
  } else if (matchResult && matchResult[3] == "Video") {
    var opts = {
      chat_id: msg.chat.id,
      message_id: msg.message_id,
    };
    let size = matchResult[4];
    let sizeCheck = convertToBytes(size);
    let mainChekcer = megabytesToBytes(50);
    if (sizeCheck > mainChekcer) {
      var opts = {
        chat_id: msg.chat.id,
        message_id: msg.message_id,
        reply_markup: JSON.stringify({
          inline_keyboard: [
            [{ text: "Subscribe", callback_data: "subscribe" }],
          ],
          one_time_keyboard: true,
        }),
      };
      return bot.sendMessage(
        msg.chat.id,
        "Sorry but the video is bigger than 50MBs You can subscribe if you want to download big videos",
        {
          reply_markup: JSON.stringify({
            inline_keyboard: [
              [{ text: "Subscribe", callback_data: "subscribe" }],
            ],
            one_time_keyboard: true,
          }),
          reply_to_message_id: callbackQuery.message.message_id,
        }
      );
    }
    bot
      .editMessageText("Ok Hold on little bit we do some magic here.", opts)
      .then(() => {
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
            bot.editMessageText(
              `Uploading to Telegram... (${matchResult[4]})`,
              opts
            );
            return bot
              .sendVideo(msg.chat.id, response.data)
              .then(() => {
                bot.editMessageText("Thank you for using Teleube.", opts);
              })
              .catch((err) => {
                bot.editMessageText("Error Happened: \n\n" + err.message, opts);
              });
          } catch (error) {
            bot.editMessageText(
              "Error downloading the video: \n\n" + error,
              opts
            );
            console.error("Error downloading the video:", error);
          }
        });
      });
  } else if (action === "subscribe") {
    return bot.sendMessage(msg.chat.id, "Coming Soon..", {
      reply_to_message_id: callbackQuery.message.message_id,
    });
  } else if (action === "audio") {
    var opts = {
      chat_id: msg.chat.id,
      message_id: msg.message_id,
    };
    bot.editMessageText("Getting Audio Quality", opts);
    ytdl(`${url}`).on("info", (info) => {
      let durationInSeconds = info.videoDetails.lengthSeconds;
      let tenMinutesInSeconds = 10 * 60

      if (durationInSeconds > tenMinutesInSeconds) {
        return bot.sendMessage(
          msg.chat.id,
          "Sorry but the Audio is longer than 10 Minutes You can subscribe if you want to download long audios",
          {
            reply_markup: JSON.stringify({
              inline_keyboard: [
                [{ text: "Subscribe", callback_data: "subscribe" }],
              ],
              one_time_keyboard: true,
            }),
            reply_to_message_id: callbackQuery.message.message_id,
          }
        );      
      }
      let formats = info.formats.filter((s) => !s.hasVideo && s.hasAudio); // get Videos
      performAsyncTasks(formats, msg.chat.id, "Audio")
        .then((finalResults) => {
          var finalOpts = {
            chat_id: msg.chat.id,
            message_id: msg.message_id,
            reply_markup: JSON.stringify({
              inline_keyboard: [finalResults],
              one_time_keyboard: true,
            }),
          };
          bot
            .editMessageText("Choose Audio Quality: ", finalOpts)
            .catch((err) => {
              bot.editMessageText("Error Happened:\n" + err.message, opts);
            });
        })
        .catch((err) => {
          bot.editMessageText("Error Happened:\n" + err.message, opts);
          console.error("Error:", err);
        });
    });
  } else if (matchResult && matchResult[3] == "Audio") {
    var opts = {
      chat_id: msg.chat.id,
      message_id: msg.message_id,
    };
    let size = matchResult[4];
    let sizeCheck = convertToBytes(size);
    let mainChekcer = megabytesToBytes(50);
    if (sizeCheck > mainChekcer) {
      var opts = {
        chat_id: msg.chat.id,
        message_id: msg.message_id,
        reply_markup: JSON.stringify({
          inline_keyboard: [
            [{ text: "Subscribe", callback_data: "subscribe" }],
          ],
          one_time_keyboard: true,
        }),
      };
      return bot.sendMessage(
        msg.chat.id,
        "Sorry but the Audio is bigger than 50MBs You can subscribe if you want to download big audios",
        {
          reply_markup: JSON.stringify({
            inline_keyboard: [
              [{ text: "Subscribe", callback_data: "subscribe" }],
            ],
            one_time_keyboard: true,
          }),
          reply_to_message_id: callbackQuery.message.message_id,
        }
      );
    }
    bot
      .editMessageText("Ok Hold on little bit we do some magic here.", opts)
      .then(() => {
        ytdl(`${url}`).on("info", async (info) => {
          let audio = info.formats.filter(
            (s) => !s.hasVideo && s.hasAudio && s.audioBitrate == matchResult[2]
          )[0]; // get the Video

          try {
            const audioStream = ytdl.downloadFromInfo(info, {
              format: audio.itag,
            });

            const buffers = [];
            audioStream.on("data", (chunk) => {
              buffers.push(chunk);
            });

            return new Promise((resolve, reject) => {
              audioStream.on("end", () => {
                const audioBuffer = Buffer.concat(buffers);
                bot
                  .sendVoice(msg.chat.id, audioBuffer)
                  .then(() => {
                    bot.editMessageText("Thank you for using Teleube.", opts);
                  })
                  .catch((err) => {
                    bot.editMessageText(
                      "Error Happened: \n\n" + err.message,
                      opts
                    );
                  });
                resolve(audioBuffer);
              });

              audioStream.on("error", (err) => {
                bot.editMessageText("Error Happened: \n\n" + err.message, opts);
                reject(err);
              });
            });
          } catch (error) {
            bot.editMessageText(
              "Error downloading the audio: \n\n" + error,
              opts
            );
            console.error("Error downloading the audio:", error);
          }
        });
      });
  }
});

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  // Send a message with the introduction and instructions
  bot.sendMessage(
    chatId,
    `Hey, I am Teleube made by @Ahmed_Mondo. Use the following commands to use me! 
    
What command ? just put the youtube video link and see the magic.`
  );
});

bot.getMe().then((client) => {
  console.log(`Logged as ${client.username}`);
});

// Function to simulate an asynchronous task (can be replaced with your actual asynchronous tasks)
const simulateAsyncTask = (item, chatId, type) => {
  return new Promise(async (resolve) => {
    // Simulating some asynchronous operation (e.g., API call, file I/O)
    let size;
    size = await check(item.url);

    if (type == "Video") {
      resolve({
        text: `${item.qualityLabel} (${size})`,
        callback_data: `${chatId}_${item.qualityLabel}_type_${type}_size_${size}`,
      });
    } else if (type == "Audio") {
      resolve({
        text: `${item.audioBitrate} kbps`,
        callback_data: `${chatId}_${item.audioBitrate}_type_${type}_size_${size}`,
      });
    }
  });
};

// Your forEach loop
const performAsyncTasks = async (items, chatId, type) => {
  const results = [];
  const asyncTasks = items.map(async (item) => {
    const result = await simulateAsyncTask(item, chatId, type);
    results.push(result);
  });

  await Promise.all(asyncTasks);
  return results; // Return the results if needed for further processing
};

const convertToBytes = (size) => {
  const units = {
    KB: 1024,
    MB: 1024 * 1024,
    GB: 1024 * 1024 * 1024,
    TB: 1024 * 1024 * 1024 * 1024,
  };

  const regex = /^(\d+(\.\d+)?)\s*(KB|MB|GB|TB)$/i;
  const match = size.match(regex);

  if (!match) {
    throw new Error('Invalid size format. Please use format like "5.2 MB".');
  }

  const value = parseFloat(match[1]);
  const unit = match[3].toUpperCase();

  if (!units[unit]) {
    throw new Error("Invalid unit. Use KB, MB, GB, or TB.");
  }

  return value * units[unit];
};

const megabytesToBytes = (megabytes) => {
  const bytesInMB = 1024 * 1024;
  return megabytes * bytesInMB;
};
