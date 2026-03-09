import { addEventListener, isFunction, isInteger, noop } from '../utils/utils.mjs';
import { addMutator } from './utils.mjs';

const requisites = {

}

const internals = {
    id: 'switchable',
}

export function switchable(component, settings) {
    if (component.isSwitchable) {
        return;
    }

    component.isSwitchable = true;

    addMutator(component, internals, requisites, settings);
}
