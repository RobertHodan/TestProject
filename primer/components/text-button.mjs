import { Component } from './component.mjs';
import './button.mjs';
import './textfield.mjs';
import { clearElement, noop } from '../utils/utils.mjs';
import { actionable } from '../component-mutators/actionable.mjs';

export class TextButton extends Component {
  constructor(settings) {
    super(settings);

    this.value = "";
    this.onEdit = noop;
  }

  initialize() {
    if (this.isInitialized) {
      return;
    }

    let content;
    if (this.content) {
      content = this.content;
      delete this.content;
    }

    super.initialize();
    this.classList.add('text-button');

    actionable(this);

    const contentContainer = document.createElement('span');
    contentContainer.className = 'title';
    contentContainer.append(content);
    this.append(contentContainer);

    const textField = document.createElement('c-textfield');
    textField.className = 'item-input';
    textField.name = "chapter-title-edit"
    textField.setValue(this.settings.textValue);
    textField.initialize();

    const editBtn = document.createElement('c-button');
    editBtn.enableMouseEvents();
    editBtn.className = 'edit-btn';
    editBtn.content = 'Edit';
    editBtn.initialize();

    editBtn.setAction(() => {
      this.setEditable(true);

      // "Focus" the TextField next frame, otherwise
      // the mouse event will immediately steal it back
      setTimeout(() => {
        textField.focus();
      }, 0);

      textField.addEventListener('blur', () => {
        this.setEditable(false);
      });
    });

    this.append(textField);
    this.append(editBtn);

    this.setEditable(false);
  }

  getTitle() {
    const title = this.getElementsByClassName('title')[0];

    return title.innerText;
  }

  isEditable() {
    const input = this.getItemInput();

    return !input.hasAttribute('disabled');
  }

  action() {
    if (this.isEditable()) {
      this.applyInputValue();
      this.setEditable(false);
    }
  }

  applyInputValue() {
    const input = this.getItemInput();
    const title = this.getElementsByClassName('title')[0];
    if (input.value == title) {
      return;
    }

    this.onEdit(input.value);

    clearElement(title);
    title.append(input.value);
  }

  setEditable(isEditable) {
    const input = this.getItemInput();
    if (isEditable == undefined) {
      isEditable = !this.isEditable();
    }

    if (isEditable) {
      input.removeAttribute('disabled');
      this.classList.add('editing');
    } else {
      input.setAttribute('disabled', '');
      this.classList.remove('editing');
    }
    input.focus();
  }

  getItemInput() {
    return this.getElementsByTagName('INPUT')[0];
  }
}
customElements.define('c-text-button', TextButton);
