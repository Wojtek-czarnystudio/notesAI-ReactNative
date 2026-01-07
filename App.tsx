import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import NotesListScreen from './src/screens/NotesListScreen';
import NoteDetailScreen from './src/screens/NoteDetailScreen';
import {Note} from './src/types';

export type RootStackParamList = {
  NotesList: undefined;
  NoteDetail: {note?: Note; isNew?: boolean};
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="NotesList"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#6200ee',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
        <Stack.Screen
          name="NotesList"
          component={NotesListScreen}
          options={{title: 'My Notes'}}
        />
        <Stack.Screen
          name="NoteDetail"
          component={NoteDetailScreen}
          options={({route}) => ({
            title: route.params?.isNew ? 'New Note' : 'Edit Note',
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
