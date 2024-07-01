import {ScrollView, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled, {css} from '@emotion/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {IconName} from 'dooboo-ui';
import {Button, Icon, Typography, useDooboo} from 'dooboo-ui';
import {Stack, useRouter} from 'expo-router';
import {useRecoilValue} from 'recoil';

import {authRecoilState} from '../../../src/recoil/atoms';
import {supabase} from '../../../src/supabase';
import type {User} from '../../../src/types/supabase';
import CustomLoadingIndicator from '../../../src/uis/CustomLoadingIndicator';
import {showConfirm} from '../../../src/utils/alert';
import {AsyncStorageKey} from '../../../src/utils/constants';

const Content = styled.View`
  flex: 1;
  padding: 24px 24px 12px 24px;
  background-color: ${({theme}) => theme.bg.basic};

  gap: 12px;
`;

const LoginInfoWrapper = styled.View`
  border-width: 1px;
  border-color: ${({theme}) => theme.role.border};
  border-radius: 8px;
  padding: 20px;
  margin: 2px 0 6px 0;

  flex-direction: row;
  align-items: flex-start;
`;

type ProviderType = {
  provider: User['provider'];
  email: string;
};

function SocialProvider({provider, email}: ProviderType): JSX.Element {
  const {theme} = useDooboo();
  const iconName: IconName =
    provider === 'email'
      ? 'Envelope'
      : provider === 'apple'
        ? 'AppleLogo'
        : provider === 'google'
          ? 'GoogleLogo'
          : 'GithubLogo';

  return (
    <LoginInfoWrapper>
      <Icon
        name={iconName}
        size={24}
        style={css`
          margin-right: 12px;
        `}
      />
      <View>
        <Typography.Body3
          style={css`
            font-family: Pretendard-Bold;
            margin-bottom: 6px;
          `}
        >
          {iconName === 'Envelope'
            ? '이메일'
            : iconName === 'AppleLogo'
              ? '애플'
              : iconName === 'GoogleLogo'
                ? '구글'
                : '깃허브'}
          로 로그인됨
        </Typography.Body3>
        <Typography.Body3
          style={css`
            color: ${theme.text.placeholder};
          `}
        >
          {email}
        </Typography.Body3>
      </View>
    </LoginInfoWrapper>
  );
}

type Props = {};

export default function LoginInfo({}: Props): JSX.Element {
  const {back, replace} = useRouter();
  const {theme, alertDialog} = useDooboo();
  const {bottom} = useSafeAreaInsets();
  const auth = useRecoilValue(authRecoilState);

  const handleSignOut = async (): Promise<void> => {
    // RNOnesignal?.logout();
    await AsyncStorage.removeItem(AsyncStorageKey.Token);
    supabase.auth.signOut();
    back();
    back();
  };

  const handleWithdrawUser = async (): Promise<void> => {
    if (!auth) {
      return;
    }

    const confirmed = await showConfirm({
      title: '탈퇴하기',
      description: '정말 탈퇴하시겠습니까? 탈퇴하면 다시 로그인할 수 없습니다.',
    });

    if (!confirmed) {
      return;
    }

    await supabase
      .from('users')
      .update({deleted_at: new Date().toISOString()})
      .eq('id', auth);

    supabase.auth.signOut();
    replace('/');
  };

  if (!auth.user) {
    return (
      <>
        <Stack.Screen options={{title: '로그인 정보'}} />
        <CustomLoadingIndicator />
      </>
    );
  }

  return (
    <Content>
      <Stack.Screen options={{title: '로그인 정보'}} />
      <ScrollView bounces={false}>
        <View
          style={css`
            gap: 12px;
          `}
        >
          <Typography.Heading5>로그인 수단</Typography.Heading5>

          <SocialProvider
            email={auth.user?.email ?? ''}
            provider={auth.user?.provider ?? 'email'}
          />
          <Button
            color="warning"
            onPress={handleSignOut}
            styles={{
              container: css`
                height: 48px;
              `,
              text: css`
                font-size: 16px;
                font-family: Pretendard-Bold;
              `,
            }}
            text="로그아웃"
            touchableHighlightProps={{
              underlayColor: theme.text.contrast,
            }}
          />
        </View>
      </ScrollView>

      <Button
        color="danger"
        onPress={() => {
          alertDialog.open({
            title: '회원 탈퇴',
            body: '탈퇴 시 앱 내 모든 데이터가 삭제됩니다. 정말 탈퇴 하시겠습니까?',
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
                text="취소"
              />,
              <Button
                color="danger"
                key="button-danger"
                // loading={isWithdrawUserInFlight}
                onPress={handleWithdrawUser}
                styles={{
                  container: css`
                    height: 48px;
                  `,
                }}
                text="탈퇴하기"
              />,
            ],
          });
        }}
        style={css`
          margin-bottom: ${bottom + 'px'};
        `}
        styles={{
          container: css`
            height: 48px;
          `,
          text: css`
            font-family: Pretendard-Bold;
            font-size: 16px;
          `,
        }}
        text="회원 탈퇴"
        touchableHighlightProps={{
          underlayColor: theme.text.contrast,
        }}
        type="outlined"
      />
    </Content>
  );
}
