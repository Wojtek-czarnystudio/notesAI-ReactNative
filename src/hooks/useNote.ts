import {useQuery} from '@tanstack/react-query';
import {notesService} from '../services/notes';

export const useNote = (id: number) => {
  return useQuery({
    queryKey: ['note', id],
    queryFn: () => notesService.getNote(id),
    enabled: !!id,
  });
};
