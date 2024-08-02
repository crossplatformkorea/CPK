import {Platform} from 'react-native';
import styled, {css} from '@emotion/native';
import {FlashList} from '@shopify/flash-list';
import {Typography, useDooboo} from 'dooboo-ui';
import CustomPressable from 'dooboo-ui/uis/CustomPressable';
import {Stack} from 'expo-router';
import {useRecoilValue} from 'recoil';
import UserImage from '../../../src/components/uis/UserImage';
import {delayPressIn} from '../../../src/utils/constants';
import {authRecoilState} from '../../../src/recoil/atoms';
import NotFound from '../../../src/components/uis/NotFound';
import {t} from '../../../src/STRINGS';

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

type Props = {};

export default function BlockUser({}: Props): JSX.Element {
  const {authId} = useRecoilValue(authRecoilState);

  const blockUsers = [];

  const handleUnblock = (userId: string | undefined): void => {
    if (!userId || !authId) {
      return;
    }
  };

  return (
    <>
      <Stack.Screen options={{title: t('blockUsers.title')}} />
      <FlashList
        ListEmptyComponent={<NotFound />}
        // ListFooterComponent={
        //   isLoadingNext ? (
        //     <LottieView
        //       style={css`
        //         align-self: center;
        //       `}
        //     />
        //   ) : (
        //     <View
        //       style={css`
        //         height: 24px;
        //       `}
        //     />
        //   )
        // }
        data={blockUsers}
        estimatedItemSize={50}
        // onEndReached={() => {
        //   !isLoadingNext && loadNext?.(LIST_CNT);
        // }}
        // onRefresh={() => {
        //   refetch?.({first: LIST_CNT}, {fetchPolicy: 'network-only'});
        // }}
        // refreshing={isLoadingNext}
        onEndReachedThreshold={0.1}
        renderItem={({item}) => (
          <BlockUserItem
            displayName={item?.displayName || t('common.unknown')}
            imageUrl={item?.imageUrl}
            onPress={() => handleUnblock(item?.id)}
          />
        )}
        showsVerticalScrollIndicator={Platform.OS === 'web'}
      />
    </>
  );
}
