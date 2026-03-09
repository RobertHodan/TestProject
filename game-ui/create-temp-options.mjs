import "../primer/components/component.mjs";
import { Component } from "../primer/components/component.mjs";
import { Slider } from "../primer/components/slider.mjs";
import { splitString } from "../primer/utils/string.mjs";
import { clearElement, isString } from "../primer/utils/utils.mjs";

export const OPTIONTYPE = {
    'SLIDER': 'slider',

}
const validOptions = [];
for (const option of Object.keys(OPTIONTYPE)) {
    validOptions.push(OPTIONTYPE[option]);
}

const container = document.createElement('c-component');
container.classList.add('temp-options');

const componentPool = {

};

/**
 * Creates a temporary options list - only one can exist at any time. Previous options 
 *  list becomes obsolete the moment a new options list is created, with previous 
 *  components being recycled back into new lists.
 * 
 * options = {
 *  [OptionName:String]: [OPTIONTYPE],
 *  [OptionName:String]: [OPTIONTYPE:x..y@z] // min, max, step
 * } 
 */
export function createTempOptions(options) {
    const keys = Object.keys(options);

    clearContainer();

    for (const key of keys) {
        const option = options[key];
        const [optionType, min, max, step] = splitString([':', '..', '@'], option);

        const component = getOrCreateComponent(optionType, min, max, step);

        container.append(component);
    }
};

function getOrCreateComponent(optionType, min, max, step) {
    let component;

    // Try to recycle prior component
    let comps = componentPool[optionType] || [];

    if (comps.length > 0) {
        component = comps[0];
        comps.splice(0, 1);

        return component;
    }

    // Create new component
    if (optionType == OPTIONTYPE.SLIDER) {
        comp = makeSlider(min, max, step);
    }

    return comp;
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

function makeSlider(min, max, step) {
    const slider = document.createElement('c-slider');

}
