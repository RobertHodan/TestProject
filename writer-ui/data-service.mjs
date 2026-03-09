import { isNotNumber } from "../primer/utils/utils.mjs";

export class DataService {
    constructor() {
        this.db;
    }

    setSQLite(db) {
        this.db = db;
    }

    createNovel(title) {
        if (!title) {
            console.error('Error: createNewNovel expects a title');
        }

        const insert = this.db.prepare(`INSERT INTO novels (title) VALUES (?)`);
        const { lastInsertRowid } = insert.run(title);

        return lastInsertRowid;
    }

    getChapterContent(chapterId, novelId) {
        const chapter = this.db.prepare(`
            SELECT ledger_id
            FROM chapter_ledgers
            WHERE chapter_id = ?
            LIMIT 1
        `).get(chapterId)

        if (!chapter) {
            return "";
        }

        const ledger = this.db.prepare(`
            SELECT content
            FROM ledgers
            WHERE id = ?
        `).get(chapter.ledger_id);

        return ledger.content || "";
    }

    setChapterContent(chapterId, chapterContent, novelId) {
        let ledgerId = this.db.prepare(`
            SELECT ledger_id
            FROM chapter_ledgers
            WHERE chapter_id = ?
            LIMIT 1
        `).get(chapterId);

        if (!ledgerId) {
            const date = new Date().toISOString();
            const insert = this.db.prepare(`
                INSERT INTO ledgers (content, date_created, date_modified)
                VALUES (?, ?, ?)
            `).run("", date, date);

            ledgerId = insert.lastInsertRowid;

            const update = this.db.prepare(`
                INSERT INTO chapter_ledgers (chapter_id, ledger_id)
                VALUES (?, ?)
            `).run(chapterId, ledgerId);
        } else {
            ledgerId = ledgerId.ledger_id;
        }

        const dateModified = new Date().toISOString();
        console.log(chapterContent, dateModified, ledgerId);
        this.db.prepare(`
            UPDATE ledgers
            SET content = ?,
                date_modified = ?
            WHERE id = ?
        `).run(chapterContent, dateModified, ledgerId);
    }

    getChapters(novelId) {
        const chapters = this.db.prepare(`
            SELECT c.id, c.title
            FROM novel_chapters nc
            JOIN chapters c ON nc.chapter_id = c.id
            WHERE nc.novel_id = ?
            ORDER BY nc.chapter_order
        `).all(novelId);

        return chapters;
    }

    createChapter(title = "", novelId) {
        const prevChapter = this.db.prepare(`
            SELECT chapter_order
            FROM novel_chapters
            WHERE novel_id = ?
            ORDER BY chapter_order DESC
            LIMIT 1
        `).get(1);

        let chapterOrder = 0;
        if (prevChapter) {
            chapterOrder = prevChapter.chapter_order;
        }
        chapterOrder++;

        const chapter = this.db.prepare(`INSERT INTO chapters (title) VALUES (?)`);
        const { lastInsertRowid } = chapter.run(title);

        const novel = this.db.prepare(`
            INSERT INTO novel_chapters (novel_id, chapter_id, chapter_order)
            VALUES (?, ?, ?)
        `).run(novelId, lastInsertRowid, chapterOrder);

        return lastInsertRowid;
    }

    setChapterOrder(chapterId, chapterOrder, novelId) {
        this.db.prepare(`
            UPDATE novel_chapters
            SET chapter_order = ?
            WHERE novel_id = ?
            AND chapter_id = ?
        `).run(chapterOrder, novelId, chapterId);
    }

    setChapterTitle(chapterId, title = "") {
        const editChapterTitle = this.db.prepare(`
           UPDATE chapters
           SET title = ?
           WHERE id = ? 
        `);

        editChapterTitle.run(title, chapterId);
    }

    deleteChapter(chapterId) {
        const deleteNovelEntry = this.db.prepare(`
            DELETE FROM novel_chapters
            WHERE chapter_id = ?
        `);
        deleteNovelEntry.run(chapterId);

        const deleteChapter = this.db.prepare(`
           DELETE FROM chapters
           WHERE id = ?
        `);
        deleteChapter.run(chapterId);
    }
}
