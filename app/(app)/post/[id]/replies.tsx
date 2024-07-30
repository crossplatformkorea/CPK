import {useState, useEffect, Ref} from 'react';
import {css} from '@emotion/native';
import {KeyboardAvoidingView, Platform, View} from 'react-native';
import {HEADER_HEIGHT, PAGE_SIZE} from '../../../../src/utils/constants';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {FlashList} from '@shopify/flash-list';
import {Typography, useDooboo} from 'dooboo-ui';
import {t} from '../../../../src/STRINGS';
import ReplyItem from '../../../../src/components/uis/ReplyItem';
import ReplyInput from '../../../../src/components/uis/ReplyInput';
import {ImagePickerAsset} from 'expo-image-picker';
import {supabase} from '../../../../src/supabase';
import {
  fetchCreateReply,
  fetchReplyById,
  fetchReplyPagination,
} from '../../../../src/apis/replyQueries';
import {useRecoilValue} from 'recoil';
import {authRecoilState} from '../../../../src/recoil/atoms';
import useSWR from 'swr';
import {ReplyWithJoins} from '../../../../src/types';
import FallbackComponent from '../../../../src/components/uis/ErrorFallback';
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
  const [page, setPage] = useState(0);
  const [replies, setReplies] = useState<ReplyWithJoins[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);

  const {error, isValidating, mutate} = useSWR<ReplyWithJoins[]>(
    ['replies', postId, page],
    () =>
      fetchReplyPagination({page, pageSize: PAGE_SIZE, postId: postId || ''}),
    {
      revalidateOnFocus: false,
      onSuccess: (data) => {
        if (page === 0) {
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

    try {
      const newReply = await fetchCreateReply({
        reply: {
          message: reply,
          user_id: authId,
          post_id: postId,
        },
        images: assets.map((asset) => ({
          url: asset.uri,
        })),
      });

      mutate(newReply ? [newReply, ...replies] : replies, false);
    } catch (error) {
      if (__DEV__) console.error('Failed to create reply:', error);
    } finally {
      setReply('');
      setAssets([]);
    }
  };

  const loadMoreReplies = () => {
    if (loadingMore) return;
    setLoadingMore(true);
    setPage((prevPage) => prevPage + 1);
  };

  const handleRefresh = () => {
    setReplies([]);
    setPage(1);
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
    if (page === 1 && replies.length === 0) {
      mutate();
    }
  }, [mutate, page, replies.length]);

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
