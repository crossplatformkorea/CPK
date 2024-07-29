import {Platform} from 'react-native';
import type {ImagePickerOptions, ImagePickerResult} from 'expo-image-picker';
import {
  launchCameraAsync as launchCameraAsyncExpo,
  launchImageLibraryAsync,
  MediaTypeOptions,
  requestCameraPermissionsAsync,
  requestMediaLibraryPermissionsAsync,
  VideoExportPreset,
} from 'expo-image-picker';

export const launchCameraAsync = async (
  options?: ImagePickerOptions,
): Promise<ImagePickerResult | null> => {
  const {granted} = await requestCameraPermissionsAsync();

  if (granted) {
    return launchCameraAsyncExpo({
      ...(Platform.OS !== 'web' && {
        quality: 1,
        aspect: [1, 1],
        mediaTypes: MediaTypeOptions.All,
        videoMaxDuration: 180,
        videoExportPreset: VideoExportPreset.MediumQuality,
      }),
      ...options,
    });
  }

  return null;
};

export const launchMediaLibraryAsync = async (
  options?: ImagePickerOptions,
): Promise<ImagePickerResult | null> => {
  const {granted} = await requestMediaLibraryPermissionsAsync();

  if (granted) {
    return launchImageLibraryAsync({
      ...{
        quality: 1,
        aspect: [1, 1],
        mediaTypes: MediaTypeOptions.All,
        videoMaxDuration: 180,
        videoExportPreset: VideoExportPreset.MediumQuality,
      },
      ...options,
    });
  }

  return null;
};
