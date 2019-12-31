const DATETIME_LEN = 24;
const ECDSA = {
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

const exportPublicKey = async (publicKey: CryptoKey) => {
  return btoa(ab2str(await window.crypto.subtle.exportKey("raw", publicKey)));
};

const arrayConcat = (a: Uint8Array, b: Uint8Array) => {
  const c = new Uint8Array(a.length + b.length);
  c.set(a);
  c.set(b, a.length);
  return c;
};

const getKeys = async () => {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "ECDSA",
      namedCurve: "P-256",
    },
    true,
    ["sign", "verify"],
  );

  return {
    publicKey: await exportPublicKey(keyPair.publicKey),
    keyPair,
  };
};

export const signMessage = async (privateKey: CryptoKey, messageStr: string) => {
  const enc = new TextEncoder();
  const datetimeStr = new Date().toISOString();

  const datetimeArray = enc.encode(datetimeStr);
  const messageArray = enc.encode(messageStr);
  const contentArray = arrayConcat(datetimeArray, messageArray);

  const signatureArrayBuffer = await window.crypto.subtle.sign(ECDSA, privateKey, contentArray);
  const datetimeSignatureArray = arrayConcat(datetimeArray, new Uint8Array(signatureArrayBuffer));

  return { signature: btoa(ab2str(datetimeSignatureArray)) };
};

export const verifyMessage = async (
  publicKey: CryptoKey,
  datetimeSignatureStr: string,
  messageStr: string,
) => {
  const datetimeSignatureArray = new Uint8Array(str2ab(atob(datetimeSignatureStr)));
  const datetimeArray = datetimeSignatureArray.slice(0, DATETIME_LEN);
  const signatureArray = datetimeSignatureArray.slice(DATETIME_LEN);

  const enc = new TextEncoder();
  const messageArray = enc.encode(messageStr);
  const datetimeMessageArray = arrayConcat(datetimeArray, messageArray);

  const verified = await window.crypto.subtle.verify(
    ECDSA,
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
