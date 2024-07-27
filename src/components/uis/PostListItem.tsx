import styled, {css} from '@emotion/native';
import {Hr, Typography, useDooboo} from 'dooboo-ui';
import type {Post, User} from '../../types';
import {formatDateTime} from '../../utils/date';
import {Pressable, View} from 'react-native';
import {Image} from 'expo-image';
import CustomPressable from 'dooboo-ui/uis/CustomPressable';
import {TouchableOpacity} from 'react-native-gesture-handler';

const Container = styled.View`
  background-color: ${({theme}) => theme.bg.basic};
  gap: 8px;
`;

const Content = styled.View`
  padding: 16px 24px;
  margin-bottom: -4px;
  gap: 8px;
`;

type Props = {
  post: Post & {user: User};
  onPress?: () => void;
};

export default function PostListItem({post, onPress}: Props): JSX.Element {
  const {theme} = useDooboo();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Container>
        <Content>
          <Typography.Body2
            style={css`
              font-family: Pretendard-Bold;
            `}
          >
            {post.title}
          </Typography.Body2>
          <Typography.Body3 numberOfLines={4}>{post.content}</Typography.Body3>
          {/* User */}
          <View
            style={css`
              margin-top: 2px;

              flex-direction: row;
              align-items: center;
              gap: 4px;
            `}
          >
            <Image
              source={{uri: post.user?.avatar_url || undefined}}
              style={css`
                width: 16px;
                height: 16px;
                border-radius: 8px;
                background-color: ${theme.bg.paper};
              `}
            />
            <Typography.Body4>{post.user?.name}</Typography.Body4>
          </View>
          <Hr />
          <Typography.Body4
            style={css`
              color: ${theme.text.placeholder};
            `}
          >
            {formatDateTime(post.created_at!)}
          </Typography.Body4>
        </Content>
        <Hr />
      </Container>
    </TouchableOpacity>
  );
}
