import styled, {css} from '@emotion/native';
import {Fab, LoadingIndicator, Typography} from 'dooboo-ui';
import StatusBarBrightness from 'dooboo-ui/uis/StatusbarBrightness';
import {t} from '../../../src/STRINGS';
import {FlashList} from '@shopify/flash-list';
import {useRouter} from 'expo-router';
import {Post, PostWithUser, User} from '../../../src/types';
import PostListItem from '../../../src/components/uis/PostListItem';
import {useEffect, useState} from 'react';
import {supabase} from '../../../src/supabase';
import {PAGE_SIZE} from '../../../src/utils/constants';
import {
  fetchPostById,
  fetchPostPagination,
} from '../../../src/apis/postQueries';

const Container = styled.View`
  flex: 1;
  align-self: stretch;
  background-color: ${({theme}) => theme.bg.basic};
`;

export default function Posts(): JSX.Element {
  const {push} = useRouter();
  const [posts, setPosts] = useState<PostWithUser[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadPosts = async (page: number) => {
    setLoading(true);
    try {
      const newPosts = await fetchPostPagination(page, PAGE_SIZE);
      setPosts((prevPosts) => [...prevPosts, ...newPosts]);
      setPage(page);
    } catch (error) {
      if (__DEV__) console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts(page);
  }, []);

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
          console.log('update', payload);
          const newPost = await fetchPostById(payload.new.id);

          if (newPost) {
            setPosts((currentPosts) => [newPost, ...currentPosts]);
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
          console.log('update', payload);
          const updatedPost = await fetchPostById(payload.new.id);

          if (updatedPost) {
            if (updatedPost.deleted_at) {
              setPosts((currentPosts) =>
                currentPosts.filter((post) => post.id !== updatedPost.id),
              );
              return;
            }

            setPosts((currentPosts) =>
              currentPosts.map((post) =>
                post.id === updatedPost.id ? updatedPost : post,
              ),
            );
          }
        },
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const loadMore = () => {
    if (!loading) {
      loadPosts(page + 1);
    }
  };

  return (
    <Container>
      <StatusBarBrightness />
      <FlashList
        data={posts}
        renderItem={({item}) => (
          <PostListItem
            post={item}
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
        ListFooterComponent={loading ? <LoadingIndicator /> : null}
      />
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
