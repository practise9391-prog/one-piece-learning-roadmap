import { dbManager } from '../database/DatabaseManager';
import { Note, NoteRow, noteFromRow } from '../models/Note';
import { getCurrentTimestamp } from '../utils/dateUtils';

export class NoteRepository {
  /**
   * Retrieves all notes across the application.
   */
  async getAll(): Promise<Note[]> {
    const db = await dbManager.getDatabase();
    const rows = await db.getAllAsync<NoteRow>(
      'SELECT * FROM notes ORDER BY created_at DESC;'
    );
    return rows.map(noteFromRow);
  }

  /**
   * Retrieves notes for a specific course.
   */
  async getByCourseId(courseId: string): Promise<Note[]> {
    const db = await dbManager.getDatabase();
    const rows = await db.getAllAsync<NoteRow>(
      'SELECT * FROM notes WHERE course_id = ? ORDER BY created_at DESC;',
      [courseId]
    );
    return rows.map(noteFromRow);
  }

  /**
   * Retrieves notes for a specific module.
   */
  async getByModuleId(moduleId: string): Promise<Note[]> {
    const db = await dbManager.getDatabase();
    const rows = await db.getAllAsync<NoteRow>(
      'SELECT * FROM notes WHERE module_id = ? ORDER BY created_at DESC;',
      [moduleId]
    );
    return rows.map(noteFromRow);
  }

  /**
   * Retrieves a note by ID.
   */
  async getById(id: string): Promise<Note | null> {
    const db = await dbManager.getDatabase();
    const row = await db.getFirstAsync<NoteRow>(
      'SELECT * FROM notes WHERE id = ?;',
      [id]
    );
    return row ? noteFromRow(row) : null;
  }

  /**
   * Inserts a new note into SQLite.
   */
  async create(note: {
    id: string;
    course_id: string;
    module_id?: string | null;
    note_text: string;
  }): Promise<Note> {
    const db = await dbManager.getDatabase();
    const now = getCurrentTimestamp();

    await db.runAsync(
      `INSERT INTO notes (
        id, course_id, module_id, note_text, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?);`,
      [
        note.id,
        note.course_id,
        note.module_id || null,
        note.note_text,
        now,
        now,
      ]
    );

    const created = await this.getById(note.id);
    if (!created) {
      throw new Error(`Failed to create note with id ${note.id}`);
    }
    return created;
  }

  /**
   * Updates note text in SQLite.
   */
  async update(id: string, note_text: string): Promise<void> {
    const db = await dbManager.getDatabase();
    const now = getCurrentTimestamp();
    await db.runAsync(
      `UPDATE notes
       SET note_text = ?, updated_at = ?
       WHERE id = ?;`,
      [note_text, now, id]
    );
  }

  /**
   * Deletes a note by ID.
   */
  async delete(id: string): Promise<void> {
    const db = await dbManager.getDatabase();
    await db.runAsync('DELETE FROM notes WHERE id = ?;', [id]);
  }
}

export const noteRepository = new NoteRepository();

