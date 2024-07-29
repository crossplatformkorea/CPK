import type {TextStyle, ViewStyle} from 'react-native';
import {Pressable, ScrollView, View} from 'react-native';
import styled, {css} from '@emotion/native';
import {useActionSheet} from '@expo/react-native-action-sheet';
import {Button, Icon, IconButton, Typography, useDooboo} from 'dooboo-ui';
import type {ImageStyle} from 'expo-image';
import {Image} from 'expo-image';
import type {ImagePickerAsset, ImagePickerResult} from 'expo-image-picker';
import {
  MediaTypeOptions,
  requestCameraPermissionsAsync,
} from 'expo-image-picker';
import {useRouter} from 'expo-router';
import {t} from '../../STRINGS';
import {MAX_IMAGES_UPLOAD_LENGTH} from '../../utils/constants';
import {
  launchCameraAsync,
  launchMediaLibraryAsync,
} from '../../utils/imagePicker';
import {showAlert} from '../../utils/alert';

const ImageContainer = styled.View<{uri?: string}>`
  background-color: ${({theme, uri}) => (uri ? 'black' : theme.bg.basic)};
  border: 0.3px solid ${({theme}) => theme.text.placeholder};
  border-radius: 4px;
  margin-right: 12px;
  width: 120px;
  height: 128px;

  justify-content: center;
  align-items: center;
`;

export default function MultiUploadImageInput({
  imageUris = [],
  setImageUris,
  maxLength,
  mode = 'edit',
  label,
  style,
  styles,
  hideLabel,
  hideAdd,
  loading,
  onAdd,
  onDelete,
}: {
  imageUris: string[];
  setImageUris?: (uris: string[]) => void;
  maxLength?: number;
  mode?: 'edit' | 'view';
  label?: string;
  loading?: boolean;
  style?: ViewStyle;
  styles?: {
    container?: ViewStyle;
    text?: TextStyle;
    image?: ImageStyle;
    deleteIcon?: ViewStyle;
    deleteIconContainer?: ViewStyle;
  };
  hideLabel?: boolean;
  hideAdd?: boolean;
  onAdd?: (assets: ImagePickerAsset[]) => void;
  onDelete?: (index: number) => void;
}): JSX.Element {
  const {theme} = useDooboo();
  const {showActionSheetWithOptions} = useActionSheet();
  const {push} = useRouter();

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

          onAdd?.(image.assets);
          setImageUris?.(
            [...imageUris, ...image.assets.map((el) => el.uri)].splice(
              0,
              MAX_IMAGES_UPLOAD_LENGTH,
            ),
          );
        };

        if (buttonIndex === 0) {
          const result = await requestCameraPermissionsAsync();

          if (result.granted) {
            const image = await launchCameraAsync({
              mediaTypes: MediaTypeOptions.Images,
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
            allowsEditing: false,
            allowsMultipleSelection: true,
          });

          handleImageUpload(image);
        }
      },
    );
  };

  const renderImage = ({
    uri,
    index,
  }: {
    uri: string;
    index: number;
  }): JSX.Element => {
    return (
      <Pressable
        disabled={loading}
        onPress={() => {
          push({
            pathname: '/picture',
            params: {
              imageUrl: encodeURIComponent(uri as string),
            },
          });
        }}
        style={css`
          flex-direction: row;
          align-self: stretch;
        `}
      >
        <Image
          contentFit="cover"
          source={{uri}}
          style={[
            {
              flex: 1,
              alignSelf: 'stretch',
              width: 120,
              height: 128,
              borderRadius: 4,
            },
            styles?.image ? styles.image : {},
          ]}
        />

        {mode === 'edit' ? (
          <IconButton
            icon="Trash"
            onPress={() => {
              if (loading) {
                return;
              }

              setImageUris?.(imageUris.filter((_, i) => i !== index));
              // 삭제하는걸 직접 핸들링할 경우 아래 사용
              onDelete?.(index);
            }}
            size="small"
            style={[
              css`
                position: absolute;
                width: 30px;
                height: 30px;
                right: 4px;
                top: 4px;
              `,
              styles?.deleteIcon,
            ]}
            styles={{
              container: css`
                width: 30px;
                height: 30px;
                padding: 6px;
              `,
            }}
          />
        ) : null}
      </Pressable>
    );
  };

  const renderAdd = (): JSX.Element => {
    return (
      <Button
        disabled={loading}
        onPress={handlePickImage}
        size="small"
        style={[
          css`
            border-radius: 4px;
            width: 120px;
            height: 128px;

            justify-content: center;
            align-items: center;
          `,
          styles?.image,
        ]}
        text={
          <View
            style={css`
              width: 32px;
              height: 32px;
              border-radius: 16px;
              background-color: ${theme.button.light.bg};

              justify-content: center;
              align-items: center;
            `}
          >
            <Icon name="Upload" size={16} />
          </View>
        }
        type="text"
      />
    );
  };

  return (
    <View
      style={[
        css`
          border-radius: 4px;
          gap: 12px;
        `,
        style,
      ]}
    >
      {!hideLabel ? (
        <Typography.Body2
          style={[
            css`
              color: ${imageUris.length > 0
                ? theme.text.basic
                : theme.text.disabled};
              font-family: Pretendard-Bold;
            `,
            styles?.text,
          ]}
        >
          {label || `${t('common.image')}`}{' '}
          <Typography.Body3
            style={css`
              color: ${theme.text.placeholder};
            `}
          >{`(${imageUris.length}/${
            maxLength || MAX_IMAGES_UPLOAD_LENGTH
          })`}</Typography.Body3>
        </Typography.Body2>
      ) : null}
      <ScrollView
        horizontal
        style={css`
          padding-bottom: 8px;
        `}
      >
        {imageUris.map((uri, index) => (
          <ImageContainer
            key={`${uri}-${index}`}
            style={styles?.container}
            uri={uri}
          >
            {renderImage({uri, index})}
          </ImageContainer>
        ))}
        {!hideAdd &&
        mode === 'edit' &&
        imageUris.length < (maxLength || MAX_IMAGES_UPLOAD_LENGTH) ? (
          <ImageContainer style={styles?.container}>
            {renderAdd()}
          </ImageContainer>
        ) : null}
      </ScrollView>
    </View>
  );
}
