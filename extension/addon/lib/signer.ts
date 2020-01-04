import base64url from "base64url";

const DATETIME_LEN = 24;
const ECDSA_KEY = {
  name: "ECDSA",
  namedCurve: "P-256",
};
const ECDSA_SIGN = {
  name: "ECDSA",
  hash: "SHA-256",
};

const str2ab = (input: string) => {
  const output = new ArrayBuffer(input.length);
  const uint8 = new Uint8Array(output);
  for (let i = 0, strLen = input.length; i < strLen; i++) {
    uint8[i] = input.charCodeAt(i);
  }
  return output;
};

const ab2str = (input: ArrayBuffer) => {
  return String.fromCharCode.apply(null, new Uint8Array(input));
};

const exportPublicKey = async (publicKey: CryptoKey) =>
  base64url.encode(ab2str(await window.crypto.subtle.exportKey("raw", publicKey)));

const exportPrivateKey = async (privateKey: CryptoKey) =>
  JSON.stringify(await window.crypto.subtle.exportKey("jwk", privateKey));

const importPublicKey = async (publicKeyStr: string) =>
  await window.crypto.subtle.importKey(
    "raw",
    str2ab(base64url.decode(publicKeyStr)),
    ECDSA_KEY,
    true,
    ["verify"],
  );

const importPrivateKey = async (privateKeyStr: string) =>
  await window.crypto.subtle.importKey("jwk", JSON.parse(privateKeyStr), ECDSA_KEY, true, ["sign"]);

const arrayConcat = (a: Uint8Array, b: Uint8Array) => {
  const c = new Uint8Array(a.length + b.length);
  c.set(a);
  c.set(b, a.length);
  return c;
};

const getKeys = async () => {
  const keyPair = await window.crypto.subtle.generateKey(ECDSA_KEY, true, ["sign", "verify"]);

  return {
    publicKey: await exportPublicKey(keyPair.publicKey),
    privateKey: await exportPrivateKey(keyPair.privateKey),
    keyPair,
  };
};

export const signMessage = async (privateKeyStr: string, messageStr: string) => {
  const privateKey = await importPrivateKey(privateKeyStr);

  const enc = new TextEncoder();
  const datetimeStr = new Date().toISOString();

  const datetimeArray = enc.encode(datetimeStr);
  const messageArray = enc.encode(messageStr);
  const datetimeMessageArray = arrayConcat(datetimeArray, messageArray);

  const signatureArrayBuffer = await window.crypto.subtle.sign(
    ECDSA_SIGN,
    privateKey,
    datetimeMessageArray,
  );
  const datetimeSignatureArray = arrayConcat(datetimeArray, new Uint8Array(signatureArrayBuffer));

  return { signature: base64url.encode(ab2str(datetimeSignatureArray)) };
};

export const verifyMessage = async (
  publicKeyStr: string,
  datetimeSignatureStr: string,
  messageStr: string,
) => {
  const publicKey = await importPublicKey(publicKeyStr);

  const datetimeSignatureArray = new Uint8Array(str2ab(base64url.decode(datetimeSignatureStr)));
  const datetimeArray = datetimeSignatureArray.slice(0, DATETIME_LEN);
  const signatureArray = datetimeSignatureArray.slice(DATETIME_LEN);

  const enc = new TextEncoder();
  const messageArray = enc.encode(messageStr);
  const datetimeMessageArray = arrayConcat(datetimeArray, messageArray);

  const verified = await window.crypto.subtle.verify(
    ECDSA_SIGN,
    publicKey,
    signatureArray,
    datetimeMessageArray,
  );

  const dec = new TextDecoder();
  const datetimeDecoded = dec.decode(datetimeArray);

  return {
    verified: verified,
    datetime: datetimeDecoded,
  };
};

export default { getKeys, signMessage, verifyMessage };
