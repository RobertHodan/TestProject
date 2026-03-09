export function stringToTemplate(htmlStr) {
  const template = document.createElement('template');
  template.innerHTML = htmlStr;

  return template;
}

export function stringToElement(htmlStr) {
  return stringToTemplate(htmlStr).content;
}

/**
 *
 * @param {string} string
 * @param {*} colorMap
 * @param {*} recusiveData
 * @description recusiveData is for internal-use only.
 * Currently assumes a specific (and wonky) code structure, output of objectToString (element.mjs)
 */
export function prettifyCodeString(string, colorMap, recusiveData) {
  let result = '';
  let currentWord = '';
  let prevWord = '';
  let wordFinished = false;
  let type = '';
  let char = '';
  let startIndex = recusiveData && recusiveData.startIndex || 0;
  let endIndex = string.length - 1;
  for (let i = startIndex; i < string.length; i += 1) {
    char = string[i];
    if (char == ' ' && prevWord == ' ') {
      continue;
    }

    if (char == ' ' || char == '\n' || char == '.' || char == '(') {
      prevWord = currentWord;
      currentWord = '';
      currentWord += char;
      wordFinished = true;
      continue;
    }

    // Skip ahead to determine prevWord type
    if (char == ':') {
      const { value, endIndex, type } = prettifyCodeString(string, colorMap, {
        startIndex: i + 1,
        ...recusiveData,
      });

      result += _colorPrevWord(prevWord, colorMap[type]);
      result += value;
      i = endIndex;
    }

    // Must be a class type
    if (wordFinished && char == '{') {
      type = 'class';
      if (colorMap[type]) {
        result += _colorPrevWord(prevWord, colorMap['class']);
      } else {
        result += prevWord;
      }

      result += currentWord + char;
      wordFinished = false;
      currentWord = '';
      prevWord = '';
    } else if (wordFinished && ',') {

    }

    if (wordFinished && recusiveData) {
      endIndex = i;
      break;
    }
  }

  if (recusiveData) {
    return {
      value: result,
      endIndex,
      type,
    };
  }

  return result;
}

function _colorPrevWord(prevWord, color) {
  return `<span style="color: ${color}">${prevWord}</span>`;
}

// Replace '-' with spaces, and capitalize every word
export function prettifyLabel(str) {
  str = str.replace('-', ' ');

  let newStr = "";
  // Uppercase the first letter of every word
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (i === 0 || str[i - 1] === ' ') {
      newStr += char.toUpperCase();
      continue;
    }

    newStr += char;
  }

  return newStr;
}

export function isFirstLetter(index, str) {
  if (index === 0) {
    return true;
  }

  const prevChar = str[index - 1];
  if (prevChar === '-' || prevChar === ' ' || prevChar === '_') {
    return true;
  }

  return false;
}

export function toPascalCase(str) {
  let pascal = '';

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (isFirstLetter(i, str)) {
      pascal += char.toUpperCase();
    } else {
      pascal += char;
    }
  }

  return pascal;
}

export function isLetter(str) {
  if (!str || str.length > 1) {
    return false;
  }

  // https://stackoverflow.com/a/62032796
  const isLetter = RegExp(/^\p{L}/, 'u').test(str);

  return isLetter;
}

export function isNotLetter(str) {
  return !isLetter(str);
}

/** 
 *  
 * @param {Array} delimiters  
 * @param {String} target  
 * @returns  
 */
export function splitString(delimiters, target) {
  if (!target) {
    return [];
  }

  if (isString(delimiters)) {
    delimiters = [delimiters];
  }

  if (!delimiters || !delimiters.length) {
    return [];
  }

  const splitResult = [];
  let strChunk = "";
  for (let i = 0; i < target.length; i++) {
    let foundDelimiter = false;
    for (let d of delimiters) {
      if (d.length <= 0) {
        continue;
      }

      if (target.startsWith(d, i)) {
        if (strChunk.length) {
          splitResult.push(strChunk);
          strChunk = "";
        }
        i += d.length - 1;
        foundDelimiter = true;
        break;
      }
    }

    if (!foundDelimiter) {
      strChunk += target[i];
    }
  }

  if (strChunk.length) {
    splitResult.push(strChunk);
  }

  return splitResult;
} 
