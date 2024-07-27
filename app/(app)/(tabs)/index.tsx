import styled, {css} from '@emotion/native';
import {Fab, Typography} from 'dooboo-ui';
import StatusBarBrightness from 'dooboo-ui/uis/StatusbarBrightness';

import {t} from '../../../src/STRINGS';
import {FlashList} from '@shopify/flash-list';
import {useRouter} from 'expo-router';
import {Post} from '../../../src/types';
import PostListItem from '../../../src/components/uis/PostListItem';

const Container = styled.View`
  flex: 1;
  align-self: stretch;
  padding: 12px 24px;
  background-color: ${({theme}) => theme.bg.basic};
`;

export default function Posts(): JSX.Element {
  const {push} = useRouter();

  const posts: Post[] = [
    {
      id: '1',
      user_id: '1',
      content: 'content',
      created_at: '2021-09-01T00:00:00Z',
      title: 'title',
      deleted_at: null,
      updated_at: '2021-09-01T00:00:00Z',
      url: 'url',
    },
  ];

  return (
    <Container>
      <StatusBarBrightness />
      <FlashList
        ListHeaderComponent={
          <Typography.Heading4>{t('common.latest')}</Typography.Heading4>
        }
        data={[]}
        renderItem={({item}) => <PostListItem post={item} />}
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
