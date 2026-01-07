import {useMutation, useQueryClient} from '@tanstack/react-query';
import {notesService} from '../services/notes';
import {compressImage} from '../utils/imageCompression';

interface UploadNoteParams {
  imageUri: string;
  source: string;
  onProgress?: (progress: number) => void;
}

export const useUploadNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({imageUri, source, onProgress}: UploadNoteParams) => {
      const compressedUri = await compressImage(imageUri);
      return await notesService.uploadImage(compressedUri, source, onProgress);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['notes']});
    },
  });
};
