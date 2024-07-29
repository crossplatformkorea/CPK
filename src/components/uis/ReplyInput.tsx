import {EditText, EditTextProps, Icon, useDooboo} from 'dooboo-ui';
import {useImagePickerActionSheet} from '../../hooks/useActionSheet';
import {ActivityIndicator, Platform, ViewStyle} from 'react-native';
import {ImagePickerAsset, MediaTypeOptions} from 'expo-image-picker';
import styled, { css } from '@emotion/native';
import CustomPressable from 'dooboo-ui/uis/CustomPressable';
import { delayPressIn, MAX_IMAGES_UPLOAD_LENGTH } from '../../utils/constants';
import MultiUploadImageInput from './MultiUploadImageInput';
import { t } from '../../STRINGS';

const Container = styled.View`
  padding: 24px 24px 0 24px;

  gap: 10px;
`;

const ReplyButtonsWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

type Props = {
  style?: ViewStyle;
  styles?: EditTextProps['styles'];
  loading?: boolean;
  message?: string;
  assets: ImagePickerAsset[];
  setAssets: (assets: ImagePickerAsset[]) => void;
  setMessage?: (msg: string) => void;
  createReply: () => void;
};

export default function ReplyInput({
  style,
  styles,
  loading,
  message,
  setMessage,
  createReply,
  assets = [],
  setAssets,
}: Props): JSX.Element {
  const {openImagePicker} = useImagePickerActionSheet();
  const {theme} = useDooboo();

  return (
    <Container style={style}>
      <EditText
        decoration="boxed"
        editable={!loading}
        endElement={
          <ReplyButtonsWrapper
            style={css`
              margin-left: 8px;
            `}
          >
            {loading ? (
              <ActivityIndicator
                color={theme.text.basic}
                style={css`
                  padding: 8px 6px;
                  margin-right: 2px;
                `}
              />
            ) : (
              <>
                {/* 사진선택 아이콘 */}
                <CustomPressable
                  disabled={loading}
                  onPress={() =>
                    openImagePicker({
                      onPickImage: (pickedAssets) => {
                        setAssets(
                          [...assets, ...pickedAssets].splice(
                            0,
                            MAX_IMAGES_UPLOAD_LENGTH,
                          ),
                        );
                      },
                      options: {
                        mediaTypes: MediaTypeOptions.Images,
                        allowsMultipleSelection: true,
                        allowsEditing: false,
                      },
                    })
                  }
                  style={css`
                    border-radius: 99px;
                    padding: 8px;
                    margin-right: -6px;
                  `}
                >
                  <Icon name="Images" size={22} />
                </CustomPressable>

                {/* 댓글 제출 아이콘 */}
                <CustomPressable
                  delayHoverIn={delayPressIn}
                  onPress={createReply}
                  style={css`
                    padding: 6px;
                    border-radius: 99px;
                  `}
                >
                  <Icon name="PaperPlaneRight" size={22} />
                </CustomPressable>
              </>
            )}
          </ReplyButtonsWrapper>
        }
        multiline
        onChangeText={setMessage}
        onSubmitEditing={createReply}
        placeholder={t('common.leaveComment')}
        styles={{
          container: [
            css`
              border-radius: 4px;
            `,
            styles?.container,
          ],
          input: [
            css`
              padding: ${Platform.OS === 'web'
                ? '14px 0 0'
                : Platform.OS === 'android'
                  ? '5.7px 0'
                  : '10px 0'};
            `,
            styles?.input,
          ],
        }}
        value={message}
      />
      {assets.length > 0 ? (
        <MultiUploadImageInput
          hideAdd
          hideLabel
          imageUris={assets.map((el) => el.uri)}
          loading={loading}
          onDelete={(index) => {
            if (!loading) {
              setAssets?.(assets.filter((_, i) => i !== index));
            }
          }}
          styles={{
            container: css`
              width: 88px;
              height: 88px;
              border-radius: 8px;
              opacity: ${loading ? '0.5' : '1'};
            `,
            // @ts-ignore
            image: css`
              width: 88px;
              height: 88px;
              border-radius: 8px;
            `,
          }}
        />
      ) : null}
    </Container>
  );
}
