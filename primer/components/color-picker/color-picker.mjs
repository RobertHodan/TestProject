import { NavButton } from "../../../nav-ui/components/nav-button.mjs";
import { navigable } from "../../../nav-ui/mutators/navigable.mjs";
import { Color, ColorHWB } from "../../color.mjs";
import { Button } from "../button.mjs";
import { Component } from "../component.mjs";
import { ColorSelectionBox } from "./color-selection-box.mjs";
import { ColorSlider, HueSlider, OpacitySlider } from "./color-slider.mjs";
import { NAVACTIONS } from '../../../nav-ui/nav-actions.mjs';
import { ActionBar } from "../../../nav-ui/components/action-bar.mjs";
import { isArray } from "../../utils/utils.mjs";
import { createDynamicIcon } from "../../../nav-ui/dynamic-icon.mjs";

const defaults = {
  className: 'color-picker',
}

export class ColorPicker extends Component {
  constructor(settings) {
    settings = { ...defaults, ...settings };
    super(settings);

    const horiz = document.createElement('div');
    horiz.classList.add('horiz');

    this.color = new ColorHWB('hwb(0deg 0% 0%)');
    this.colorSelectionBox = document.createElement('c-color-selection-box');
    this.colorSelectionBox.color = this.color;
    this.append(this.colorSelectionBox.getElement());


    //
    // Hue Slider
    //
    this.hueSlider = document.createElement('c-hue-slider');
    this.hueSlider.className = 'hue-slider';
    this.hueSlider.color = this.color;
    this.append(this.hueSlider);

    const hueButtons = document.createElement('div');
    hueButtons.classList.add('horiz-center');
    this.hueSlider.append(hueButtons);

    //
    // Hue Keybinds
    //
    navigable(this.hueSlider, {
      bindings: {
        stepUp: NAVACTIONS.NEXTCAT,
        stepDown: NAVACTIONS.PREVCAT,
      },
    });


    const hueBtnPrev = document.createElement('c-nav-button');
    hueBtnPrev.className = 'nav-btn prev';
    hueBtnPrev.navAction = NAVACTIONS.PREVCAT;
    hueBtnPrev.keyboardFocusable = false;
    hueBtnPrev.action = () => this.hueSlider.stepDown();
    hueButtons.append(hueBtnPrev);

    const hueBtnNext = document.createElement('c-nav-button');
    hueBtnNext.className = 'nav-btn next';
    hueBtnNext.navAction = NAVACTIONS.NEXTCAT;
    hueBtnNext.keyboardFocusable = false;
    hueBtnNext.action = () => this.hueSlider.stepUp();
    hueButtons.append(hueBtnNext);


    //
    // Opacity Slider
    //
    this.opacitySlider = document.createElement('c-opacity-slider');
    this.opacitySlider.className = 'opacity-slider';
    this.opacitySlider.color = this.color;
    this.append(this.opacitySlider.getElement());

    const opacityButtons = document.createElement('div');
    opacityButtons.classList.add('horiz-center');
    this.opacitySlider.append(opacityButtons);

    //
    // Opacity Keybinds
    //
    navigable(this.opacitySlider, {
      bindings: {
        stepUp: NAVACTIONS.NEXTTAB,
        stepDown: NAVACTIONS.PREVTAB,
      },
    });

    const opacityBtnPrev = document.createElement('c-nav-button');
    hueBtnPrev.className = 'nav-btn prev';
    hueBtnPrev.navAction = NAVACTIONS.PREVCAT;
    hueBtnPrev.keyboardFocusable = false;
    hueBtnPrev.action = () => this.opacitySlider.stepDown();
    opacityButtons.append(opacityBtnPrev);

    const opacityBtnNext = document.createElement('c-nav-button');
    hueBtnNext.className = 'nav-btn next';
    hueBtnNext.navAction = NAVACTIONS.NEXTCAT;
    hueBtnNext.keyboardFocusable = false;
    hueBtnNext.action = () => this.hueSlider.stepUp();
    opacityButtons.append(opacityBtnNext);

    //
    // Action Bar
    //

    const actionBar = document.createElement('c-action-bar');
    actionBar.keyboardFocusable = false;
    actionBar.createItemElement = (btnSettings) => this.createActionBarItem(btnSettings);
    actionBar.className = 'nav-btn';
    actionBar.items = [
      {
        label: '@lang:options.accept',
        navAction: NAVACTIONS.ENTER,
      },
      {
        alignRight: true,
        label: '@lang:options.cancel',
        navAction: NAVACTIONS.BACK,
        className: 'margin-left-auto'
      }
    ];
    this.append(actionBar);
  }

  createActionBarItem(btnSettings) {
    let length = 1;
    if (isArray(btnSettings.navAction)) {
      length = btnSettings.navAction.length;
    }

    let button;
    // TODO: Pass btnSettings into button
    if (length == 4) {
      button = document.createElement('c-button');
      const container = document.createElement('div');
      container.classList.add('directional-btns');

      this.createAndAppendDirectionalIcons(container, btnSettings.navAction);
      button.append(container);
    } else {
      button = document.createElement('c-nav-button');
      button.setIconSettings({
        className: 'btn',
      });
    }

    return button;
  }

  createAndAppendDirectionalIcons(container, navActions) {
    const top = createDynamicIcon(navActions[0]);
    container.append(top);

    const horizContainer = document.createElement('div');
    horizContainer.classList.add('horiz');

    const left = createDynamicIcon(navActions[3]);
    horizContainer.append(left);
    const right = createDynamicIcon(navActions[1]);
    horizContainer.append(right);

    container.append(horizContainer);

    const bottom = createDynamicIcon(navActions[2]);
    container.append(bottom);
  }
}
customElements.define('c-color-picker', ColorPicker);
