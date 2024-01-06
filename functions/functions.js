const check = require("./fileSize");
require("dotenv").config();

exports.megabytesToBytes = (megabytes) => {
  const bytesInMB = 1024 * 1024;
  return megabytes * bytesInMB;
};

// Function to simulate an asynchronous task (can be replaced with your actual asynchronous tasks)
exports.simulateAsyncTask = (item, chatId, type , userData) => {
  return new Promise(async (resolve) => {
    // Simulating some asynchronous operation (e.g., API call, file I/O)
    let size;
    size = await check(item.url, userData);

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
exports.performAsyncTasks = async (items, chatId, type , userData) => {
  const results = [];
  const asyncTasks = items.map(async (item) => {
    const result = await this.simulateAsyncTask(item, chatId, type , userData);
    results.push(result);
  });

  await Promise.all(asyncTasks);
  return results; // Return the results if needed for further processing
};

exports.convertToBytes = (size) => {
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
