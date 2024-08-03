import {useState, useEffect, Ref} from 'react';
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
import {
  getPublicUrlFromPath,
  supabase,
  uploadFileToSupabase,
} from '../../../../src/supabase';
import {
  fetchCreateReply,
  fetchReplyById,
  fetchReplyPagination,
} from '../../../../src/apis/replyQueries';
import {useRecoilValue} from 'recoil';
import {authRecoilState} from '../../../../src/recoil/atoms';
import useSWR from 'swr';
import {ReplyWithJoins} from '../../../../src/types';
import FallbackComponent from '../../../../src/components/uis/FallbackComponent';
import {toggleLike} from '../../../../src/apis/likeQueries';

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
    () => fetchReplyPagination({cursor, postId: postId as string}),
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

  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'replies',
        },
        async (payload) => {
          const newReply = await fetchReplyById(payload.new.id);
          if (newReply) {
            mutate((replies) => [newReply, ...(replies || [])], false);
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'replies',
        },
        async (payload) => {
          const updatedReply = await fetchReplyById(payload.new.id);
          if (updatedReply) {
            if (updatedReply.deleted_at) {
              mutate(
                (replies) =>
                  (replies || []).filter(
                    (reply) => reply.id !== updatedReply.id,
                  ),
                false,
              );
              return;
            }
            mutate(
              (replies) =>
                (replies || []).map((reply) =>
                  reply.id === updatedReply.id ? updatedReply : reply,
                ),
              false,
            );
          }
        },
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [mutate]);

  const handleCreateReply = async () => {
    if (!authId || !postId) return;

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
        });
      });

      const images = await Promise.all(imageUploadPromises);

      const newReply = await fetchCreateReply({
        reply: {
          message: reply,
          user_id: authId,
          post_id: postId,
        },
        images: images
          .filter((el) => !!el)
          .map((el) => ({
            ...el,
            image_url: el?.image_url
              ? getPublicUrlFromPath(el.image_url)
              : undefined,
          })),
      });

      mutate(newReply ? [newReply, ...replies] : replies, false);
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
    if (!authId) return;

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
    });

    mutate();
  };

  const handleDeleteReply = async (replyId: string) => {
    const updatedReplies = replies.filter((reply) => reply.id !== replyId);
    setReplies(updatedReplies);

    await supabase
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
            estimatedItemSize={400}
            keyExtractor={(item) => item.id}
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
  );
}