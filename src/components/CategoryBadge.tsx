import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Category} from '../types/note';
import {colors} from '../theme/colors';
import {typography} from '../theme/typography';
import {spacing, borderRadius} from '../theme/spacing';

interface CategoryBadgeProps {
  category: Category;
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({category}) => {
  const backgroundColor =
    colors.categories[category.slug as keyof typeof colors.categories] ||
    colors.primary;

  return (
    <View style={[styles.badge, {backgroundColor}]}>
      <Text style={styles.text}>{category.name}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    marginRight: spacing.xs,
  },
  text: {
    color: '#fff',
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
});

export default CategoryBadge;
