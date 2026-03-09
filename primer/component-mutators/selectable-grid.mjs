import { getDirectChild } from '../utils/element.mjs';
import { addEventListener, isFunction, isInteger, noop } from '../utils/utils.mjs';
import { addMutator } from './utils.mjs';

const componentFuncs = {
    getRowCount: function () {
        let rowCount = 0;
        let leftMin = 0;
        for (const child of this.children) {
            const bounds = child.getBoundingClientRect();
            if (bounds.left >= leftMin) {
                rowCount++;
                leftMin = bounds.left;
            } else {
                break;
            }
        }

        return rowCount;
    },
    getChildLeft: function (childCurrent) {
        const children = this.getItems();
        const index = children.indexOf(childCurrent);
        const rowCount = this.getRowCount();
        if (index > 0) {
            const childNext = children[index - 1];

            const boundsCurrent = childCurrent.getBoundingClientRect();
            const boundsNext = childNext.getBoundingClientRect();

            if (boundsNext.left > boundsCurrent.left) {
                if (index + rowCount - 1 < children.length - 1) {
                    return children[index + rowCount - 1];
                } else {
                    return children[children.length - 1];
                }
            }

            return childNext;
        }
        if (index <= 0) {
            if (index + rowCount - 1 < children.length - 1) {
                return children[index + rowCount - 1]
            } else {
                return children[children.length - 1];
            }
        }
        return;
    },
    getChildRight: function (childCurrent) {
        const children = this.getItems();
        const index = children.indexOf(childCurrent);
        let rowCount = 0;
        let i = index;
        const boundsCurrent = childCurrent.getBoundingClientRect();
        while (i > 0) {
            i--;
            const childPrev = children[i];
            const boundsPrev = childPrev.getBoundingClientRect();

            if (boundsPrev.left < boundsCurrent.left) {
                rowCount++;
            } else {
                break;
            }
        }

        if (index < children.length - 1) {
            const childNext = children[index + 1];
            const boundsNext = childNext.getBoundingClientRect();

            if (boundsNext.right < boundsCurrent.right) {
                if (index - rowCount >= 0) {
                    return children[index - rowCount];
                } else {
                    return children[0];
                }
            }

            return childNext;
        }
        if (index >= children.length - 1) {
            if (index - rowCount >= 0) {
                return children[index - rowCount];
            } else {
                return children[0];
            }
        }
        return;
    },
    getChildUp: function (childCurrent) {
        const children = this.getItems();
        const rowCount = this.getRowCount();
        const index = children.indexOf(childCurrent);
        if (index - rowCount >= 0) {
            return children[index - rowCount];
        }
        return;
    },
    getChildDown: function (childCurrent) {
        const children = this.getItems();
        const rowCount = this.getRowCount();
        const index = children.indexOf(childCurrent);
        if (index + rowCount < children.length) {
            return children[index + rowCount];
        }
        return;
    },
    getItems: function () {
        return this.getChildren();
    },
    selectChildLeft: function () {
        const nextChild = this.getChildLeft(this.getSelectedChild());
        if (nextChild) {
            this.selectChild(nextChild);
        }
    },
    selectChildRight: function () {
        const nextChild = this.getChildRight(this.getSelectedChild());
        if (nextChild) {
            this.selectChild(nextChild);
        }
    },
    selectChildUp: function () {
        const nextChild = this.getChildUp(this.getSelectedChild());
        if (nextChild) {
            this.selectChild(nextChild);
        }
    },
    selectChildDown: function () {
        const nextChild = this.getChildDown(this.getSelectedChild());
        if (nextChild) {
            this.selectChild(nextChild);
        }
    },
    selectChild: function (child) {
        this._deselectPreviousChild();
        child.classList.add('selected');
        this.selectableGrid.itemSelected = child;

        this.hoverChild(child);

        this._deselectPreviousChild = () => {
            child.classList.remove('selected');
        };

        this._checkAndUpdateScroll(child);

        this.onChildSelected(child);
    },
    hoverChildUp: function () {
        const nextChild = this.getChildUp(this.getHoveredChild());
        if (nextChild) {
            this.hoverChild(nextChild);
        }
    },
    hoverChildDown: function () {
        const nextChild = this.getChildDown(this.getHoveredChild());
        if (nextChild) {
            this.hoverChild(nextChild);
        }
    },
    hoverChildLeft: function () {
        const nextChild = this.getChildLeft(this.getHoveredChild());
        if (nextChild) {
            this.hoverChild(nextChild);
        }
    },
    hoverChildRight: function () {
        const nextChild = this.getChildRight(this.getHoveredChild());
        if (nextChild) {
            this.hoverChild(nextChild);
        }
    },
    hoverChild: function (child) {
        this._unhoverPreviousChild();
        child.classList.add('hovered');
        this.selectableGrid.itemHovered = child;


        this._unhoverPreviousChild = () => {
            child.classList.remove('hovered');
        }

        this._checkAndUpdateScroll(child);

        this.onChildHovered(child);
    },
    getSelectedChild: function () {
        if (!this.children.length) {
            return;
        }
        if (!this.selectableGrid.itemSelected) {
            this.selectableGrid.itemSelected = this.children[0];
        }

        return this.selectableGrid.itemSelected;
    },
    getHoveredChild: function () {
        if (!this.children.length) {
            return;
        }
        if (!this.selectableGrid.itemHovered) {
            this.selectableGrid.itemHovered = this.children[0];
        }

        return this.selectableGrid.itemHovered;
    },
    _checkAndUpdateScroll: function (child) {
        if (!this.selectableGrid.autoScroll || (!this.isScrollable && !this.isSimulatedScrollable)) {
            return;
        }

        let boundingContainer = this;
        if (this.selectableGrid.boundingContainer) {
            boundingContainer = this.selectableGrid.boundingContainer;
        }

        const parentBounds = boundingContainer.getBoundingClientRect();
        const bounds = child.getBoundingClientRect();
        let x = 0;
        let y = 0;
        const bottom = (window.innerHeight + (parentBounds.bottom - window.innerHeight));
        const top = parentBounds.top;
        if (bounds.bottom > bottom) {
            const diff = bounds.bottom - bottom;
            y = diff;
        } else if (bounds.top < parentBounds.top) {
            y = bounds.top - top;
        }
        // y *= -1;

        this.scrollBySmooth(x, y);
    },
    onChildHovered: noop,
    onChildSelected: noop,
    _deselectPreviousChild: noop,
    _unhoverPreviousChild: noop,
}

const componentData = {
    id: 'selectableGrid',
    itemHovered: undefined,
    itemSelected: undefined,
    autoScroll: true,
    boundingContainer: undefined,
}

export function selectableGrid(component, settings) {
    if (component.isSelectableGrid) {
        return;
    }

    component.isSelectableGrid = true;

    addMutator(component, componentData, componentFuncs, settings);

    // Enforce required styles
    component.style.setProperty('display', 'flex');
    component.style.setProperty('flex-direction', 'row');
    component.style.setProperty('flex-wrap', 'wrap');

    // Mouse Events
    component.addEventListener('click', (event) => {
        const item = getDirectChild(component, event.target);
        if (!item) {
            return;
        }
        component.selectChild(item);
    });
}
