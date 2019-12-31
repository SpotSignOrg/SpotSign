const DATETIME_LEN = 24;
const ECDSA = {
  name: "ECDSA",
  hash: "SHA-256",
};

const str2ab = (decoded: string) => {
  const buf = new ArrayBuffer(decoded.length);
  const uint8 = new Uint8Array(buf);
  for (let i = 0, strLen = decoded.length; i < strLen; i++) {
    uint8[i] = decoded.charCodeAt(i);
  }
  return buf;
};

const ab2str = (buf: ArrayBuffer) => {
  const uint8 = new Uint8Array(buf);
  return String.fromCharCode.apply(null, uint8);
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

  const keys = {
    publicKey: await exportPublicKey(keyPair.publicKey),
    keyPair,
  };
  console.log("generated", keys);
  return keys;
};

export const signMessage = async (privateKey: CryptoKey, message: string) => {
  const enc = new TextEncoder();
  const datetime = new Date().toISOString();
  const datetimeEncoded = enc.encode(datetime);
  const messageEncoded = enc.encode(message);
  const contentEncoded = arrayConcat(datetimeEncoded, messageEncoded);
  const signature = await window.crypto.subtle.sign(ECDSA, privateKey, contentEncoded);
  const datetimeSignature = arrayConcat(datetimeEncoded, new Uint8Array(signature));

  return { signature: btoa(ab2str(datetimeSignature)) };
};

export const verifyMessage = async (
  publicKey: CryptoKey,
  signatureRaw: string,
  message: string,
) => {
  const datetimeSignature = new Uint8Array(str2ab(atob(signatureRaw)));
  const datetime = datetimeSignature.slice(0, DATETIME_LEN);
  const signature = datetimeSignature.slice(DATETIME_LEN);

  const enc = new TextEncoder();
  const messageEncoded = enc.encode(message);
  const datetimeMessageEncoded = arrayConcat(datetime, messageEncoded);
  const verification = await window.crypto.subtle.verify(
    ECDSA,
    publicKey,
    signature,
    datetimeMessageEncoded,
  );

  const dec = new TextDecoder();
  const datetimeDecoded = dec.decode(datetime);

  return {
    verified: verification,
    datetime: datetimeDecoded,
  };
};

export default { getKeys, signMessage, verifyMessage };
