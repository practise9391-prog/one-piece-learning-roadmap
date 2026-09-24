import { noteRepository } from '../repositories/NoteRepository';
import { Note } from '../models/Note';
import { generateId } from '../utils/idGenerator';

export class NotesService {
  async getAllNotes(): Promise<Note[]> {
    return await noteRepository.getAll();
  }

  async getNotesForCourse(courseId: string): Promise<Note[]> {
    return await noteRepository.getByCourseId(courseId);
  }

  async getNotesForModule(moduleId: string): Promise<Note[]> {
    return await noteRepository.getByModuleId(moduleId);
  }

  async addNote(params: {
    courseId: string;
    moduleId?: string | null;
    noteText: string;
  }): Promise<Note> {
    if (!params.noteText.trim()) {
      throw new Error('Note text cannot be empty');
    }

    const noteId = generateId('note');
    return await noteRepository.create({
      id: noteId,
      course_id: params.courseId,
      module_id: params.moduleId || null,
      note_text: params.noteText.trim(),
    });
  }

  async updateNote(id: string, noteText: string): Promise<void> {
    if (!noteText.trim()) {
      throw new Error('Note text cannot be empty');
    }
    await noteRepository.update(id, noteText.trim());
  }

  async deleteNote(id: string): Promise<void> {
    await noteRepository.delete(id);
  }
}

export const notesService = new NotesService();

