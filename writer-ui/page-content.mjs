import { stringToElement, stringToTemplate } from '../primer/utils/string.mjs';
import { clearElement } from '../primer/utils/utils.mjs';
import { Component } from '/primer/components/component.mjs';

export class PageContent extends Component {
  constructor(settings) {
    super(settings);

    this.dataService;
    this.novelId = 1;
    this.chapterId = 1;
    this.saveIntervalSeconds = 10;
  }

  /**
   * 
   * @param {DataService} dataService 
   * @returns 
   */
  initialize(dataService) {
    this.className = 'page-content';
    super.initialize();

    this.setAttribute('contenteditable', '');
    this.dataService = dataService;

    this.saveInterval = setInterval(() => {
      this.saveContent();
    }, this.saveIntervalSeconds * 1000);
  }

  saveContent() {
    this.dataService.setChapterContent(this.chapterId, this.innerHTML);
  }

  setChapter(chapterId) {
    this.chapterId = chapterId;
    const content = dataService.getChapterContent(chapterId, this.novelId);
    this.setContent(content);
  }

  setContent(content) {
    const template = stringToElement(content);

    clearElement(this);
    this.append(template);
  }
}
customElements.define('c-page-content', PageContent);
