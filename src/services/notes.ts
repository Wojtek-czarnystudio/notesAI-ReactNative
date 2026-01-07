import api from './api';
import {
  Note,
  NotesResponse,
  ProcessNoteResponse,
  JobStatusResponse,
} from '../types/note';

export const notesService = {
  async getNotes(page = 1, category?: string): Promise<NotesResponse> {
    const {data} = await api.get<NotesResponse>('/notes', {
      params: {page, category},
    });
    return data;
  },

  async getNote(id: number): Promise<Note> {
    const {data} = await api.get<Note>(`/notes/${id}`);
    return data;
  },

  async uploadImage(
    imageUri: string,
    source: string,
    onProgress?: (progress: number) => void,
  ): Promise<ProcessNoteResponse> {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'note.jpg',
    } as any);
    formData.append('source', source);

    const {data} = await api.post<ProcessNoteResponse>(
      '/notes/process',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: progressEvent => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            onProgress(percentCompleted);
          }
        },
      },
    );
    return data;
  },

  async getJobStatus(jobId: string): Promise<JobStatusResponse> {
    const {data} = await api.get<JobStatusResponse>(`/notes/status/${jobId}`);
    return data;
  },

  async deleteNote(id: number): Promise<void> {
    await api.delete(`/notes/${id}`);
  },

  async registerDeviceToken(token: string, platform: string): Promise<void> {
    await api.post('/device-token', {token, platform});
  },
};
