const QRCode = require('qrcode');

const generateQRCodeBase64 = async (text) => {
  return await QRCode.toDataURL(text); // base64 PNG string
};

module.exports = generateQRCodeBase64;
