import styled from '@emotion/native';
import {Hr, Typography} from 'dooboo-ui';
import type {Post} from '../../types';
import {formatDateTime} from '../../utils/date';

const Container = styled.View`
  height: 208px;
  padding: 12px 24px;
  background-color: ${({theme}) => theme.bg.basic};
`;

type Props = {
  post: Post;
};

export default function PostListItem({post}: Props): JSX.Element {
  return (
    <Container>
      <Typography.Heading5>{post.title}</Typography.Heading5>
      <Typography.Body3>{post.content}</Typography.Body3>
      <Hr />
      <Typography.Body4>{formatDateTime(post.created_at)}</Typography.Body4>
    </Container>
  );
}
