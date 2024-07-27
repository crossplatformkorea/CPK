import styled, {css} from '@emotion/native';
import {Fab, LoadingIndicator, Typography} from 'dooboo-ui';
import StatusBarBrightness from 'dooboo-ui/uis/StatusbarBrightness';
import {t} from '../../../src/STRINGS';
import {FlashList} from '@shopify/flash-list';
import {useRouter} from 'expo-router';
import {Post, User} from '../../../src/types';
import PostListItem from '../../../src/components/uis/PostListItem';
import {useEffect, useState} from 'react';
import {supabase} from '../../../src/supabase';
import { PAGE_SIZE } from '../../../src/utils/constants';

const Container = styled.View`
  flex: 1;
  align-self: stretch;
  background-color: ${({theme}) => theme.bg.basic};
`;

type PostWithUser = Post & {user: User};

const fetchPosts = async (page: number, pageSize: number): Promise<PostWithUser[]> => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const {data, error} = await supabase
    .from('posts')
    .select(`
      *,
      user:user_id (
        *
      )
    `)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return data as unknown as PostWithUser[];
};

const fetchPostById = async (id: string): Promise<PostWithUser | null> => {
  const {data, error} = await supabase
    .from('posts')
    .select(`
      *,
      user:user_id (
        *
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (__DEV__) console.error('Error fetching post by ID:', error);
    return null;
  }

  return data as unknown as PostWithUser;
};

export default function Posts(): JSX.Element {
  const {push} = useRouter();
  const [posts, setPosts] = useState<PostWithUser[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadPosts = async (page: number) => {
    setLoading(true);
    try {
      const newPosts = await fetchPosts(page, PAGE_SIZE);
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
          const newPost = await fetchPostById(payload.new.id);
          if (newPost) {
            setPosts((currentPosts) => [newPost, ...currentPosts]);
          }
        }
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
        renderItem={({item}) => <PostListItem post={item} onPress={() => {}} />}
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
