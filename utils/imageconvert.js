const {createCanvas,loadImage} = require("canvas");
const base64Img = require('base64-img');


function getImageType(array) {
    const header = array.slice(0, 4);
    const view = new DataView(header.buffer);
    const magic = view.getUint32(0);
    switch (magic) {
      case 0x89504e47:
        return 'image/png';
      case 0xffd8ffe0:
      case 0xffd8ffe1:
      case 0xffd8ffe2:
        return 'image/jpeg';
      case 0x47494638:
        return 'image/gif';
      default:
        return null;
    }
}

// function base64ToShortUrl(base64String) {
//   const buffer = Buffer.from(base64String, 'base64');
//   const shortUrl = `data:image/png;base64,${buffer.toString('base64')}`;
//   return shortUrl;
// }




async function getImageUrl(imageData){
  const array = new Uint8Array(imageData);
  const typetext = getImageType(array);
  const blob = new Blob([array], { type: typetext.toString()});
  const url = URL.createObjectURL(blob);
  // return url;

  const canvas = createCanvas(100, 100);
  const ctx = canvas.getContext('2d');
  const img = await loadImage(Buffer.from(imageData));
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);
  const dataUrl = canvas.toDataURL(typetext);
  // console.log(dataUrl);
  return dataUrl;
}

module.exports = getImageUrl;