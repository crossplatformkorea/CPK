import {useState, useEffect, Ref, useCallback} from 'react';
import {css} from '@emotion/native';
import {KeyboardAvoidingView, Platform, View} from 'react-native';
import {HEADER_HEIGHT} from '../../../../src/utils/constants';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {FlashList} from '@shopify/flash-list';
import {Typography, useDooboo} from 'dooboo-ui';
import {t} from '../../../../src/STRINGS';
import ReplyItem from '../../../../src/components/uis/ReplyItem';
import ReplyInput from '../../../../src/components/uis/ReplyInput';
import {ImagePickerAsset} from 'expo-image-picker';
import {uploadFileToSupabase} from '../../../../src/supabase';
import {
  fetchCreateReply,
  fetchReplyPagination,
} from '../../../../src/apis/replyQueries';
import {useRecoilValue} from 'recoil';
import {authRecoilState} from '../../../../src/recoil/atoms';
import useSWR from 'swr';
import {Image, ReplyWithJoins} from '../../../../src/types';
import FallbackComponent from '../../../../src/components/uis/FallbackComponent';
import {toggleLike} from '../../../../src/apis/likeQueries';
import ErrorBoundary from 'react-native-error-boundary';
import useSupabase from '../../../../src/hooks/useSupabase';

export default function Replies({
  flashListRef,
  header,
  postId,
}: {
  flashListRef: Ref<FlashList<ReplyWithJoins>> | null;
  header: JSX.Element;
  postId?: string;
  replyId?: string;
}): JSX.Element {
  const {supabase} = useSupabase();
  const {bottom} = useSafeAreaInsets();
  const {theme} = useDooboo();
  const {authId} = useRecoilValue(authRecoilState);
  const [reply, setReply] = useState('');
  const [assets, setAssets] = useState<ImagePickerAsset[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [replies, setReplies] = useState<ReplyWithJoins[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isCreateReplyInFlight, setIsCreateReplyInFlight] = useState(false);

  const {error, isValidating, mutate} = useSWR<ReplyWithJoins[]>(
    ['replies', postId, cursor],
    () =>
      fetchReplyPagination({
        cursor,
        postId: postId as string,
        supabase: supabase!,
      }),
    {
      revalidateOnFocus: false,
      onSuccess: (data) => {
        if (cursor === new Date().toISOString()) {
          setReplies(data);
        } else {
          setReplies((prevReplies) => [...prevReplies, ...data]);
        }
        setLoadingMore(false);
      },
    },
  );

  const handleCreateReply = async () => {
    if (!authId || !postId || !supabase) return;

    setIsCreateReplyInFlight(true);

    try {
      const imageUploadPromises = assets.map(async (asset) => {
        const destPath = `${asset.type === 'video' ? 'videos' : 'images'}/${Date.now()}_${asset.fileName}`;
        const file = asset.uri;

        return await uploadFileToSupabase({
          uri: file,
          fileType: asset.type === 'video' ? 'Video' : 'Image',
          bucket: 'images',
          destPath,
          supabase,
        });
      });

      const images = (await Promise.all(imageUploadPromises))
        .filter((el) => !!el)
        .map((el) => ({
          ...el,
        }));

      const newReply = await fetchCreateReply({
        supabase,
        reply: {
          message: reply,
          user_id: authId,
          post_id: postId,
        },
        images,
      });

      if (newReply) {
        setReplies((prevReplies) => [
          {
            ...newReply,
            images: images as Image[],
          },
          ...prevReplies,
        ]);
      }
    } catch (error) {
      if (__DEV__) console.error('Failed to create reply:', error);
    } finally {
      setReply('');
      setAssets([]);
      setIsCreateReplyInFlight(false);
    }
  };

  const loadMoreReplies = () => {
    if (loadingMore) return;
    setLoadingMore(true);
    const lastReply = replies[replies.length - 1];
    if (lastReply) {
      setCursor(lastReply.created_at || undefined);
    }
  };

  const handleRefresh = () => {
    setReplies([]);
    setCursor(new Date().toISOString());
    mutate();
  };

  const handleToggleLike = async (replyId: string) => {
    if (!authId || !supabase) return;

    const updatedReplies = replies.map((reply) => {
      if (reply.id === replyId) {
        const userLike = reply.likes?.find((like) => like.user_id === authId);
        if (userLike) {
          return {
            ...reply,
            likes: reply.likes?.filter((like) => like.user_id !== authId),
          };
        }
        return {
          ...reply,
          likes: [
            ...(reply.likes || []),
            {user_id: authId, reply_id: replyId, liked: true},
          ],
        };
      }
      return reply;
    });

    setReplies(updatedReplies as ReplyWithJoins[]);

    await toggleLike({
      userId: authId,
      replyId,
      supabase,
    });

    mutate();
  };

  const handleDeleteReply = async (replyId: string) => {
    const updatedReplies = replies.filter((reply) => reply.id !== replyId);
    setReplies(updatedReplies);

    await supabase!
      .from('replies')
      .update({deleted_at: new Date().toISOString()})
      .eq('id', replyId);

    mutate();
  };

  useEffect(() => {
    if (cursor === new Date().toISOString() && replies.length === 0) {
      mutate();
    }
  }, [mutate, cursor, replies.length]);

  const keyExtractor = useCallback(
    (item: any, i: number) => `${i}-${item.id}`,
    [],
  );

  const content = (() => {
    switch (true) {
      case !!error:
        return <FallbackComponent />;
      default:
        return (
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
            estimatedItemSize={128}
            // https://github.com/Shopify/flash-list/issues/730#issuecomment-1741385659
            keyExtractor={keyExtractor}
            onEndReached={loadMoreReplies}
            onEndReachedThreshold={0.1}
            onRefresh={handleRefresh}
            refreshing={isValidating}
            renderItem={({item}) => (
              <ReplyItem
                item={item}
                onPressDelete={() => {
                  handleDeleteReply(item.id);
                }}
                onPressLike={() => handleToggleLike(item.id)}
              />
            )}
          />
        );
    }
  })();

  return (
    <ErrorBoundary FallbackComponent={FallbackComponent}>
      <KeyboardAvoidingView
        behavior={Platform.select({ios: 'padding', default: undefined})}
        keyboardVerticalOffset={HEADER_HEIGHT + bottom + 24}
        style={css`
          flex: 1;
        `}
      >
        {content}
        {authId ? (
          <ReplyInput
            assets={assets}
            createReply={handleCreateReply}
            message={reply}
            setAssets={setAssets}
            setMessage={setReply}
            style={css`
              padding: 0;
            `}
            loading={isCreateReplyInFlight}
            styles={{
              container: css`
                border-radius: 0;
                border-width: 0px;
                border-top-width: 0.3px;
                padding-bottom: 2px;
              `,
            }}
          />
        ) : null}
      </KeyboardAvoidingView>
    </ErrorBoundary>
  );
}
