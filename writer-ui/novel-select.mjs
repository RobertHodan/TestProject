import { Component } from '../primer/components/component.mjs';
import { selectable } from '../primer/component-mutators/selectable.mjs';
import { selectableGroup } from '../primer/component-mutators/selectable-group.mjs';
import { navigable } from '../nav-ui/mutators/navigable.mjs';
import { NAVACTIONS } from '../nav-ui/nav-actions.mjs';
import "../primer/components/switcher.mjs";
import "../primer/components/textfield.mjs";
import { actionable } from '../primer/component-mutators/actionable.mjs';

// Currently a test - very incomplete.
export class NovelSelect extends Component {
    constructor(settings) {
        super(settings);
    }

    initialize() {
        this.className = 'novel-select';
        super.initialize();

        selectableGroup(this, {
            wrapAround: this.settings.wrapAround,
        });

        const createBtn = this.makeCreateButton();
        this.append(createBtn);

        this.activeEdit;
    }

    makeNovelButton() {
        const btn = document.createElement('c-component');
        btn.className = 'novel-btn';
        btn.novelName = '';

        const label = document.createElement('c-component');
        label.className = 'label';
        label.onUpdate = () => {
            label.setContent(btn.novelName);
        }

        const textField = document.createElement('c-textfield');
        textField.className = 'editable-label';
        textField.name = "chaptertitle";
        textField.onUpdate = () => {
            textField.setValue(btn.novelName);
        }
        navigable(textField, {
            bindings: {
                action: NAVACTIONS.ENTER
            }
        });

        const switcher = document.createElement('c-switcher');
        switcher.items = [label, textField];
        btn.append(switcher);

        textField.onSubmit = () => {
            const newValue = textField.getValue();
            btn.novelName = newValue;
            switcher.selectChild(label);
            this.activeEdit = undefined;
        }

        btn.focusChild = () => {
            if (switcher.children[0] == textField) {
                textField.focus();
            }
        }

        return btn;
    }

    editNovelTitle(novelBtn) {
        if (!novelBtn) {
            return;
        }
        const switcher = novelBtn.getElementsByTagName('c-switcher')[0];
        switcher.selectChild(1);

        setTimeout(() => {
            novelBtn.focusChild();
        }, 0)
    }

    makeCreateButton() {
        const newBtn = document.createElement('c-component');
        newBtn.className = 'novel-btn create-btn';

        const label = document.createElement('span');
        label.className = 'label';
        label.append('Create New Novel');
        newBtn.append(label);

        actionable(newBtn, { enableMouseEvents: true });

        newBtn.setAction(() => {
            if (this.activeEdit) {
                return;
            }
            const novelBtn = this.makeNovelButton();
            this.prepend(novelBtn);

            this.activeEdit = novelBtn;

            setTimeout(() => {
                this.editNovelTitle(novelBtn);
            }, 0);
        });


        return newBtn;
    }
}
customElements.define('c-novel-select', NovelSelect);
