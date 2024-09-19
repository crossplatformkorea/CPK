import styled, {css} from '@emotion/native';
import {Hr, Icon, Typography, useDooboo} from 'dooboo-ui';
import {Stack, useLocalSearchParams, useRouter} from 'expo-router';
import {ReplyWithJoins} from '../../../../src/types';
import {t} from '../../../../src/STRINGS';
import NotFound from '../../../../src/components/uis/NotFound';
import {Pressable, View} from 'react-native';
import {openURL} from '../../../../src/utils/common';
import {formatDateTime} from '../../../../src/utils/date';
import UserListItem from '../../../../src/components/uis/UserListItem';
import ControlItem from '../../../../src/components/uis/ControlItem';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Replies from './replies';
import {useCallback, useRef, useEffect, useState} from 'react';
import {FlashList} from '@shopify/flash-list';
import {useRecoilState} from 'recoil';
import YoutubePlayer from '@dooboo/react-native-youtube-iframe';
import {authRecoilState, postsRecoilState} from '../../../../src/recoil/atoms';
import {useAppLogic} from '../../../../src/providers/AppLogicProvider';
import {
  fetchDeletePost,
  incrementViewCount,
} from '../../../../src/apis/postQueries';
import {toggleLike} from '../../../../src/apis/likeQueries';
import ParsedText from 'react-native-parsed-text';
import ImageCarousel from '../../../../src/components/uis/ImageCarousel';
import {
  getYoutubeIdFromURL,
  isYoutubeURL,
} from '../../../../src/utils/urlParser';
import {RectButton} from 'react-native-gesture-handler';
import ErrorBoundary from 'react-native-error-boundary';
import FallbackComponent from '../../../../src/components/uis/FallbackComponent';
import useSupabase from '../../../../src/hooks/useSupabase';

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
  const {supabase} = useSupabase();
  const {id} = useLocalSearchParams<{id: string}>();
  const {theme, snackbar} = useDooboo();
  const {bottom} = useSafeAreaInsets();
  const [{authId}] = useRecoilState(authRecoilState);
  const [posts, setPosts] = useRecoilState(postsRecoilState);
  const repliesRef = useRef<FlashList<ReplyWithJoins> | null>(null);
  const {handlePeerContentAction, handleUserContentAction} = useAppLogic();
  const {back, push} = useRouter();
  const [postLikes, setPostLikes] = useState<number>(0);
  const [hasLiked, setHasLiked] = useState<boolean>(false);

  const post = posts.find((p) => p.id === id);

  useEffect(() => {
    if (id && supabase) {
      incrementViewCount({
        postId: id,
        supabase,
      });

      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === id ? {...p, view_count: (p.view_count || 0) + 1} : p,
        ),
      );
    }
  }, [id, setPosts, supabase]);

  useEffect(() => {
    if (post) {
      setPostLikes(post.likes?.length || 0);
      setHasLiked(
        post.likes?.some((like) => like.user_id === authId && like.liked) ||
          false,
      );
    }
  }, [post, authId]);

  const handleDeletePost = useCallback(async () => {
    if (!post || !supabase) return;

    const result = await fetchDeletePost({id: post.id, supabase});

    if (result) {
      snackbar.open({text: t('common.deleteSuccess')});
      setPosts((prevPosts) => prevPosts.filter((p) => p.id !== post.id));
      back();
      return;
    }

    snackbar.open({
      color: 'danger',
      text: t('common.unhandledError'),
    });
  }, [post, supabase, snackbar, setPosts, back]);

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
        onCompleted(type) {
          if (type === 'block') {
            back();
          }
        },
      });
    }
  }, [
    authId,
    back,
    handleDeletePost,
    handlePeerContentAction,
    handleUserContentAction,
    post?.id,
    post?.user_id,
    push,
  ]);

  const handlePressUser = useCallback(() => {
    if (post?.user.display_name) {
      push({
        pathname: `/[displayName]`,
        params: {displayName: `@${post.user.display_name}`},
      });
    }
  }, [post?.user.display_name, push]);

  const handleToggleLike = async () => {
    if (!authId || !post || !supabase) return;

    const userLike = post.likes?.find((like) => like.user_id === authId);

    if (userLike) {
      setPostLikes((prevLikes) => prevLikes - 1);
      setHasLiked(false);
    } else {
      setPostLikes((prevLikes) => prevLikes + 1);
      setHasLiked(true);
    }

    await toggleLike({
      userId: authId,
      postId: post.id,
      supabase,
    });

    setPosts((prevPosts) =>
      prevPosts.map((p) =>
        p.id === post.id
          ? {
              ...p,
              likes: hasLiked
                ? p.likes.filter((like) => like.user_id !== authId)
                : [
                    ...p.likes,
                    {
                      id: '',
                      liked: true,
                      post_id: null,
                      reply_id: null,
                      user_id: authId,
                    },
                  ],
            }
          : p,
      ),
    );
  };

  const content = (() => {
    switch (true) {
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
                  {`${formatDateTime(post.created_at!)} | ${t(
                    'common.viewsWithCount',
                    {
                      count: post.view_count || 0,
                    },
                  )}`}
                </Typography.Body4>
              </View>
              <Pressable onPress={handlePressUser}>
                <UserListItem user={post.user} />
              </Pressable>
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

              {post?.url && isYoutubeURL(post.url) ? (
                <YoutubePlayer
                  height={240}
                  play={false}
                  pointerEvents="box-none"
                  quality="hd720"
                  videoId={getYoutubeIdFromURL(post.url)}
                  webViewProps={{
                    injectedJavaScript: `
                            var element = document.getElementsByClassName('container')[0];
                            element.style.position = 'unset';
                            true;
                          `,
                  }}
                  // @ts-ignore
                  width="100%"
                />
              ) : null}

              <ParsedText
                parse={[
                  {
                    type: 'url',
                    onPress: (url) => openURL(url),
                    style: css`
                      color: ${theme.role.link};
                    `,
                  },
                ]}
                selectable
                style={css`
                  color: ${theme.text.basic};
                  font-size: 16px;
                  line-height: 22.8px;
                `}
              >
                {post.content}
              </ParsedText>

              {post.images && post.images.length > 0 ? (
                <ImageCarousel borderRadius={8} images={post.images} />
              ) : null}

              <ControlItem
                hasLiked={hasLiked}
                likeCnt={postLikes}
                onPressLike={handleToggleLike}
                onPressShare={() => {}}
                replyCnt={post.replies.length || 0}
              />
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
              <Replies
                flashListRef={repliesRef}
                header={header}
                postId={post.id}
              />
            </View>
          </>
        );
      default:
        return null;
    }
  })();

  return (
    <ErrorBoundary FallbackComponent={FallbackComponent}>
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
                <RectButton
                  hitSlop={{top: 20, left: 20, right: 20, bottom: 20}}
                  onPress={handlePressMore}
                  activeOpacity={0}
                  style={css`
                    margin-right: -8px;
                    border-radius: 48px;
                  `}
                >
                  <Icon name="DotsThreeOutlineVertical" size={18} />
                </RectButton>
              </View>
            ) : null,
        }}
      />
      <Container>{content}</Container>
    </ErrorBoundary>
  );
}
