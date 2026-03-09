import { selectableGrid } from "../../component-mutators/selectable-grid.mjs";
import { simulatedScrollable } from "../../component-mutators/simulatedScrollable.mjs";
import { getOuterBounds, isHidden, isVisible } from "../../utils/element.mjs";
import { clearElement } from "../../utils/utils.mjs";
import { Component } from "../component.mjs";

const defaults = {
}

export class GridScroll extends Component {
    constructor(settings) {
        settings = { ...defaults, ...settings };

        super(settings);

        this.items = [];
        this.itemWidth = 100;
        this.itemHeight = 100;
        this.cachedItemsPerRow = 0;
    }

    initialize() {
        this.classList.add('mode-container');
        this.classList.add('grid-scroll');

        const itemList = document.createElement('c-component');
        itemList.classList.add('active-items');
        this.append(itemList);

        selectableGrid(itemList, {
            autoScroll: true,
            boundingContainer: this,
        });

        itemList.getItems = () => {
            return this.items;
        }

        itemList.onChildHovered = (child) => {
            if (isVisible(child)) {
                return;
            }

            const firstIndex = this.getCorrespondingRow(itemList.firstChild);
            const lastIndex = this.getCorrespondingRow(itemList.lastChild);
            const childIndex = this.getCorrespondingRow(child);

            if (childIndex < firstIndex) {
                itemList.scrollToSmooth(0, this.itemHeight * childIndex);
            }
            else if (childIndex > lastIndex) {
                itemList.scrollToSmooth(0, this.itemHeight * (childIndex - 4));
            }

            console.log(childIndex);
        }

        simulatedScrollable(itemList);

        itemList.onScroll = (x, y) => {
            this.handleItemScrolling(x, y);
        };

        if (this.pendingItemUpdate) {
            const { scrollY } = this.simulatedScrollable;
            this.handleItemScrolling(0, scrollY);
        }
    }

    getCorrespondingRow(child) {
        let index = this.items.indexOf(child);
        if (index < 0) {
            return -1;
        }

        index /= this.cachedItemsPerRow;
        index = Math.floor(index);

        return index;
    }

    handleItemScrolling(x, y) {
        if (this.items.length <= 0) {
            return;
        }

        this.refreshItemDimensions();

        const container = this.getItemContainer();

        const itemsPerRow = this.cachedItemsPerRow;
        const itemsPerPage = this.cachedItemsPerPage;
        const expectedRowIndex = Math.floor(y / this.itemHeight);

        if (expectedRowIndex != this.currentRowIndex) {
            this.currentRowIndex = expectedRowIndex;
            let startIndex = expectedRowIndex * itemsPerRow;
            clearElement(container);

            const items = this.items.slice(startIndex, startIndex + itemsPerPage);
            container.append(items);
        }

        let newMargin = y % this.itemHeight;
        newMargin *= -1;
        container.style.setProperty('top', `${newMargin}px`);
    }

    refreshItemDimensions() {
        if (this.items.length <= 0) {
            return;
        }

        const container = this.getItemContainer();

        let child;
        let removeChild = false;
        if (container.children.length) {
            child = container.children[0];
        } else {
            child = this.items[0];
            removeChild = true;
            container.append(child);
        }

        const outerBounds = getOuterBounds(child);

        this.itemWidth = outerBounds.width;
        this.itemHeight = outerBounds.height;

        if (removeChild) {
            child.remove();
        }

        const itemsPerRow = Math.floor(container.clientWidth / this.itemWidth);
        this.cachedItemsPerRow = itemsPerRow;
        const itemsPerColumn = Math.floor(container.clientHeight / this.itemHeight);
        this.cachedItemsPerColumn = itemsPerColumn;
        const itemsPerPage = itemsPerRow * itemsPerColumn + itemsPerRow * 3;
        this.cachedItemsPerPage = itemsPerPage;

        const newMax = Math.floor(this.items.length / itemsPerRow) * this.itemHeight - container.clientHeight + this.itemHeight;

        container.setScrollYMinMax(0, newMax);
    }

    setItems(items) {
        this.items = items;

        if (!this.isInitialized) {
            this.pendingItemUpdate = true;
            return;
        }

        const container = this.getItemContainer();
        const { scrollY } = container.simulatedScrollable;
        this.handleItemScrolling(0, scrollY);
    }

    getItemContainer() {
        return this.getElementsByClassName('active-items')[0];
    }
}
customElements.define('c-grid-scroll', GridScroll);
