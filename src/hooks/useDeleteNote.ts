import {useMutation, useQueryClient} from '@tanstack/react-query';
import {notesService} from '../services/notes';

export const useDeleteNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => notesService.deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['notes']});
    },
  });
};
