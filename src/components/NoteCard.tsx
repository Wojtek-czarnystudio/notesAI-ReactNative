import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Note} from '../types/note';
import {colors} from '../theme/colors';
import {typography} from '../theme/typography';
import {spacing, borderRadius} from '../theme/spacing';
import {formatDate, truncateText} from '../utils/formatters';
import CategoryBadge from './CategoryBadge';

interface NoteCardProps {
  note: Note;
  onPress: () => void;
}

const NoteCard: React.FC<NoteCardProps> = ({note, onPress}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.summary} numberOfLines={2}>
        {note.summary}
      </Text>
      <Text style={styles.text} numberOfLines={3}>
        {truncateText(note.text, 150)}
      </Text>
      <View style={styles.footer}>
        <View style={styles.categories}>
          {note.categories.slice(0, 2).map(category => (
            <CategoryBadge key={category.id} category={category} />
          ))}
          {note.categories.length > 2 && (
            <Text style={styles.moreCategories}>
              +{note.categories.length - 2}
            </Text>
          )}
        </View>
        <Text style={styles.date}>{formatDate(note.created_at)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summary: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  text: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categories: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  moreCategories: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  date: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
});

export default NoteCard;
