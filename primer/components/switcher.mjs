import { clearElement, noop } from '../utils/utils.mjs';
import { Component } from './component.mjs';
import { selectableGroup } from '../component-mutators/selectable-group.mjs';

export class Switcher extends Component {
  constructor(settings) {
    super(settings);

    this.items = [];
    this.index = 0;
  }

  initialize() {
    super.initialize();

    selectableGroup(this);

    if (this.items.length > 0) {
      this.selectChild(this.index);
    }
  }

  onSelect(child) {
    if (child == this.children[0]) {
      return;
    }

    clearElement(this);

    this.append(child);
  }

  canSelect() {
    return this.items.length > 0;
  }
}
customElements.define('c-switcher', Switcher);
