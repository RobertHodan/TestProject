import { GearsSvg, GemSvg, StaticObjectsSvg, TerrainConcaveSvg, TerrainConvexSvg, TerrainFlatSvg, TerrainSlopeSvg, TerrainSvg } from '../images/svgs.mjs';
import { navigable } from '../nav-ui/mutators/navigable.mjs';
import { NAVACTIONS } from '../nav-ui/nav-actions.mjs';
import { searchable } from '../primer/component-mutators/searchable.mjs';
import { selectableGroup } from '../primer/component-mutators/selectable-group.mjs';
import { getSearchableItemBank } from '../primer/managers/searchable-item-bank.mjs';
import { stringToSVG } from '../primer/utils/svg.mjs';
import { isNotString } from '../primer/utils/utils.mjs';
import { Component } from '/primer/components/component.mjs';
import '../primer/components/grid-scroll/grid-scroll.mjs';

const defaults = {
    // action: noop,
}

export class LevelEditor extends Component {
    constructor(settings) {
        settings = { ...defaults, ...settings };
        super(settings);
    }

    initialize() {
        this.classList.add('level-editor');

        this.keyNext = 1;
        this.context = 'level-editor';

        // Outer width / height
        this.lastKnownItemWidth = 0;
        this.lastKnownItemHeight = 0;
        this.lastKnownRowCount = 0;

        this.itemBank = getSearchableItemBank();
        this.createModeSelector();
        this.createItemContainer();

        this.createTerrainItems();
        this.createObjectItems();
        this.createCollectibleItems();
        this.createInteractableItems();

        setTimeout(() => {
            this.showItemsByTag('terrain');
        }, 0);
    }

    getItemContainer() {
        return this.getElementsByClassName('grid-scroll')[0];
    }

    createModeSelector() {
        const bar = document.createElement('c-component');
        bar.classList.add('mode-selector');

        selectableGroup(bar);
        navigable(bar, {
            bindings: {
                "selectNextChild": NAVACTIONS.NEXTCAT,
                "selectPrevChild": NAVACTIONS.PREVCAT
            }
        });

        // Terrain Button
        const terrainBtn = document.createElement('button');
        terrainBtn.classList.add('terrain-btn');
        terrainBtn.append(TerrainSvg);
        bar.append(terrainBtn);

        terrainBtn.onSelect = () => {
            this.showItemsByTag('terrain');
        };

        // Static Object Button
        const staticObjectBtn = document.createElement('button');
        staticObjectBtn.classList.add('static-object-btn');
        staticObjectBtn.append(StaticObjectsSvg);
        bar.append(staticObjectBtn);

        staticObjectBtn.onSelect = () => {
            this.showItemsByTag('object');
        };

        // Gem Button
        const gemBtn = document.createElement('button');
        gemBtn.classList.add('gem-btn');
        gemBtn.append(GemSvg);
        bar.append(gemBtn);

        gemBtn.onSelect = () => {
            this.showItemsByTag('collectible');
        };

        // Interactible Button
        const gearBtn = document.createElement('button');
        gearBtn.classList.add('gear-btn');
        gearBtn.append(GearsSvg);
        bar.append(gearBtn);

        gearBtn.onSelect = () => {
            this.showItemsByTag('interactable');
        };

        bar.selectChild(0);

        this.append(bar);
    }

    createItemContainer() {
        const container = document.createElement('c-grid-scroll');

        container.onInitialize = () => {
            const itemList = container.getItemContainer();

            navigable(itemList, {
                bindings: {
                    'hoverChildUp': NAVACTIONS.UP,
                    'hoverChildDown': NAVACTIONS.DOWN,
                    'hoverChildLeft': NAVACTIONS.LEFT,
                    'hoverChildRight': NAVACTIONS.RIGHT,
                    'scrollUp': NAVACTIONS.SCROLLUP,
                    'scrollDown': NAVACTIONS.SCROLLDOWN,
                }
            });
        }

        this.append(container);
    }

    createPageItem(key, svg, tags) {
        if (isNotString(key)) {
            tags = svg;
            svg = key;
            key = `level-editor-${this.keyNext++}`;
        }
        const btn = document.createElement('c-component');
        btn.classList.add('item');
        btn.append(svg);

        searchable(btn, {
            key,
            tags,
            context: this.context,
        });

        return btn;
    }

    showItemsByTag(tagName) {
        const items = this.itemBank.getItemsByTag(this.context, tagName);
        if (!items.length) {
            return;
        }

        const container = this.getItemContainer();
        container.setItems(items);
    }

    createTerrainItems() {
        const tags = ['terrain'];
        this.createPageItem('terrain-slope', TerrainSlopeSvg, tags);

        this.createPageItem('terrain-flat', TerrainFlatSvg, tags);

        this.createPageItem('terrain-concave', TerrainConcaveSvg, tags);

        this.createPageItem('terrain-convex', TerrainConvexSvg, tags);

        // for (let i = 0; i < 505; i++) {
        //     this.createPageItem(stringToSVG(`<svg>${i + 1} - Terrain</svg>`), tags);
        // }
    }

    createObjectItems() {
        const tags = ['object'];
        for (let i = 0; i < 505; i++) {
            this.createPageItem(stringToSVG(`<svg>${i + 1} - Object</svg>`), tags);
        }
    }

    createCollectibleItems() {
        const tags = ['collectible'];
        for (let i = 0; i < 505; i++) {
            this.createPageItem(stringToSVG(`<svg>${i + 1} - Collectible</svg>`), tags);
        }
    }

    createInteractableItems() {
        const tags = ['interactable'];
        for (let i = 0; i < 25; i++) {
            this.createPageItem(stringToSVG(`<svg>${i + 1} - Interactable</svg>`), tags);
        }
    }
}
customElements.define('c-level-editor', LevelEditor);
