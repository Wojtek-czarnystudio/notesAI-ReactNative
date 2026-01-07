export interface Category {
  id: number;
  name: string;
  slug: string;
  color: string;
}

export interface Note {
  id: number;
  text: string;
  summary: string;
  source: 'camera' | 'share' | 'gallery' | 'url';
  categories: Category[];
  created_at: string;
  updated_at: string;
}

export interface NotesResponse {
  data: Note[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  next_page?: number;
}

export interface ProcessNoteResponse {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  message?: string;
}

export interface JobStatusResponse {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  note?: Note;
  error?: string;
}
