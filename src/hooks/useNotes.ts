import {useInfiniteQuery} from '@tanstack/react-query';
import {notesService} from '../services/notes';

export const useNotes = (category?: string) => {
  return useInfiniteQuery({
    queryKey: ['notes', category],
    queryFn: async ({pageParam = 1}) => {
      const data = await notesService.getNotes(pageParam, category);
      return data;
    },
    getNextPageParam: lastPage => lastPage.next_page,
    initialPageParam: 1,
    refetchInterval: 30000,
  });
};
