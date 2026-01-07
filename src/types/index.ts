export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  aiSuggestions?: string[];
}

export interface NoteCreate {
  title: string;
  content: string;
  tags?: string[];
}

export interface NoteUpdate {
  title?: string;
  content?: string;
  tags?: string[];
}
