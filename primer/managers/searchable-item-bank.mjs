/**
 * @typedef {Object} SearchableItemSettings
 * @property {string | HTMLElement} content
 * @property {string} id;
 * @property {string[]?} searchableTags;
 * @property {string?} searchableCategory;
 * @property {string?} contextId;
 * @property {string?} tagName
 * @property {string?} className
 */

import { Component } from '../components/component.mjs';
import { clearElement, noop } from '../utils/utils.mjs';

const defaults = {
}

/**
 *
 * @returns {SearchableItemBank}
 */
export function getSearchableItemBank() {
  if (window.SearchableItemBank) {
    return window.SearchableItemBank;
  }

  return window.SearchableItemBank = new SearchableItemBank();
}

export class SearchableItemBank {
  constructor(settings) {
    settings = { ...defaults, ...settings };

    /**
     * 'default': {
     *    'item-id': SearchableItem,
     * }
     */
    this.contextMap = {};
  }

  /**
   *
   * @param {Component | Element} item
   * @param {*} settings
   */
  addItem(item, settings) {
    if (!settings && item.searchable) {
      settings = item.searchable;
    }
    const id = settings.key;
    const hasValidId = id && id.length && id.length > 0;
    if (!hasValidId) {
      return;
    }

    const contextId = settings.context || 'default';

    this.setItem(item, contextId);

    return item;
  }

  getItemsByContext(contextId = 'default') {
    return this.contextMap[contextId];
  }

  getItemsByTag(contextId, tag) {
    const map = this.contextMap[contextId];
    if (!map) {
      return [];
    }

    let matchingItems = [];
    let itemKeys = Object.keys(map);
    for (const key of itemKeys) {
      const item = map[key];

      if (!item.isSearchable) {
        continue;
      }

      if (item.searchable.tags.includes(tag)) {
        matchingItems.push(item);
      }
    }

    return matchingItems;
  }

  getItem(id, contextId = 'default') {
    const itemMap = this.contextMap[contextId];
    if (!itemMap) {
      return;
    }

    return itemMap[id];
  }

  setItem(item, contextId) {
    const search = item.searchable;
    let itemMap = this.contextMap[contextId];
    if (!itemMap) {
      itemMap = {};
      this.contextMap[contextId] = itemMap;
    }

    itemMap[search.key] = item;
  }
}
