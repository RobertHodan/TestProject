import "../primer/components/component.mjs";
import { clearElement, isString } from "../primer/utils/utils.mjs";

export const OPTIONTYPE = {
    'SLIDER': 'slider',

}
const validOptions = [];
for (const option of Object.keys(OPTIONTYPE)) {
    validOptions.push(OPTIONTYPE[option]);
}

const container = document.createElement('div');
container.classList.add('temp-options');

/**
 * Creates a temporary options list. Previous options list becomes obsolete
 *  the moment a new options list is created, with previous components being
 *  recycled back into new lists.
 * 
 * options = {
 *  [OptionName:String]: [OPTIONTYPE],
 *  [OptionName:String]: [OPTIONTYPE:x..y@z] // min, max, step
 * } 
 */
export function createTempOptions(options) {



};

const componentPool = {

};

function getOrCreateComponent(optionType) {
    let component;

    // Try to recycle prior component
    const comps = componentPool[optionType] || [];

    if (comps.length > 0) {
        component = comps[0];
        comps.splice(0, 1);

        return component;
    }

    // Create new component
    if (optionType == OPTIONTYPE.SLIDER) {

    }
}

function recycleToPool(child) {
    if (!child.optionType) {
        return;
    }

    const comps = componentPool[child.optionType] || [];
    comps.push(child);

    componentPool[child.optionType] = comps;
}

function clearContainer() {
    if (container.children.length) {
        for (const child of container.children) {
            if (isString(child.optionType)) {
                if (validOptions.includes(child.optionType)) {
                    recycleToPool(child);
                }
            }
        }
    }

    clearElement(container);
}

function makeSlider() {

}
