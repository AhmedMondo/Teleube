const axios = require("axios");
exports.validateScURL = (url) => {
  let regex =
  /^(https?:\/\/((?:on\.)?soundcloud\.com|snd\.sc)\/[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)?(?:\/.*)?)(?:\?.*)?$/;
  let res = regex.test(url) ? true : false;
  return res;
};

exports.validateTiktTokURL = (url) => {
  let regex =
    /^.*https:\/\/(?:m|www|vm)?\.?tiktok\.com\/((?:.*\b(?:(?:usr|v|embed|user|video)\/|\?shareId=|\&item_id=)(\d+))|\w+)/g;
  let res = regex.test(url) ? true : false;
  return res;
};

exports.getTikTokLink = (url) => {
  let regex =
    /^.*https:\/\/(?:m|www|vm)?\.?tiktok\.com\/((?:.*\b(?:(?:usr|v|embed|user|video)\/|\?shareId=|\&item_id=)(\d+))|\w+)/g;
  let res = url.match(regex)[0];
  return res;
};

exports.getSoundcloudLink = async (url) => {
  let regex =
  /^(https?:\/\/((?:on\.)?soundcloud\.com|snd\.sc)\/[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)?(?:\/.*)?)(?:\?.*)?$/;
  try {
    const response = await axios.get(url, { maxRedirects: 0 });
    return response.request.res.responseUrl ? response.request.res.responseUrl.match(regex)[1] : url.match(regex)[1];
  } catch (error) {
    if (
      error.response &&
      error.response.status === 302 &&
      error.response.headers.location
    ) {
      return error.response.headers.location ? error.response.headers.location.match(regex)[1] : url.match(regex)[1];
    }
    throw error.match(regex)[1];
  }
}

exports.validateSpotifyURL = (url) => {
  let regex = /(https?:\/\/)(www\.)?open\.spotify\.com\/((?<region>[a-zA-Z-]+)\/)?(user\/(?<user>[a-zA-Z0-9-_]+)\/)?(?<type>track|album|playlist|artist)\/(?<identifier>[a-zA-Z0-9-_]+)/;
  let res = regex.test(url) ? true : false;
  return res;
}

exports.getSpotifyURL = (url) => {
  let regex = /(https?:\/\/)(www\.)?open\.spotify\.com\/((?<region>[a-zA-Z-]+)\/)?(user\/(?<user>[a-zA-Z0-9-_]+)\/)?(?<type>track|album|playlist|artist)\/(?<identifier>[a-zA-Z0-9-_]+)/;

  const match = regex.exec(url);
if (match !== null) {
  const { groups } = match;
  let obj = {}
  obj.trackURL = match[0]
  obj.identifier = groups.identifier
  obj.type = groups.type
  console.log('Full match:', match[0]);
  console.log('Region:', groups.region || 'N/A');
  console.log('User:', groups.user || 'N/A');
  console.log('Type:', groups.type);
  console.log('Identifier:', groups.identifier);
} else {
  console.log('No match found.');
}
}


exports.validateInstagramURL = (url) => {
  let regex = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel|reels)\/([\w\-]+)\/?/;
  let res = regex.test(url) ? true : false;
  return res;
}

exports.getInstagramID = (url) => {
  let regex = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel|reels)\/([\w\-]+)\/?/;

  const match = url.match(regex);
  if (match && match[1]) {
    return match[1]; 
  } else {
    return null; 
  }
}