import {css} from '@emotion/native';
import {KeyboardAvoidingView, Platform, View} from 'react-native';
import {HEADER_HEIGHT} from '../../src/utils/constants';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {FlashList} from '@shopify/flash-list';
import {Typography, useDooboo} from 'dooboo-ui';
import {Reply} from '../../src/types';
import {t} from '../../src/STRINGS';
import ReplyItem, {ReplyWithJoins} from '../../src/components/uis/ReplyItem';
import ReplyInput from '../../src/components/uis/ReplyInput';
import {Ref, useCallback, useEffect, useState} from 'react';
import {ImagePickerAsset} from 'expo-image-picker';

export default function Replies({
  flashListRef,
  header,
}: {
  flashListRef: Ref<FlashList<Reply>> | null;
  header: JSX.Element;
}): JSX.Element {
  const {bottom} = useSafeAreaInsets();
  const {theme} = useDooboo();
  const [replies, setReplies] = useState<Reply[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [reply, setReply] = useState('');

  const [assets, setAssets] = useState<ImagePickerAsset[]>([]);

  const handleCreateReply = useCallback((): void => {}, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ios: 'padding', default: undefined})}
      keyboardVerticalOffset={HEADER_HEIGHT + bottom + 24}
      style={css`
        flex: 1;
      `}
    >
      <FlashList
        ListEmptyComponent={
          <View
            style={css`
              padding: 40px;

              justify-content: center;
              align-items: center;
            `}
          >
            <Typography.Body3
              style={css`
                color: ${theme.text.disabled};
              `}
            >
              {t('common.noComment')}
            </Typography.Body3>
          </View>
        }
        ListHeaderComponent={header}
        data={replies}
        estimatedItemSize={400}
        keyExtractor={(item) => item.id}
        onEndReached={() => {
          // !isLoadingNext && loadNext?.(LIST_CNT);
        }}
        onRefresh={() => {
          // refetch?.({first: LIST_CNT}, {fetchPolicy: 'network-only'});
        }}
        // ref={flashListRef}
        refreshing={refreshing}
        renderItem={({item}) => (
          <ReplyItem
            item={item as ReplyWithJoins}
            onPressDelete={() => {}}
            onPressLike={() => {}}
          />
        )}
      />
      <ReplyInput
        assets={assets}
        createReply={handleCreateReply}
        // loading={isCreateReplyInFlight}
        message={reply}
        setAssets={setAssets}
        setMessage={setReply}
        style={css`
          padding: 0;
        `}
        styles={{
          container: css`
            border-radius: 0;
            border-width: 0px;
            border-top-width: 0.3px;
            padding-bottom: 2px;
          `,
        }}
      />
    </KeyboardAvoidingView>
  );
}
