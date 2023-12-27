exports.validateScURL = (url) => {
  let regex =
  /^https?:\/\/(soundcloud\.com|snd\.sc)\/([A-Za-z0-9_-]+)\/([A-Za-z0-9_-]+)(\/[^?#]*)?(?:[?#].*)?$/;
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
  let res = url.match(regex)[0]
  return res;

}

exports.getSoundcloudLink = (url) => {
  let regex =
  /https?:\/\/(soundcloud\.com|snd\.sc)\/([A-Za-z0-9_-]+)\/([A-Za-z0-9_-]+)(\/[^?#]*)?/g;
  let res = url.match(regex)[0]
  return res;
};