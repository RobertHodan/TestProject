import { addEventListener, isFunction, isInteger, noop } from '../utils/utils.mjs';
import { addMutator } from './utils.mjs';
import { isSelectable } from './selectable.mjs';
import { getDirectChild } from '../utils/element.mjs';

/**
 * @typedef {Object} SelectableGroup
 * @property {Function?} select
 * @property {Function?} selectNext
 * @property {Function?} selectPrev
 * @property {Function?} onSelect
 * @property {boolean?} wrapAround
 * @property {Function?} canSelect
 */

const requisites = {
    selectChild: function(child, skipCallback) {
        if (!this.canSelect()) {
            return false;
        }

        if (!child) {
            child = this.getHoveredChild() || 0;
        }

        if (isInteger(child)) {
            child = this.getChild(child, this.selectableGroup.wrapAround);
        }

        if (!skipCallback) {
            this.onSelect(child);

            if (child && isFunction(child.onSelect)) {
                child.onSelect();
            }
        }

        this._deselectPreviousChild();


        if (isSelectable(child)) {
            child.select();
        } else {
            child.classList.add('selected');
        }

        this._deselectPreviousChild = () => {
            if (isSelectable(child)) {
                child.deselect();
            } else {
                child.classList.remove('selected');
            }

            this._deselectPreviousChild = noop;
        }

        return true;
    },
    getSelectedChild: function() {
        let items = this.getChildren();
        let child;
        for (const item of items) {
            if (item.classList.contains('selected')) {
                child = item;
                break;
            }
        }

        if (!child) {
            child = items[0];
        }

        return child;
    },
    selectNextChild: function() {
        const selectedChild = this.getSelectedChild();
        const index = this.getChildIndex(selectedChild);
        const nextChild = this.getChild(index + 1, this.selectableGroup.wrapAround);
        this.selectChild(nextChild);
    },
    selectPrevChild: function() {
        const selectedChild = this.getSelectedChild();
        const index = this.getChildIndex(selectedChild);
        const nextChild = this.getChild(index - 1, this.selectableGroup.wrapAround);
        this.selectChild(nextChild);
    },
    hoverChild: function(child) {
        if (!this.canSelect()) {
            return false;
        }

        this._unhoverPreviousChild();

        if (!child) {
            return false;
        }

        child.classList.add('hover');

        this._unhoverPreviousChild = () => {
            child.classList.remove('hover');
        }

        return true;
    },
    hoverNextChild: function() {
        const index = this.getHoveredIndex();
        const hoverChild = this.getChild(index + 1, this.selectableGroup.wrapAround);
        this.hoverChild(hoverChild);
    },
    hoverPrevChild: function() {
        const index = this.getHoveredIndex();
        const hoverChild = this.getChild(index - 1, this.selectableGroup.wrapAround);
        this.hoverChild(hoverChild);
    },
    getHoveredChild: function() {
        let items = this.getChildren();
        let hoveredItem;
        for (const item of items) {
            if (item.classList.contains('hover')) {
                hoveredItem = item;
                break;
            }
        }

        return hoveredItem;
    },
    getHoveredIndex: function() {
        const hoveredChild = this.getHoveredChild();
        let index = this.getChildIndex(hoveredChild);
        if (index < 0) {
            index = this.getSelectedIndex();
        }

        if (index < 0) {
            index = 0;
        }

        return index;
    },
    getSelectedIndex: function() {
        const selectedChild = this.getSelectedChild();
        return this.getChildIndex(selectedChild);
    },
    onSelect: noop,
    _deselectPreviousChild: noop,
    _unhoverPreviousChild: noop,
    canSelect: function() { return this.children.length > 0 },
}

const internals = {
    id: 'selectableGroup',
    wrapAround: false,
    onHoverClassName: false,
}

/**
 *
 * @param {Component} component
 * @param {SelectableGroup} settings
 */
export function selectableGroup(component, settings) {
    if (component.isSelectableGroup) {
        return;
    }

    component.isSelectableGroup = true;

    addMutator(component, internals, requisites, settings);

    if (component.selectableGroup.onHoverClassName) {
        const el = component;
        const removers = [];
        el.addEventListener('mouseenter', () => {
            const items = component.children;
            for (const item of items) {
                const remover = addEventListener(item, 'mouseenter', () => {
                    component.hoverChild(item);
                });
                removers.push(remover);
            }
        });

        el.addEventListener('mouseleave', () => {
            for (const remover of removers) {
                remover();
            }
        });
    }

    component.addEventListener('click', (event) => {
        const item = getDirectChild(component, event.target);
        if (!item) {
            return;
        }
        component.selectChild(item);
    });
}
