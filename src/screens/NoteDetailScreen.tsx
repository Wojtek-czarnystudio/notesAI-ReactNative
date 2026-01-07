import React, {useState, useLayoutEffect} from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../../App';
import {createNote, updateNote} from '../utils/storage';
import {generateAISuggestions} from '../utils/aiHelper';

type NoteDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'NoteDetail'
>;

type NoteDetailScreenRouteProp = RouteProp<RootStackParamList, 'NoteDetail'>;

interface Props {
  navigation: NoteDetailScreenNavigationProp;
  route: NoteDetailScreenRouteProp;
}

const NoteDetailScreen: React.FC<Props> = ({navigation, route}) => {
  const {note, isNew} = route.params || {};
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [tags, setTags] = useState(note?.tags?.join(', ') || '');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>(
    note?.aiSuggestions || [],
  );
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, title, content, tags]);

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) {
      Alert.alert('Error', 'Please add a title or content');
      return;
    }

    const tagsArray = tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    try {
      if (isNew) {
        await createNote({
          title: title.trim() || 'Untitled',
          content: content.trim(),
          tags: tagsArray,
        });
      } else if (note) {
        await updateNote(note.id, {
          title: title.trim() || 'Untitled',
          content: content.trim(),
          tags: tagsArray,
        });
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save note');
    }
  };

  const handleGenerateSuggestions = async () => {
    if (!content.trim()) {
      Alert.alert('Info', 'Please add some content first');
      return;
    }

    setIsGeneratingSuggestions(true);
    try {
      const suggestions = await generateAISuggestions(content);
      setAiSuggestions(suggestions);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate AI suggestions');
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const applySuggestion = (suggestion: string) => {
    Alert.alert(
      'Apply Suggestion',
      `Apply this suggestion?\n\n"${suggestion}"`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Append',
          onPress: () => setContent(prev => `${prev}\n\n${suggestion}`),
        },
        {
          text: 'Replace',
          style: 'destructive',
          onPress: () => setContent(suggestion),
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.titleInput}
          placeholder="Note title"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor="#999"
        />
        <TextInput
          style={styles.contentInput}
          placeholder="Start typing your note..."
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
          placeholderTextColor="#999"
        />
        <TextInput
          style={styles.tagsInput}
          placeholder="Tags (comma separated)"
          value={tags}
          onChangeText={setTags}
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.aiSection}>
        <TouchableOpacity
          style={styles.aiButton}
          onPress={handleGenerateSuggestions}
          disabled={isGeneratingSuggestions}>
          <Text style={styles.aiButtonText}>
            {isGeneratingSuggestions
              ? 'Generating AI Suggestions...'
              : '✨ Get AI Suggestions'}
          </Text>
        </TouchableOpacity>

        {aiSuggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>AI Suggestions:</Text>
            {aiSuggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionItem}
                onPress={() => applySuggestion(suggestion)}>
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  inputContainer: {
    padding: 16,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    padding: 0,
  },
  contentInput: {
    fontSize: 16,
    minHeight: 200,
    color: '#333',
    lineHeight: 24,
    padding: 0,
  },
  tagsInput: {
    fontSize: 14,
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    color: '#333',
  },
  saveButton: {
    marginRight: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  aiSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  aiButton: {
    backgroundColor: '#6200ee',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  aiButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  suggestionsContainer: {
    marginTop: 16,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  suggestionItem: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#6200ee',
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});

export default NoteDetailScreen;
