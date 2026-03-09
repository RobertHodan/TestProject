import { actionable } from '../component-mutators/actionable.mjs';
import { noop } from '../utils/utils.mjs';
import { Component } from './component.mjs';

export class TextField extends Component {
  constructor(settings) {
    super(settings);

    this.value = ""; // temporary until initialization
    this.name = "";
    this.onSubmit = noop;
  }

  initialize() {
    super.initialize();

    actionable(this);

    const input = document.createElement('input');
    input.name = this.name;
    input.type = 'text';
    if (this.value) {
      input.setAttribute('value', this.value);
    }

    this.append(input);
    delete this.value;
  }

  getInput() {
    return this.getElementsByTagName('input')[0];
  }

  action() {
    const input = this.getInput();
    if (input) {
      this.value = input.value
    }

    this.onSubmit();
  }

  getValue() {
    const input = this.getInput();
    if (input) {
      return input.value;
    } else {
      return this.value;
    }
  }

  focus() {
    const input = this.getInput();
    if (input) {
      input.focus();
    }
  }

  setValue(value) {
    const input = this.getInput();
    if (input) {
      input.value = value;
    } else {
      this.value = value;
    }
  }
}
customElements.define('c-textfield', TextField);
