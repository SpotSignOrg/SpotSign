import base64url from "base64url";

const SPECIAL_CHARACTERS = "\r\n !\"#$%&'()*+,-./:;<=>?@[]^_`{|}~";
const SPECIAL_CHARACTERS_RE = new RegExp(
  SPECIAL_CHARACTERS.split("")
    .map(e => `\\${e}`)
    .join("|"),
  "gm",
);
const DELIMITER = -1;

const str2arr = (input: string) => {
  const output = new Int16Array(input.length);
  for (let i = 0, strLen = input.length; i < strLen; i++) {
    output[i] = input.charCodeAt(i);
  }
  return output;
};

const arr2str = (input: Int16Array) => {
  return String.fromCharCode.apply(null, new Int16Array(input));
};

export const stripContent = (content: string) => content.replace(SPECIAL_CHARACTERS_RE, "");

export const diffContent = (content: string) => {
  const matches = content.matchAll(SPECIAL_CHARACTERS_RE);
  const charsIndexes = new Map<string, number[]>();

  for (const char of SPECIAL_CHARACTERS) {
    charsIndexes.set(char, []);
  }

  for (const match of matches) {
    const char = match[0];
    if (match.index !== undefined) {
      const charIndexes = charsIndexes.get(char);
      if (charIndexes) {
        charIndexes.push(match.index);
      }
    }
  }

  let diffSize = 0;
  for (const indexArray of charsIndexes.values()) {
    if (indexArray.length) {
      diffSize += indexArray.length + 2;
    }
  }

  const diff = new Int16Array(diffSize);
  let currDiff = 0;

  for (const char of charsIndexes.keys()) {
    const charIndexes = charsIndexes.get(char);
    if (charIndexes && charIndexes.length) {
      diff[currDiff++] = SPECIAL_CHARACTERS.indexOf(char);
      if (charIndexes) {
        for (const index of charIndexes) {
          diff[currDiff++] = index;
        }
      }
      diff[currDiff++] = DELIMITER;
    }
  }

  return base64url.encode(arr2str(diff));
};

export const undiffContent = (content: string, diffStr: string) => {
  const diff = str2arr(base64url.decode(diffStr));
  const charsIndexes: [string, number][] = [];

  let currDiff = 0;
  let currChar = SPECIAL_CHARACTERS[diff[currDiff++]];

  while (true) {
    if (currDiff >= diff.length) break;

    charsIndexes.push([currChar, diff[currDiff++]]);

    if (diff[currDiff] === DELIMITER) {
      currChar = SPECIAL_CHARACTERS[diff[++currDiff]];
      currDiff++;
      continue;
    }
  }

  const sortedCharsIndexes = charsIndexes.sort((a, b) => (a[1] > b[1] ? 1 : -1));

  let undiffedContent = content;
  for (const [char, index] of sortedCharsIndexes) {
    undiffedContent = undiffedContent.slice(0, index) + char + undiffedContent.slice(index);
  }

  return undiffedContent;
};
