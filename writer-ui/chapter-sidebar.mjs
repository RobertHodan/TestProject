import { Component } from '/primer/components/component.mjs';
import { selectable } from '../primer/component-mutators/selectable.mjs';
import { selectableGroup } from '../primer/component-mutators/selectable-group.mjs';
import '../primer/components/text-button.mjs';
import { navigable } from '../nav-ui/mutators/navigable.mjs';
import { NAVACTIONS } from '../nav-ui/nav-actions.mjs';
import { draggable } from '../primer/component-mutators/draggable.mjs';
import { slotable } from '../primer/component-mutators/slotable.mjs';
import { hasFocus } from '../primer/utils/element.mjs';
import { DataService } from './data-service.mjs';
import { noop } from '../primer/utils/utils.mjs';

export class ChapterSidebar extends Component {
  constructor() {
    super();

    this.wrapAround = false;
    this.dataService;

    this.selectedNovelId = 1;
    this.onChapterSelected = noop;
  }

  /**
   * 
   * @param {DataService} dataService 
   * @returns 
   */
  initialize(dataService) {
    if (this.isInitialized) {
      return;
    }
    if (!dataService) {
      console.error('ChapterSidebar requires DataService');
    }
    this.dataService = dataService;
    this.className = 'sidebar';

    super.initialize();

    const chapterList = document.createElement('c-component');
    chapterList.className = 'chapter-list';
    this.append(chapterList);
    chapterList.initialize();

    selectableGroup(chapterList, {
      wrapAround: this.wrapAround,
    });
    slotable(chapterList);
    chapterList.onSlotComplete = () => {
      this.onChapterOrderChanged(chapterList.children);
    }

    const newBtn = this.createNewButton();
    this.append(newBtn);

    navigable(this, {
      bindings: {
        hoverNextChild: NAVACTIONS.DOWN,
        hoverPrevChild: NAVACTIONS.UP,
      }
    });

    this.setAttribute('tabindex', 0);

    const chapters = this.dataService.getChapters(this.selectedNovelId);
    for (const chapter of chapters) {
      const item = this.createItem(chapter);
      chapterList.append(item);
    }

    chapterList.onSelect = this.onChapterSelected;
    chapterList.selectChild(0);
  }

  getChapterList() {
    return this.getElementsByClassName('chapter-list')[0];
  }

  onChapterCreated() {

  }

  onChapterTitleChanged(chapterId) {

  }

  onChapterOrderChanged(children) {
    let chapterOrder = 0;
    for (const child of children) {
      chapterOrder++;

      this.dataService.setChapterOrder(child.chapterId, chapterOrder, this.selectedNovelId);
    }
  }

  canNavigate() {
    return hasFocus(this) && document.activeElement.tagName != 'INPUT';
  }

  setItems(items) {
    if (!this.isInitialized) {
      this.pendingItems = items;
      return;
    }

    for (const itemSettings of items) {
      const item = this.createItem(itemSettings);
      this.append(item);
    }
  }

  createNewButton() {
    const newBtn = document.createElement('c-button');
    newBtn.content = '+';
    newBtn.className = 'chapter-list-item new-btn';
    newBtn.initialize();
    newBtn.enableMouseEvents();

    newBtn.setAction(() => {
      const chapterBtn = this.createItem({ title: 'Untitled Chapter' });

      const chapterId = this.dataService.createChapter(chapterBtn.getTitle());
      chapterBtn.chapterId = chapterId;

      const chapterList = this.getChapterList();
      chapterList.append(chapterBtn);
      chapterBtn.initialize();

      this.onChapterCreated();

      setTimeout(() => {
        chapterBtn.setEditable(true);
      }, 0)
    });

    return newBtn;
  }

  createItem(settings) {
    const textBtn = document.createElement('c-text-button');
    textBtn.content = settings.title;
    textBtn.chapterId = settings.id;
    textBtn.initialize();
    textBtn.classList.add('chapter-list-item');

    textBtn.onEdit = (title) => {
      this.dataService.setChapterTitle(textBtn.chapterId, title);
    };

    const handle = document.createElement('div');
    handle.classList.add('drag-handle');
    draggable(textBtn, {
      handle: handle,
    });

    textBtn.prepend(handle);

    selectable(textBtn);
    navigable(textBtn, {
      bindings: {
        action: NAVACTIONS.ENTER,
      }
    });

    return textBtn;
  }
}

customElements.define('c-chapter-sidebar', ChapterSidebar);
