import {ScrollView, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled, {css} from '@emotion/native';
import type {IconName} from 'dooboo-ui';
import {Button, Icon, Typography, useDooboo} from 'dooboo-ui';
import {Stack, useRouter} from 'expo-router';
import {t} from '../../../src/STRINGS';
import {showConfirm} from '../../../src/utils/alert';
import CustomLoadingIndicator from '../../../src/components/uis/CustomLoadingIndicator';
import ErrorBoundary from 'react-native-error-boundary';
import FallbackComponent from '../../../src/components/uis/FallbackComponent';
import {useAuth, useUser} from '@clerk/clerk-expo';
import {OAuthProvider} from '@clerk/types/dist';
import {useRecoilState} from 'recoil';
import {authRecoilState} from '../../../src/recoil/atoms';
import {fetchDeletePushToken} from '../../../src/apis/pushTokenQueries';
import {supabase} from '../../../src/supabase';

const Container = styled.View`
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
  email: string;
  provider: OAuthProvider;
};

function SocialProvider({provider, email}: ProviderType): JSX.Element {
  const {theme} = useDooboo();

  const iconName: IconName =
    provider === 'apple'
      ? 'AppleLogo'
      : provider === 'google'
        ? 'GoogleLogo'
        : provider === 'github'
          ? 'GithubLogo'
          : 'Envelope';

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
          {t('loginInfo.loggedInWith', {
            provider:
              iconName === 'Envelope'
                ? 'Email'
                : iconName === 'AppleLogo'
                  ? 'Apple'
                  : iconName === 'GoogleLogo'
                    ? 'Google'
                    : 'Github',
          })}
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

export default function LoginInfo(): JSX.Element {
  const {replace} = useRouter();
  const {theme, alertDialog} = useDooboo();
  const {bottom} = useSafeAreaInsets();
  const {signOut} = useAuth();
  const {isSignedIn, user} = useUser();
  const [{pushToken}, setAuth] = useRecoilState(authRecoilState);

  const handleSignOut = async (): Promise<void> => {
    if (isSignedIn) {
      if (pushToken && user?.id) {
        await fetchDeletePushToken({
          authId: user?.id,
          expoPushToken: pushToken,
        });
      }

      signOut();
    }
  };

  const handleWithdrawUser = async (): Promise<void> => {
    const confirmed = await showConfirm({
      title: t('loginInfo.withdrawAccount'),
      description: t('loginInfo.withdrawAccountDescription'),
    });

    if (!confirmed) {
      return;
    }

    if (user?.id) {
      await supabase
        .from('users')
        .update({deleted_at: new Date().toISOString()})
        .eq('id', user?.id);

      if (isSignedIn) {
        signOut();
      }
    }

    setAuth({
      authId: null,
      user: null,
      blockedUserIds: [],
      pushToken: null,
      tags: [],
    });

    replace('/');
  };

  if (!isSignedIn) {
    return (
      <>
        <Stack.Screen options={{title: t('loginInfo.title')}} />
        <CustomLoadingIndicator />
      </>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={FallbackComponent}>
      <Stack.Screen options={{title: t('loginInfo.title')}} />
      <Container>
        <ScrollView bounces={false}>
          <View
            style={css`
              gap: 12px;
            `}
          >
            <Typography.Heading5>
              {t('loginInfo.loginMethod')}
            </Typography.Heading5>
            <SocialProvider
              email={user?.primaryEmailAddress?.emailAddress ?? ''}
              provider={user?.externalAccounts?.[0].provider ?? 'email'}
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
              text={t('loginInfo.logout')}
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
              title: t('loginInfo.withdrawAccount'),
              body: t('loginInfo.withdrawAccountDescription'),
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
                  color="danger"
                  key="button-danger"
                  // loading={isWithdrawUserInFlight}
                  onPress={handleWithdrawUser}
                  styles={{
                    container: css`
                      height: 48px;
                    `,
                  }}
                  text={t('common.confirm')}
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
          text={t('loginInfo.withdrawAccount')}
          touchableHighlightProps={{
            underlayColor: theme.text.contrast,
          }}
          type="outlined"
        />
      </Container>
    </ErrorBoundary>
  );
}
