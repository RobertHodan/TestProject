import { actionable, isActionable } from '../component-mutators/actionable.mjs';
import { noop } from '../utils/utils.mjs';
import { Component } from './component.mjs';

export class Button extends Component {
  constructor() {
    super();

    actionable(this);

    this.content = "";
  }

  initialize() {
    super.initialize();
  }
}

customElements.define('c-button', Button);
