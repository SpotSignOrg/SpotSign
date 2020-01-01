export function escapeRegExp(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

export const SIGN_HOST = "https://spotsign.org";
export const SPECIAL_CHARACTERS = "\r\n !\"#$%&'()*+,-./:;<=>?@[]^_`{|}~";
export const SPECIAL_CHARACTERS_RE = new RegExp(
  SPECIAL_CHARACTERS.split("")
    .map(e => `\\${e}`)
    .join("|"),
  "gm",
);
export const BASE64_RE = "[a-zA-Z0-9\\_\\-%]*";
export const AMP_RE = "&(?:amp;)?";
export const SIGNATURES_RE = new RegExp(
  `${escapeRegExp(
    SIGN_HOST,
  )}\\/v\\/\\?a=(.)${AMP_RE}b=(.)${AMP_RE}c=(\\d+)${AMP_RE}s=(${BASE64_RE})${AMP_RE}k=(${BASE64_RE})`,
  "gm",
);

export function stripContent(content: string) {
  return content.replace(SPECIAL_CHARACTERS_RE, "").trim();
}
