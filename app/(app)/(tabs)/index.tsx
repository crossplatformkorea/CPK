import styled, {css} from '@emotion/native';
import {Fab, LoadingIndicator} from 'dooboo-ui';
import StatusBarBrightness from 'dooboo-ui/uis/StatusbarBrightness';
import {FlashList} from '@shopify/flash-list';
import {useRouter} from 'expo-router';
import {PostWithJoins} from '../../../src/types';
import PostListItem from '../../../src/components/uis/PostListItem';
import {useCallback, useEffect, useState} from 'react';
import {supabase} from '../../../src/supabase';
import {
  fetchPostById,
  fetchPostPagination,
} from '../../../src/apis/postQueries';
import useSWR from 'swr';
import FallbackComponent from '../../../src/components/uis/FallbackComponent';
import CustomLoadingIndicator from '../../../src/components/uis/CustomLoadingIndicator';
import {useRecoilValue} from 'recoil';
import {authRecoilState} from '../../../src/recoil/atoms';

const Container = styled.View`
  flex: 1;
  align-self: stretch;
  background-color: ${({theme}) => theme.bg.basic};
`;

export default function Posts(): JSX.Element {
  const {push} = useRouter();
  const {authId, blockedUserIds} = useRecoilValue(authRecoilState);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [allPosts, setAllPosts] = useState<PostWithJoins[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetcher = useCallback(
    (cursor: string | undefined) =>
      fetchPostPagination({cursor, blockedUserIds}),
    [blockedUserIds],
  );

  const {error, isValidating, mutate} = useSWR(
    ['posts', cursor],
    () => fetcher(cursor),
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      onSuccess: (data) => {
        if (!cursor) {
          setAllPosts(data);
        } else {
          setAllPosts((prevPosts) => [...prevPosts, ...data]);
        }
        setLoadingMore(false);
        if (data.length > 0) {
          setCursor(data[data.length - 1].created_at || undefined);
        }
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
          table: 'posts',
        },
        async (payload) => {
          const newPost = await fetchPostById(payload.new.id);
          if (newPost) {
            setAllPosts((prevPosts) => [newPost, ...prevPosts]);
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'posts',
        },
        async (payload) => {
          const updatedPost = await fetchPostById(payload.new.id);
          if (updatedPost) {
            if (updatedPost.deleted_at) {
              setAllPosts((currentPosts) =>
                currentPosts.filter((post) => post.id !== updatedPost.id),
              );
            } else {
              setAllPosts((currentPosts) =>
                currentPosts.map((post) =>
                  post.id === updatedPost.id ? updatedPost : post,
                ),
              );
            }
          }
        },
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const loadMore = () => {
    if (!loadingMore) {
      setLoadingMore(true);
      fetcher(cursor).then((newPosts) => {
        setAllPosts((prevPosts) => [...prevPosts, ...newPosts]);
        setLoadingMore(false);
      });
    }
  };

  const handleRefresh = () => {
    setCursor(undefined);
    mutate();
  };

  const content = (() => {
    switch (true) {
      case !!error:
        return <FallbackComponent />;
      case isValidating:
        return <CustomLoadingIndicator />;
      default:
        return (
          <FlashList
            data={allPosts}
            onRefresh={handleRefresh}
            refreshing={isValidating && cursor === null}
            renderItem={({item}) => (
              <PostListItem
                post={item}
                controlItemProps={{
                  hasLiked: item.likes?.some(
                    (like) => like.user_id === authId && like.liked,
                  ),
                  likeCnt: item.likes?.length || 0,
                  replyCnt: item.replies?.length || 0,
                }}
                onPress={() => {
                  push({
                    pathname: '/post/[id]',
                    params: {id: item.id},
                  });
                }}
              />
            )}
            estimatedItemSize={208}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loadingMore ? (
                <LoadingIndicator
                  style={css`
                    padding: 24px;
                  `}
                />
              ) : null
            }
          />
        );
    }
  })();

  return (
    <Container>
      <StatusBarBrightness />
      {content}
      <Fab
        animationDuration={300}
        fabIcon="Plus"
        onPressFab={() => {
          push('/post/write');
        }}
        style={css`
          bottom: 16px;
        `}
      />
    </Container>
  );
}
