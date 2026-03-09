import { getSearchableItemBank } from '../managers/searchable-item-bank.mjs';
import { addEventListener, isFunction, isInteger, noop } from '../utils/utils.mjs';
import { addMutator } from './utils.mjs';

const componentFuncs = {

}

const componentData = {
    id: 'searchable',
    key: '', // Unique identifier for item
    tags: [], // Category-like identifiers
    context: 'default', // The item "type". Could be "options" for options menu.
}

export function searchable(component, settings) {
    if (component.isSearchable) {
        return;
    }

    component.isSearchable = true;

    addMutator(component, componentData, componentFuncs, settings);

    const itemBank = getSearchableItemBank();

    itemBank.addItem(component);
}
