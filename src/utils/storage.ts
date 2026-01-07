import AsyncStorage from '@react-native-async-storage/async-storage';
import {Note, NoteCreate, NoteUpdate} from '../types';

const NOTES_STORAGE_KEY = '@notes_storage';

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const loadNotes = async (): Promise<Note[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Error loading notes:', e);
    return [];
  }
};

export const saveNotes = async (notes: Note[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(notes);
    await AsyncStorage.setItem(NOTES_STORAGE_KEY, jsonValue);
  } catch (e) {
    console.error('Error saving notes:', e);
  }
};

export const createNote = async (noteData: NoteCreate): Promise<Note> => {
  const notes = await loadNotes();
  const newNote: Note = {
    id: generateId(),
    ...noteData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  notes.unshift(newNote);
  await saveNotes(notes);
  return newNote;
};

export const updateNote = async (
  id: string,
  noteData: NoteUpdate,
): Promise<Note | null> => {
  const notes = await loadNotes();
  const index = notes.findIndex(note => note.id === id);
  if (index === -1) {
    return null;
  }
  notes[index] = {
    ...notes[index],
    ...noteData,
    updatedAt: new Date().toISOString(),
  };
  await saveNotes(notes);
  return notes[index];
};

export const deleteNote = async (id: string): Promise<boolean> => {
  const notes = await loadNotes();
  const filteredNotes = notes.filter(note => note.id !== id);
  if (filteredNotes.length === notes.length) {
    return false;
  }
  await saveNotes(filteredNotes);
  return true;
};

export const searchNotes = async (query: string): Promise<Note[]> => {
  const notes = await loadNotes();
  const lowerQuery = query.toLowerCase();
  return notes.filter(
    note =>
      note.title.toLowerCase().includes(lowerQuery) ||
      note.content.toLowerCase().includes(lowerQuery) ||
      note.tags?.some(tag => tag.toLowerCase().includes(lowerQuery)),
  );
};
