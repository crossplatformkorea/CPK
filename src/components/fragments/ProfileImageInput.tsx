import {memo} from 'react';
import {Pressable, type TextStyle, type ViewStyle} from 'react-native';
import styled, {css} from '@emotion/native';
import {useActionSheet} from '@expo/react-native-action-sheet';
import {IconButton, useDooboo} from 'dooboo-ui';
import type {ImageStyle} from 'expo-image';
import {Image} from 'expo-image';
import {
  type ImagePickerResult,
  MediaTypeOptions,
  requestCameraPermissionsAsync,
} from 'expo-image-picker';

import {t} from '../../../src/STRINGS';
import {showAlert} from '../../../src/utils/alert';
import {
  launchCameraAsync,
  launchMediaLibraryAsync,
} from '../../../src/utils/imagePicker';
import {IC_ICON} from '../../icons';

const Container = styled.View`
  flex: 1;
`;

function SingleUploadImageInput({
  imageUri,
  onChangeImageUri,
  onDeleteImageUri,
  label,
  style,
  styles,
}: {
  imageUri?: string | null;
  onChangeImageUri?: (uri: string) => void;
  onDeleteImageUri?: (uri: string) => void;
  label?: string;
  style?: ViewStyle;
  styles?: {
    container?: ViewStyle;
    text?: TextStyle;
    image?: ImageStyle;
  };
}): JSX.Element {
  const {theme} = useDooboo();
  const {showActionSheetWithOptions} = useActionSheet();

  const hasImage = !!imageUri;

  const handlePickImage = async (): Promise<void> => {
    const options = [
      t('common.takeAPhoto'),
      t('common.selectFromGallery'),
      t('common.cancel'),
    ];

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex: 2,
      },
      async (buttonIndex?: number) => {
        const handleImageUpload = async (
          image: ImagePickerResult | null,
        ): Promise<void> => {
          if (!image || image.canceled) {
            return;
          }

          onChangeImageUri?.(image.assets[0].uri);
        };

        if (buttonIndex === 0) {
          const result = await requestCameraPermissionsAsync();

          if (result.granted) {
            const image = await launchCameraAsync();
            handleImageUpload(image);

            return;
          }

          showAlert(t('common.permissionGrantCamera'));

          return;
        }

        if (buttonIndex === 1) {
          const image = await launchMediaLibraryAsync({
            mediaTypes: MediaTypeOptions.Images,
          });

          handleImageUpload(image);
        }
      },
    );
  };

  return (
    <Container style={style}>
      <Pressable
        style={css`
          flex: 1;
        `}
        onPress={handlePickImage}
      >
        <Image
          contentFit="cover"
          source={hasImage ? {uri: imageUri} : IC_ICON}
          style={[
            css`
              flex: 1;
              align-self: stretch;
              width: 96px;
              height: 96px;
              border-radius: 48px;
              background-color: ${theme.bg.paper};
              opacity: 0.9;
            `,
            styles?.image ? styles.image : {},
          ]}
        />
      </Pressable>

      {!hasImage ? (
        <IconButton
          icon="Image"
          onPress={handlePickImage}
          size="small"
          color="light"
          style={css`
            position: absolute;
            top: 0px;
            right: -12px;
          `}
        />
      ) : (
        <IconButton
          icon="Trash"
          onPress={() => onDeleteImageUri?.(imageUri)}
          size="small"
          color="light"
          style={css`
            position: absolute;
            top: 0px;
            right: -12px;
          `}
        />
      )}
    </Container>
  );
}

export default memo(SingleUploadImageInput);
