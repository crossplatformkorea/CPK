import {useActionSheet} from '@expo/react-native-action-sheet';
import type {
  ImagePickerAsset,
  ImagePickerOptions,
  ImagePickerResult,
} from 'expo-image-picker';
import {
  launchCameraAsync,
  MediaTypeOptions,
  requestCameraPermissionsAsync,
} from 'expo-image-picker';
import {showAlert} from '../utils/alert';
import {launchMediaLibraryAsync} from '../utils/imagePicker';
import {t} from '../STRINGS';

type ImagePickerReturnType = {
  openImagePicker: (props: {
    onPickImage: (assets: ImagePickerAsset[]) => void;
    options?: ImagePickerOptions;
  }) => void;
};

export function useImagePickerActionSheet(): ImagePickerReturnType {
  const {showActionSheetWithOptions} = useActionSheet();

  const openImagePicker = ({
    options,
    onPickImage,
  }: Parameters<ImagePickerReturnType['openImagePicker']>[0]): void => {
    const menu = [
      t('common.takeAPhoto'),
      t('common.selectFromGallery'),
      t('common.cancel'),
    ];

    showActionSheetWithOptions(
      {
        options: menu,
        cancelButtonIndex: 2,
      },
      async (buttonIndex?: number) => {
        const handleImageUpload = (image: ImagePickerResult | null): void => {
          if (!image || image.canceled) {
            return;
          }

          return onPickImage?.(image.assets);
        };

        if (buttonIndex === 0) {
          const result = await requestCameraPermissionsAsync();

          if (result.granted) {
            const image = await launchCameraAsync({
              mediaTypes: MediaTypeOptions.Images,
              ...options,
            });

            handleImageUpload(image);

            return;
          }

          showAlert(t('common.permissionGrantCamera'));

          return;
        }

        if (buttonIndex === 1) {
          const image = await launchMediaLibraryAsync({
            mediaTypes: MediaTypeOptions.Images,
            ...options,
          });

          handleImageUpload(image);
        }
      },
    );
  };

  return {openImagePicker};
}
