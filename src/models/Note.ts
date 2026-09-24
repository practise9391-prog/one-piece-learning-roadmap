export interface Note {
  id: string;
  course_id: string;
  module_id?: string | null;
  note_text: string;
  created_at?: string;
  updated_at?: string;
}

export interface NoteRow {
  id: string;
  course_id: string;
  module_id: string | null;
  note_text: string;
  created_at: string;
  updated_at: string;
}

export function noteFromRow(row: NoteRow): Note {
  return {
    id: row.id,
    course_id: row.course_id,
    module_id: row.module_id,
    note_text: row.note_text,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

