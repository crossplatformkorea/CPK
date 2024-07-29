import styled, {css} from '@emotion/native';
import {Hr, Icon, Typography, useDooboo} from 'dooboo-ui';
import {Stack, useLocalSearchParams, useRouter} from 'expo-router';
import {Reply} from '../../../../src/types';
import useSWR from 'swr';
import CustomLoadingIndicator from '../../../../src/components/uis/CustomLoadingIndicator';
import {t} from '../../../../src/STRINGS';
import ErrorFallback from '../../../../src/components/uis/ErrorFallback';
import NotFound from '../../../../src/components/uis/NotFound';
import {Pressable, View} from 'react-native';
import {openURL} from '../../../../src/utils/common';
import {formatDateTime} from '../../../../src/utils/date';
import UserListItem from '../../../../src/components/uis/UserListItem';
import ControlItem from '../../../../src/components/uis/ControlItem';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Replies from '../../replies';
import {useCallback, useRef, useEffect} from 'react';
import {FlashList} from '@shopify/flash-list';
import CustomPressable from 'dooboo-ui/uis/CustomPressable';
import {delayPressIn} from '../../../../src/utils/constants';
import {useRecoilState} from 'recoil';
import {authRecoilState} from '../../../../src/recoil/atoms';
import {useAppLogic} from '../../../../src/providers/AppLogicProvider';
import {fetchDeletePost, fetchPostById} from '../../../../src/apis/postQueries';
import {supabase} from '../../../../src/supabase';

const Container = styled.View`
  background-color: ${({theme}) => theme.bg.basic};
  flex: 1;
  align-self: stretch;
`;

const Content = styled.View`
  padding: 24px;
  gap: 24px;
`;

export default function PostDetails(): JSX.Element {
  const {id} = useLocalSearchParams<{id: string}>();
  const {theme, snackbar} = useDooboo();
  const {bottom} = useSafeAreaInsets();
  const [{authId}] = useRecoilState(authRecoilState);
  const repliesRef = useRef<FlashList<Reply> | null>(null);
  const {handlePeerContentAction, handleUserContentAction} = useAppLogic();
  const {back, push} = useRouter();

  const {
    data: post,
    error,
    isValidating,
    mutate,
  } = useSWR(id ? `post-${id}` : null, () => fetchPostById(id || ''));

  const handleDeletePost = useCallback(async () => {
    if (!post) return;

    const result = await fetchDeletePost({id: post?.id});

    if (result) {
      snackbar.open({text: t('common.deleteSuccess')});
      back();

      return;
    }

    snackbar.open({
      color: 'danger',
      text: t('common.unhandledError'),
    });
  }, [post]);

  const handlePressMore = useCallback(() => {
    if (authId === post?.user_id) {
      handleUserContentAction({
        onUpdate: () =>
          push({
            pathname: `/post/[id]/update`,
            params: {id: post?.id},
          }),
        onDelete: () => handleDeletePost(),
      });

      return;
    } else if (post?.user_id) {
      handlePeerContentAction({
        userId: post?.user_id,
        onCompleted: async () => {
          back();
        },
      });
    }
  }, [post]);

  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'posts',
          filter: `id=eq.${id}`,
        },
        async (payload) => {
          const updatedPost = await fetchPostById(id);

          if (updatedPost) {
            mutate(updatedPost, false);
          }
        },
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [id, mutate]);

  const content = (() => {
    switch (true) {
      case isValidating && !authId:
        return <CustomLoadingIndicator />;
      case error:
        return <ErrorFallback />;
      case !post:
        return <NotFound />;
      case !!post:
        const header = (
          <>
            <Content>
              <View
                style={css`
                  gap: 2px;
                `}
              >
                <Typography.Heading5>{post.title}</Typography.Heading5>
                <Typography.Body4
                  style={css`
                    color: ${theme.text.label};
                  `}
                >
                  {`${formatDateTime(post.created_at!)} | ${t('common.viewsWithCount', {count: post.view_count || 0})}`}
                </Typography.Body4>
              </View>
              <UserListItem user={post.user} />
              {post?.url ? (
                <Pressable onPress={() => openURL(post?.url || '')}>
                  <View
                    style={css`
                      padding: 12px;
                      background-color: ${theme.bg.paper};
                      border-radius: 8px;

                      flex-direction: row;
                      justify-content: center;
                      align-items: center;
                      gap: 8px;
                    `}
                  >
                    <Icon name="Link" size={16} color={theme.text.basic} />
                    <Typography.Body1
                      numberOfLines={1}
                      style={css`
                        flex: 1;
                        font-size: 11px;
                        font-family: Pretendard-Bold;
                      `}
                    >
                      {post.url}
                    </Typography.Body1>
                  </View>
                </Pressable>
              ) : null}
              <Typography.Body1>{post.content}</Typography.Body1>
              <ControlItem />
            </Content>
            <Hr
              style={css`
                height: 16px;
                margin-bottom: 16px;
                background-color: ${theme.bg.paper};
              `}
            />
          </>
        );

        return (
          <>
            <View
              style={css`
                flex: 1;
                padding-bottom: ${bottom + 'px'};
              `}
            >
              <Replies flashListRef={repliesRef} header={header} />
            </View>
          </>
        );
      default:
        return null;
    }
  })();

  return (
    <Container>
      <Stack.Screen
        options={{
          title: post?.title || t('common.post'),
          headerRight: () =>
            authId ? (
              <View
                style={css`
                  flex-direction: row;
                  align-items: center;
                  gap: 4px;
                `}
              >
                <CustomPressable
                  delayHoverIn={delayPressIn}
                  hitSlop={{top: 20, left: 20, right: 20, bottom: 20}}
                  onPress={handlePressMore}
                  style={css`
                    margin-right: -8px;
                    padding: 8px;
                    border-radius: 48px;
                  `}
                >
                  <Icon name="DotsThreeOutlineVertical" size={18} />
                </CustomPressable>
              </View>
            ) : null,
        }}
      />
      {content}
    </Container>
  );
}
