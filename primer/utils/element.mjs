import { arrayToString, mergeArrays } from "./array.mjs";
import { isArray, isString } from "./utils.mjs";


export function isHidden(element) {
  return element.clientHeight == 0 &&
    element.clientWidth == 0;
}

export function isVisible(element) {
  return !isHidden(element);
}

const objectToStringDefault = {
  // Incomplete for functions
  whiteSpace: 2,
  collapseObjects: false,
  collapseChildClasses: false,
  collapseFunctions: false,
}

export function objectToString(obj, settings, callCount = 1) {
  settings = { ...objectToStringDefault, ...settings };
  let result = '';

  if (obj.constructor && obj.constructor.name != 'Object' && obj.constructor.name != 'Array') {
    let name = obj.constructor.name;
    const nameArr = name.split(' ');
    name = nameArr[nameArr.length - 1];

    result += name + ' ';
  }

  result += `{`;

  let properties = getPropertyNames(obj);
  for (let property of properties) {
    if (property == 'constructor') {
      continue;
    }

    result += '\n';

    result += ' '.repeat(settings.whiteSpace * callCount);

    const value = obj[property];
    if (typeof (value) == 'object') {
      // Regular object
      if (Array.isArray(value)) {
        result += `${property}: `;
        result += arrayToString(value);
      } else if (value.constructor.name == 'Object') {
        result += `${property}: `;
        if (settings.collapseObjects) {
          result += '{}';
        } else {
          result += objectToString(value, settings, callCount + 1);
        }
      } else {
        // Collapsed Class Objects
        if (settings.collapseChildClasses) {
          result += `${property} {}`;
          // Class Objects
        } else {
          result += `${property}: `;
          result += objectToString(value, settings, callCount + 1);
        }
      }
      // Functions
    } else if (typeof (value) == 'function') {
      let funcStr = '';
      if (settings.collapseFunctions) {
        let bound = value.name.split('bound ');
        const name = bound.length > 1 ? bound[1] : temp1.name;
        funcStr = name + '() {}';
      } else {
        funcStr = value.toString();
        // Anonymous Function
        if (funcStr.trim().includes(') => ')) {
          result += `${property}: `;
        }
      }


      result += funcStr;
      // All Other Properties
    } else if (typeof (value) == 'string') {
      result += `${property}: `;
      result += `"${obj[property]}"`;
    } else {
      result += `${property}: `;
      result += obj[property];
    }
    result += ',';
  }

  if (properties.length > 0) {
    result += '\n';
  }

  result += ' '.repeat(settings.whiteSpace * (callCount - 1));
  result += '}';

  return result;
}

export function getPropertyNames(obj, ignoreNormalObjects, callCount = 1) {
  let properties = Object.getOwnPropertyNames(obj);
  const name = obj.constructor.name;

  if (ignoreNormalObjects) {
    if (name == 'Object' || name == 'Array') {
      return [];
    }
  }

  if (callCount <= 1) {
    if (!properties.includes('constructor')) {
      const proto = getPropertyNames(obj.constructor.prototype, callCount + 1);
      properties = mergeArrays(properties, proto);
    }
  }

  return properties;
}

export function hasFocus(element) {
  const focusedElement = document.activeElement;
  const hasChild = hasSpecifiedChild(element, focusedElement);

  return hasChild;
}

export function hasSpecifiedChild(element, child) {
  if (!child || !child.parentElement) {
    return false;
  }

  if (element == child) {
    return true;
  }

  return hasSpecifiedChild(element, child.parentElement);
}

export function applyClassName(element, className) {
  if (isString(className)) {
    element.classList.add(className);
  } else if (isArray(className)) {
    for (const name of className) {
      element.classList.add(name);
    }
  }
}

// Works up the tree from an element, and returns the item before the parent
export function getDirectChild(parent, childItem) {
  let isFound = false;
  while (childItem.parentElement) {
    if (childItem.parentElement == parent) {
      isFound = true;
      break;
    }

    childItem = childItem.parentElement;
  }

  if (isFound) {
    return childItem;
  }

  return;
}

export function getOuterBounds(element) {
  if (!element) {
    return 0;
  }
  const bounds = element.getBoundingClientRect();
  const computedStyle = window.getComputedStyle(element);
  const borderTop = parseFloat(computedStyle.borderTopWidth);
  const borderBottom = parseFloat(computedStyle.borderBottomWidth);
  const borderLeft = parseFloat(computedStyle.borderLeftWidth);
  const borderRight = parseFloat(computedStyle.borderRightWidth);
  const marginTop = parseFloat(computedStyle.marginTop);
  const marginBottom = parseFloat(computedStyle.marginBottom);
  const marginLeft = parseFloat(computedStyle.marginLeft);
  const marginRight = parseFloat(computedStyle.marginRight);

  const topOffset = borderTop + marginTop;
  const bottomOffset = borderBottom + marginBottom;
  const leftOffset = borderLeft + marginLeft;
  const rightOffset = borderRight + marginRight;

  const outerWidth = bounds.width + borderLeft + borderRight + marginLeft + marginRight;

  return {
    height: bounds.height + topOffset + bottomOffset,
    width: bounds.width + leftOffset + rightOffset,
    top: bounds.top + topOffset,
    bottom: bounds.bottom + bottomOffset,
    left: bounds.left + leftOffset,
    right: bounds.right + rightOffset,
    x: bounds.x + leftOffset,
    y: bounds.y + topOffset,
  };
}

export function getOuterHeight(element) {
  if (!element) {
    return 0;
  }
  const computedStyle = window.getComputedStyle(element);
  const borderHeightTop = parseFloat(computedStyle.borderTopWidth);
  const borderHeightBottom = parseFloat(computedStyle.borderBottomWidth);
  const marginTop = parseFloat(computedStyle.marginTop);
  const marginBottom = parseFloat(computedStyle.marginBottom);
  const bounds = element.getBoundingClientRect();

  return bounds.height + borderHeightTop + borderHeightBottom + marginTop + marginBottom;
}

export function getOuterWidth(element) {
  if (!element) {
    return 0;
  }
  const computedStyle = window.getComputedStyle(element);
  const borderLeft = parseFloat(computedStyle.borderLeftWidth);
  const borderRight = parseFloat(computedStyle.borderRightWidth);
  const marginLeft = parseFloat(computedStyle.marginLeft);
  const marginRight = parseFloat(computedStyle.marginRight);
  const bounds = element.getBoundingClientRect();

  return bounds.width + borderLeft + borderRight + marginLeft + marginRight;
}
