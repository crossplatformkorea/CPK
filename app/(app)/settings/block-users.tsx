import {useState, useEffect, useCallback} from 'react';
import {Platform} from 'react-native';
import styled, {css} from '@emotion/native';
import {FlashList} from '@shopify/flash-list';
import {Button, Typography, useDooboo} from 'dooboo-ui';
import CustomPressable from 'dooboo-ui/uis/CustomPressable';
import {Stack} from 'expo-router';
import {useRecoilState} from 'recoil';
import UserImage from '../../../src/components/uis/UserImage';
import {delayPressIn, PAGE_SIZE} from '../../../src/utils/constants';
import {authRecoilState} from '../../../src/recoil/atoms';
import NotFound from '../../../src/components/uis/NotFound';
import {t} from '../../../src/STRINGS';
import {fetchBlockUsersPagination, fetchUnblockUser} from '../../../src/apis/blockQueries';
import {User} from '../../../src/types';

const Profile = styled.View`
  padding: 16px 16px 8px 16px;
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

function BlockUserItem({
  imageUrl,
  displayName,
  onPress,
}: {
  imageUrl: string | undefined | null;
  displayName: string;
  onPress?: () => void;
}): JSX.Element {
  const {theme} = useDooboo();

  return (
    <Profile>
      <UserImage height={48} imageUrl={imageUrl} width={48} />
      <Typography.Body2
        style={css`
          font-family: Pretendard-Bold;
        `}
      >
        {displayName}
      </Typography.Body2>
      <CustomPressable
        delayHoverIn={delayPressIn}
        onPress={onPress}
        style={css`
          margin-left: auto;
          background-color: ${theme.button.light.bg};
          padding: 4px 8px;
          border-radius: 18px;
        `}
      >
        <Typography.Body4
          style={css`
            font-family: Pretendard-Bold;
          `}
        >
          {t('common.unblock')}
        </Typography.Body4>
      </CustomPressable>
    </Profile>
  );
}

const Container = styled.View`
  flex: 1;
  align-self: stretch;
  background-color: ${({theme}) => theme.bg.basic};
`;

export default function BlockUser(): JSX.Element {
  const {alertDialog} = useDooboo();
  const [{authId}, setAuth] = useRecoilState(authRecoilState);
  const [blockUsers, setBlockUsers] = useState<User[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadBlockedUsers = useCallback(
    async (loadMore = false) => {
      if (loadingMore || refreshing || !authId) return;

      if (loadMore) {
        setLoadingMore(true);
      } else {
        setRefreshing(true);
        setCursor(new Date().toISOString());
      }

      try {
        const data = await fetchBlockUsersPagination(
          authId,
          loadMore ? cursor : new Date().toISOString(),
          PAGE_SIZE,
        );

        setBlockUsers((prev) => (loadMore ? [...prev, ...data] : data));

        if (data.length > 0) {
          setCursor(data[data.length - 1].created_at || undefined);
        }
      } catch (error) {
        console.error('Failed to fetch blocked users:', error);
      } finally {
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [authId, cursor, loadingMore, refreshing],
  );

  useEffect(() => {
    if (authId) {
      loadBlockedUsers();
    }
  }, [authId, loadBlockedUsers]);

  const handleUnblock = (userId: string | undefined): void => {
    if (!userId || !authId) {
      return;
    }

    alertDialog.open({
      title: t('blockUsers.cancelBlock'),
      body: t('blockUsers.cancelBlockDesc'),
      closeOnTouchOutside: false,
      actions: [
        <Button
          color="light"
          key="button-light"
          onPress={() => alertDialog.close()}
          styles={{
            container: css`
              height: 48px;
            `,
          }}
          text={t('common.cancel')}
        />,
        <Button
          onPress={() => {
            alertDialog.close();

            fetchUnblockUser(authId, userId);
            setAuth((prev) => ({...prev, blockedUserIds: prev.blockedUserIds.filter((id) => id !== userId)}));
          }}
          styles={{
            container: css`
              height: 48px;
            `,
          }}
          text={t('common.unblock')}
        />,
      ],
    });
  };

  return (
    <Container>
      <Stack.Screen options={{title: t('blockUsers.title')}} />
      <FlashList
        ListEmptyComponent={<NotFound />}
        data={blockUsers}
        estimatedItemSize={50}
        onEndReached={() => loadBlockedUsers(true)}
        onEndReachedThreshold={0.1}
        onRefresh={() => loadBlockedUsers()}
        refreshing={refreshing}
        renderItem={({item}) => (
          <BlockUserItem
            displayName={item?.name || t('common.unknown')}
            imageUrl={item?.avatar_url}
            onPress={() => handleUnblock(item?.id)}
          />
        )}
        showsVerticalScrollIndicator={Platform.OS === 'web'}
      />
    </Container>
  );
}