import styled, {css} from '@emotion/native';
import {Fab, Typography} from 'dooboo-ui';
import StatusBarBrightness from 'dooboo-ui/uis/StatusbarBrightness';

import {t} from '../../../src/STRINGS';
import {FlashList} from '@shopify/flash-list';
import useSWR, {mutate} from 'swr';

import {useRouter} from 'expo-router';
import {Post, User} from '../../../src/types';
import PostListItem from '../../../src/components/uis/PostListItem';
import {useEffect, useState} from 'react';
import {supabase} from '../../../src/supabase';

const Container = styled.View`
  flex: 1;
  align-self: stretch;
  background-color: ${({theme}) => theme.bg.basic};
`;

type PostWithUser = Post & {user: User};

const fetcher = async (): Promise<PostWithUser[]> => {
  const {data, error} = await supabase
    .from('posts')
    .select(
      `
      *,
      user:user_id (
        *
      )
    `,
    )
    .order('created_at', {ascending: false});

  if (error) {
    throw new Error(error.message);
  }

  return data as unknown as PostWithUser[];
};

export default function Posts(): JSX.Element {
  const {push} = useRouter();
  const {data: posts} = useSWR<PostWithUser[]>('posts', fetcher);

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
        (payload) => {
          mutate((currentPosts) => {
            if (Array.isArray(currentPosts)) {
              return [...currentPosts, payload.new as PostWithUser];
            }
            return [payload.new as PostWithUser];
          });
        },
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [mutate]);

  return (
    <Container>
      <StatusBarBrightness />
      <FlashList
        data={posts}
        renderItem={({item}) => <PostListItem post={item} onPress={() => {}} />}
        estimatedItemSize={208}
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
