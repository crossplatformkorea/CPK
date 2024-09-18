import styled, {css} from '@emotion/native';
import {Fab, LoadingIndicator} from 'dooboo-ui';
import {FlashList} from '@shopify/flash-list';
import {useRouter} from 'expo-router';
import {PostWithJoins} from '../../../src/types';
import PostListItem from '../../../src/components/uis/PostListItem';
import {useCallback, useState} from 'react';
import {fetchPostPagination} from '../../../src/apis/postQueries';
import useSWR from 'swr';
import FallbackComponent from '../../../src/components/uis/FallbackComponent';
import CustomLoadingIndicator from '../../../src/components/uis/CustomLoadingIndicator';
import {useRecoilState, useRecoilValue} from 'recoil';
import {
  addPostsIfNotExists,
  authRecoilState,
  postsRecoilState,
} from '../../../src/recoil/atoms';
import ListEmptyItem from '../../../src/components/uis/ListEmptyItem';
import ErrorBoundary from 'react-native-error-boundary';
import useSupabase from '../../../src/hooks/useSupabase';

const Container = styled.View`
  flex: 1;
  align-self: stretch;
  background-color: ${({theme}) => theme.bg.basic};
`;

export default function Posts(): JSX.Element {
  const {supabase} = useSupabase();
  const {push} = useRouter();
  const {authId, blockedUserIds} = useRecoilValue(authRecoilState);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [allPosts, setAllPosts] =
    useRecoilState<PostWithJoins[]>(postsRecoilState);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetcher = useCallback(
    (cursor: string | undefined) =>
      fetchPostPagination({cursor, blockedUserIds, supabase: supabase!}),
    [blockedUserIds, supabase],
  );

  const {error, isValidating, mutate} = useSWR(
    ['posts', cursor],
    () => fetchPostPagination({cursor, blockedUserIds, supabase: supabase!}),
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      onSuccess: (data) => {
        let newPosts = allPosts;
        if (!cursor) {
          newPosts = addPostsIfNotExists(allPosts, data);
        } else {
          newPosts = addPostsIfNotExists(allPosts, data);
        }

        setAllPosts(newPosts);
        setLoadingMore(false);
        if (newPosts.length > 0) {
          setCursor(newPosts[newPosts.length - 1].created_at || undefined);
        }
      },
    },
  );

  const loadMore = () => {
    if (!loadingMore) {
      setLoadingMore(true);
      fetcher(cursor).then((newPosts) => {
        setAllPosts(addPostsIfNotExists(allPosts, newPosts));
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
            ListEmptyComponent={<ListEmptyItem />}
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
    <ErrorBoundary FallbackComponent={FallbackComponent}>
      <Container>
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
    </ErrorBoundary>
  );
}
