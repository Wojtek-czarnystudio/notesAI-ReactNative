import {Note} from '../types/note';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppTabParamList = {
  NotesList: undefined;
  AddNote: undefined;
  Profile: undefined;
};

export type AppStackParamList = {
  Main: undefined;
  NoteDetail: {id: number};
  ProcessNote: {imageUri: string; source: string};
};

export type RootStackParamList = AuthStackParamList & AppStackParamList;
