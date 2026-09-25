import { dbManager } from '../database/DatabaseManager';
import { Note, NoteRow, noteFromRow } from '../models/Note';
import { activityRepository } from './ActivityRepository';
import { getCurrentTimestamp } from '../utils/dateUtils';
import { generateId } from '../utils/idGenerator';

export class NoteRepository {
  async getAll(): Promise<Note[]> {
    const db = await dbManager.getDatabase();
    const rows = await db.getAllAsync<NoteRow>(
      'SELECT * FROM notes ORDER BY created_at DESC;'
    );
    return rows.map(noteFromRow);
  }

  async getByCourseId(courseId: string): Promise<Note[]> {
    const db = await dbManager.getDatabase();
    const rows = await db.getAllAsync<NoteRow>(
      'SELECT * FROM notes WHERE course_id = ? ORDER BY created_at DESC;',
      [courseId]
    );
    return rows.map(noteFromRow);
  }

  async getByModuleId(moduleId: string): Promise<Note[]> {
    const db = await dbManager.getDatabase();
    const rows = await db.getAllAsync<NoteRow>(
      'SELECT * FROM notes WHERE module_id = ? ORDER BY created_at DESC;',
      [moduleId]
    );
    return rows.map(noteFromRow);
  }

  async getModuleNote(courseId: string, moduleId: string): Promise<Note | null> {
    const db = await dbManager.getDatabase();
    const row = await db.getFirstAsync<NoteRow>(
      'SELECT * FROM notes WHERE course_id = ? AND module_id = ? ORDER BY updated_at DESC LIMIT 1;',
      [courseId, moduleId]
    );
    return row ? noteFromRow(row) : null;
  }

  async saveModuleNote(courseId: string, moduleId: string, text: string): Promise<Note> {
    const existing = await this.getModuleNote(courseId, moduleId);
    if (existing) {
      await this.update(existing.id, text);
      activityRepository.recordActivity({
        courseId,
        moduleId,
        activityType: 'NOTE_UPDATED',
      }).catch(() => {});
      const updated = await this.getById(existing.id);
      return updated!;
    } else {
      const created = await this.create({
        id: generateId('note'),
        course_id: courseId,
        module_id: moduleId,
        note_text: text,
      });
      activityRepository.recordActivity({
        courseId,
        moduleId,
        activityType: 'NOTE_CREATED',
      }).catch(() => {});
      return created;
    }
  }

  async getById(id: string): Promise<Note | null> {
    const db = await dbManager.getDatabase();
    const row = await db.getFirstAsync<NoteRow>(
      'SELECT * FROM notes WHERE id = ?;',
      [id]
    );
    return row ? noteFromRow(row) : null;
  }

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

  async delete(id: string): Promise<void> {
    const db = await dbManager.getDatabase();
    await db.runAsync('DELETE FROM notes WHERE id = ?;', [id]);
  }
}

export const noteRepository = new NoteRepository();
