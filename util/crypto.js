"use strict";
const CryptoJS = require("crypto-js");
module.exports = {
  aesEncrypt: aesEncrypt,
  aesDecrypt: aesDecrypt,
};

// var secret_key = 'rkv3ebsuGZM8a/x/bXAdmz++b1FIj97x0ui90orQdHM=';
// var secret_iv = 'f/JWlbtLPA/ux7ypiZc3oQ==';

// function aesEncrypt(content) {
// const parsedkey = CryptoJS.enc.Utf8.parse(secret_key);
// const iv = CryptoJS.enc.Utf8.parse(secret_iv);
// const encrypted = CryptoJS.AES.encrypt(content, parsedkey, { iv: iv, mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
// return encrypted.toString();
// };

// function aesDecrypt(word) {
// var keys = CryptoJS.enc.Utf8.parse(secret_key);
// let base64 = CryptoJS.enc.Base64.parse(word);
// let src = CryptoJS.enc.Base64.stringify(base64);
// var decrypt = CryptoJS.AES.decrypt(src, keys, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
// return decrypt.toString(CryptoJS.enc.Utf8);
// };

//sample code for => crypto-js
//crypto-js
//https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.2/rollups/aes.js
//https://www.npmjs.com/package/crypto-js

var key = "rkv3ebsuGZM8a/x/bXAdmz++b1FIj97x0ui90orQdHM=";
var iv = "f/JWlbtLPA/ux7ypiZc3oQ==";

function aesEncrypt(plainText) {
  var encrypted = CryptoJS.AES.encrypt(
    plainText,
    CryptoJS.enc.Base64.parse(key),
    {
      iv: CryptoJS.enc.Base64.parse(iv),
    }
  );
  return encrypted.ciphertext.toString(CryptoJS.enc.Base64);
}

function aesDecrypt(cipherText) {
  let cipherParams = CryptoJS.lib.CipherParams.create({
    ciphertext: CryptoJS.enc.Base64.parse(cipherText),
  });

  let decrypted = CryptoJS.AES.decrypt(
    cipherParams,
    CryptoJS.enc.Base64.parse(key),
    {
      iv: CryptoJS.enc.Base64.parse(iv),
    }
  );
  return decrypted.toString(CryptoJS.enc.Utf8);
}
