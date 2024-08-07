import styled, {css} from '@emotion/native';
import {Fab, LoadingIndicator} from 'dooboo-ui';
import StatusBarBrightness from 'dooboo-ui/uis/StatusbarBrightness';
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
import {authRecoilState, postsRecoilState} from '../../../src/recoil/atoms';
import ListEmptyItem from '../../../src/components/uis/ListEmptyItem';

const Container = styled.View`
  flex: 1;
  align-self: stretch;
  background-color: ${({theme}) => theme.bg.basic};
`;

export default function Posts(): JSX.Element {
  const {push} = useRouter();
  const {authId, blockedUserIds} = useRecoilValue(authRecoilState);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [allPosts, setAllPosts] =
    useRecoilState<PostWithJoins[]>(postsRecoilState);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetcher = useCallback(
    (cursor: string | undefined) =>
      fetchPostPagination({cursor, blockedUserIds}),
    [blockedUserIds],
  );

  const {error, isValidating, mutate} = useSWR(
    ['posts', cursor],
    () => fetchPostPagination({cursor, blockedUserIds}),
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
