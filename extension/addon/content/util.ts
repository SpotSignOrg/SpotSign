export const escapeRegExp = (input: string) => {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
};

export const SIGN_HOST = "https://spotsign.org";

export const BASE64_RE = "[a-zA-Z0-9\\_\\-%]*";
export const AMP_RE = "&(?:amp;)?";
export const SIGNATURES_RE = new RegExp(
  `${escapeRegExp(
    SIGN_HOST,
  )}\\/v\\/\\?a=(.)${AMP_RE}b=(.)${AMP_RE}c=(\\d+)${AMP_RE}d=(${BASE64_RE})${AMP_RE}s=(${BASE64_RE})${AMP_RE}k=(${BASE64_RE})`,
  "gm",
);
