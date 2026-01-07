import React, {useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {AppStackParamList, AppTabParamList} from './types';
import NotesListScreen from '../screens/notes/NotesListScreen';
import NoteDetailScreen from '../screens/notes/NoteDetailScreen';
import AddNoteScreen from '../screens/notes/AddNoteScreen';
import ProcessNoteScreen from '../screens/notes/ProcessNoteScreen';
import {colors} from '../theme/colors';
import {useNavigation} from '@react-navigation/native';

const Stack = createNativeStackNavigator<AppStackParamList>();
const Tab = createBottomTabNavigator<AppTabParamList>();

interface TabNavigatorProps {
  sharedData?: {imageUri: string; source: string};
}

function TabNavigator({sharedData}: TabNavigatorProps) {
  const navigation = useNavigation();

  useEffect(() => {
    if (sharedData) {
      navigation.navigate('ProcessNote' as never, sharedData as never);
    }
  }, [sharedData, navigation]);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Tab.Screen
        name="NotesList"
        component={NotesListScreen}
        options={{
          title: 'My Notes',
          tabBarLabel: 'Notes',
        }}
      />
      <Tab.Screen
        name="AddNote"
        component={AddNoteScreen}
        options={{
          title: 'Add Note',
          tabBarLabel: 'Add',
        }}
      />
    </Tab.Navigator>
  );
}

interface AppNavigatorProps {
  sharedData?: {imageUri: string; source: string};
}

const AppNavigator: React.FC<AppNavigatorProps> = ({sharedData}) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Main"
        options={{headerShown: false}}>
        {props => <TabNavigator {...props} sharedData={sharedData} />}
      </Stack.Screen>
      <Stack.Screen
        name="NoteDetail"
        component={NoteDetailScreen}
        options={{title: 'Note Details'}}
      />
      <Stack.Screen
        name="ProcessNote"
        component={ProcessNoteScreen}
        options={{title: 'Processing Note'}}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
