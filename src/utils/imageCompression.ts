import {manipulateAsync, SaveFormat} from 'expo-image-manipulator';

export const compressImage = async (uri: string): Promise<string> => {
  try {
    const manipResult = await manipulateAsync(
      uri,
      [{resize: {width: 2000}}],
      {compress: 0.8, format: SaveFormat.JPEG},
    );
    return manipResult.uri;
  } catch (error) {
    console.error('Image compression error:', error);
    return uri;
  }
};
