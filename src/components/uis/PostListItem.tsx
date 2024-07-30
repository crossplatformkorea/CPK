import styled, {css} from '@emotion/native';
import {Hr, Typography, useDooboo} from 'dooboo-ui';
import type {Post, User} from '../../types';
import {formatDateTime} from '../../utils/date';
import {TouchableOpacity} from 'react-native-gesture-handler';
import UserListItem from './UserListItem';
import {View} from 'react-native';
import ControlItem, {ControlItemProps} from './ControlItem';

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
  controlItemProps?: ControlItemProps;
};

export default function PostListItem({
  post,
  onPress,
  controlItemProps,
}: Props): JSX.Element {
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
          <UserListItem user={post.user} />
          <Hr />
          <View
            style={css`
              flex-direction: row;
              align-items: center;
              justify-content: space-between;
            `}
          >
            <ControlItem {...controlItemProps} />
            <Typography.Body4
              style={css`
                color: ${theme.text.placeholder};
              `}
            >
              {formatDateTime(post.created_at!)}
            </Typography.Body4>
          </View>
        </Content>
        <Hr />
      </Container>
    </TouchableOpacity>
  );
}
