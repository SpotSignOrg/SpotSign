// From https://stackoverflow.com/questions/47022193/make-a-utf-8-string-shorter-with-a-utf-32-encoding-in-javascript
export function toUtf32(string) {
  string = unescape(encodeURIComponent(string));
  var newString = '', char, nextChar, combinedCharCode;

  for (var i = 0; i < string.length; i += 2) {
    char = string.charCodeAt(i);

    if ((i + 1) < string.length) {
      // You need to make sure that you don't have 3 digits second character else you  might go over 65536.
      // But in UTF-16 the 32 characters aren't in your basic character set. But it's a limitation, anything
      // under charCode 32 will cause an error
      nextChar = string.charCodeAt(i + 1) - 31;

      // this is to pad the result, because you could have a code that is single digit, which would make
      // decompression a bit harder
      combinedCharCode = char + "" + nextChar.toLocaleString('en', {
        minimumIntegerDigits: 2
      });

      // You take the concanated code string and convert it back to a number, then a character
      newString += String.fromCharCode(parseInt(combinedCharCode, 10));
    } else {
      // Here because you won't always have pair number length
      newString += string.charAt(i);
    }
  }
  return newString;
}

export function fromUtf32(string) {
  var newString = '', char, codeStr, firstCharCode, lastCharCode;

  for (var i = 0; i < string.length; i++) {
    char = string.charCodeAt(i);
    if (char > 132) {
      codeStr = char.toString(10);

      // You take the first part of the compressed char code, it's your first letter
      firstCharCode = parseInt(codeStr.substring(0, codeStr.length - 2), 10);

      // For the second one you need to add 31 back.
      lastCharCode = parseInt(codeStr.substring(codeStr.length - 2, codeStr.length), 10) + 31;

      // You put back the 2 characters you had originally
      newString += String.fromCharCode(firstCharCode) + String.fromCharCode(lastCharCode);
    } else {
      newString += string.charAt(i);
    }
  }
  return newString;
}