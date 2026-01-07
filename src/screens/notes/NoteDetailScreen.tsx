import React from 'react';
import {View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {AppStackParamList} from '../../navigation/types';
import {useNote} from '../../hooks/useNote';
import {useDeleteNote} from '../../hooks/useDeleteNote';
import LoadingSpinner from '../../components/LoadingSpinner';
import CategoryBadge from '../../components/CategoryBadge';
import {colors} from '../../theme/colors';
import {typography} from '../../theme/typography';
import {spacing, borderRadius} from '../../theme/spacing';
import {formatDate} from '../../utils/formatters';

type NoteDetailScreenNavigationProp = NativeStackNavigationProp<
  AppStackParamList,
  'NoteDetail'
>;

type NoteDetailScreenRouteProp = RouteProp<AppStackParamList, 'NoteDetail'>;

interface Props {
  navigation: NoteDetailScreenNavigationProp;
  route: NoteDetailScreenRouteProp;
}

const NoteDetailScreen: React.FC<Props> = ({navigation, route}) => {
  const {id} = route.params;
  const {data: note, isLoading} = useNote(id);
  const deleteNoteMutation = useDeleteNote();

  const handleDelete = () => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteNoteMutation.mutateAsync(id);
            navigation.goBack();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete note');
          }
        },
      },
    ]);
  };

  if (isLoading || !note) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.summary}>{note.summary}</Text>
          <Text style={styles.date}>{formatDate(note.created_at)}</Text>
        </View>

        <View style={styles.categories}>
          {note.categories.map(category => (
            <CategoryBadge key={category.id} category={category} />
          ))}
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.label}>Full Text</Text>
          <Text style={styles.text}>{note.text}</Text>
        </View>

        <View style={styles.metaContainer}>
          <Text style={styles.metaLabel}>Source</Text>
          <Text style={styles.metaValue}>{note.source}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Delete Note</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.md,
  },
  summary: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  date: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.lg,
  },
  textContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  text: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  metaLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  metaValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    textTransform: 'capitalize',
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  deleteButton: {
    backgroundColor: colors.error,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
});

export default NoteDetailScreen;
