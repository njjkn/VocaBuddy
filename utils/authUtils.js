const CryptoJS = require('crypto-js');

const secretKey = process.env.ACCESS_TOKEN_SECRET_KEY;

const decryptData = (data) => {
  try {
    const decryptedData = CryptoJS.AES.decrypt(data, secretKey).toString(CryptoJS.enc.Utf8);
    return decryptedData;
  } catch (error) {
    console.log(error); 
  }
}

const encryptData = (data) => {
  try {
    const encryptedData = CryptoJS.AES.encrypt(data, secretKey).toString();
    return encryptedData;
  } catch (error) {
    console.log(error)
  }
}

const decryptObjectData = (data) => {
  try {
    const decryptedData = CryptoJS.AES.decrypt(data, secretKey).toString(CryptoJS.enc.Utf8);
    const decryptedDocument = JSON.parse(decryptedData)
    return decryptedDocument;
  } catch (error) {
    console.log(error); 
  }
}


module.exports = {
  decryptData,
  encryptData,
  decryptObjectData
}