import React, {useState} from 'react';
import {View, FlatList, StyleSheet, RefreshControl} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {CompositeNavigationProp} from '@react-navigation/native';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {AppStackParamList, AppTabParamList} from '../../navigation/types';
import {useNotes} from '../../hooks/useNotes';
import NoteCard from '../../components/NoteCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import {colors} from '../../theme/colors';
import {spacing} from '../../theme/spacing';

type NotesListScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<AppTabParamList, 'NotesList'>,
  NativeStackNavigationProp<AppStackParamList>
>;

interface Props {
  navigation: NotesListScreenNavigationProp;
}

const NotesListScreen: React.FC<Props> = ({navigation}) => {
  const [category, setCategory] = useState<string>();
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useNotes(category);

  const notes = data?.pages.flatMap(page => page.data) || [];

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleNotePress = (id: number) => {
    navigation.navigate('NoteDetail', {id});
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notes}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => (
          <NoteCard note={item} onPress={() => handleNotePress(item.id)} />
        )}
        contentContainerStyle={
          notes.length === 0 ? styles.emptyContainer : styles.listContainer
        }
        ListEmptyComponent={
          <EmptyState
            title="No notes yet"
            message="Tap the Add button to create your first note by taking a photo"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? <LoadingSpinner size="small" /> : null
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[colors.primary]}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  listContainer: {
    padding: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    padding: spacing.md,
  },
});

export default NotesListScreen;
