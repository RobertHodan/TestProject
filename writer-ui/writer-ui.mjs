import { linkCSS } from "../primer/utils/utils.mjs";
import { NavUI } from "../nav-ui/nav-ui.mjs";
import { InputManager } from "../primer/managers/input-manager.mjs";
import "./novel-select.mjs";
import { DataService } from "./data-service.mjs";
import { ChapterSidebar } from "./chapter-sidebar.mjs";
import { PageContent } from "./page-content.mjs";

linkCSS('./writer-ui/writer-ui.css')

const Database = require("better-sqlite3");
const writerDB = new Database("writer.db");
// CLEANUP
window.db = writerDB;

const dataService = new DataService();
dataService.setSQLite(writerDB);
// CLEANUP
window.dataService = dataService;

// Hot reload NWjs on save
const enabled = false;
if (enabled && process.env.NODE_ENV !== "production") {
    const fs = require("fs");
    const path = require("path");
    const win = nw.Window.get();

    const watchDir = path.resolve("../");

    fs.watch(watchDir, { recursive: true }, (event, filename) => {
        if (!filename) return;

        // Ignore noisy files
        if (
            filename.includes("node_modules") ||
            filename.endsWith(".map")
        ) return;

        console.log("Reloading due to change:", filename);
        win.reloadIgnoringCache();
    });
}

const keyboardBindings = {
    'up': ['w', 'arrowDown'],
    'down': ['s', 'arrowUp'],
    'left': 'a',
    'right': 'd',
    'enter': 'enter',
    'back': 'backspace',
    'nextcat': 'e',
    'prevcat': 'q',
    'nexttab': '3',
    'prevtab': '1',
    'scrollup': 'wheelup',
    'scrolldown': 'wheeldown',
    'zoomin': 'ctrl+wheelup',
    'zoomout': 'ctrl+wheeldown',
};

const globalSettings = {}

const navUI = new NavUI();
const inputManager = new InputManager();

inputManager.setBindings('keyboard', keyboardBindings);
inputManager.inputTypeRefresh();

inputManager.listenToActions((action, isRepeat, strength) => {
    navUI.performAction(action, strength);
});

// const novelSelect = document.createElement('c-novel-select');

// document.body.append(novelSelect);

const novelId = 1;
const chapterSidebar = document.createElement('c-chapter-sidebar');
chapterSidebar.selectedNovelId = novelId;

const pageContent = document.createElement('c-page-content');
pageContent.initialize(dataService);
pageContent.novelId = novelId;

chapterSidebar.onChapterSelected = (chapter) => {
    pageContent.setChapter(chapter.chapterId);
}
chapterSidebar.initialize(dataService);

document.body.append(chapterSidebar);
document.body.append(pageContent);
