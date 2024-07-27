import {useCallback, useState} from 'react';
import {Image, Platform, ScrollView} from 'react-native';
import styled, {css} from '@emotion/native';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {Icon, Typography, useDooboo} from 'dooboo-ui';
import StatusBarBrightness from 'dooboo-ui/uis/StatusbarBrightness';
import * as AppleAuthentication from 'expo-apple-authentication';
import {Redirect, Stack, useRouter} from 'expo-router';
import {useRecoilValue} from 'recoil';

import {googleClientIdIOS, googleClientIdWeb} from '../../config';
import {IC_CROSSPLATFORMS, IC_GOOGLE, IC_ICON} from '../../src/icons';
import {authRecoilState} from '../../src/recoil/atoms';
import {t} from '../../src/STRINGS';
import {supabase} from '../../src/supabase';
import SocialSignInButton from '../../src/uis/SocialSignInButton';
import {showAlert} from '../../src/utils/alert';

const Container = styled.SafeAreaView`
  flex: 1;
  align-self: stretch;
  background-color: ${({theme}) => theme.brand};

  justify-content: center;
  align-items: center;
`;

const Content = styled.View`
  gap: 20px;
  justify-content: center;
  align-items: center;
`;

const Buttons = styled.View`
  align-self: stretch;
  margin-top: 8px;
  padding: 20px;
  gap: 12px;
`;

export default function SignIn(): JSX.Element {
  const {theme} = useDooboo();
  const {authId} = useRecoilValue(authRecoilState);
  const [isHorizontal, setIsHorizontal] = useState(false);
  const {push} = useRouter();

  GoogleSignin.configure({
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    webClientId: googleClientIdWeb,
    iosClientId: googleClientIdIOS,
  });

  const googleSignIn = useCallback(async () => {
    try {
      await GoogleSignin.hasPlayServices();

      const userInfo = await GoogleSignin.signIn();

      if (userInfo.idToken) {
        const {error} = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: userInfo.idToken,
        });

        supabase.auth.updateUser({data: {avatar_url: userInfo.user.photo}});

        if (error && __DEV__) {
          // eslint-disable-next-line no-console
          console.error(error);

          return;
        }

        return;
      }

      showAlert(t('signIn.googleIdNotAvailable'));
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      } else if (error.code === statusCodes.IN_PROGRESS) {
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
        showAlert(t('signIn.playServiceNotAvailable'));
      } else {
        showAlert(t('error.default'));
      }
    }
  }, []);

  const appleSignIn = useCallback(async (): Promise<void> => {
    try {
      const {identityToken} = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (identityToken) {
        await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: identityToken,
        });
      }
    } catch (e: any) {
      if (
        e.code === 'ERR_REQUEST_CANCELED' ||
        e.code === 'ERR_CANCELED' ||
        e.code === 'ERR_REQUEST_UNKNOWN'
      ) {
        return;
      }

      showAlert(t('error.default'));
    }
  }, []);

  if (authId) {
    return <Redirect href="/" />;
  }

  return (
    <Container
      onLayout={(e) => {
        setIsHorizontal(
          e.nativeEvent.layout.width > e.nativeEvent.layout.height,
        );
      }}
    >
      <StatusBarBrightness type="light-content" />
      <Stack.Screen options={{headerShown: false}} />
      <ScrollView>
        <Content
          style={css`
            padding-top: ${!isHorizontal ? '16%' : '5%'};
          `}
        >
          <Image
            source={IC_ICON}
            style={css`
              align-self: center;
              width: 60px;
              height: 60px;
            `}
          />

          <Typography.Heading5
            style={css`
              color: white;
              font-size: 16px;
              padding: 2px 20px 12px;
              text-align: center;
            `}
          >
            {t('signIn.description')}
          </Typography.Heading5>
          <Image
            source={IC_CROSSPLATFORMS}
            style={css`
              height: 240px;
            `}
          />
          <Buttons>
            <SocialSignInButton
              imageSource={IC_GOOGLE}
              onPress={googleSignIn}
              style={css`
                background-color: #f5f5f5;
                border-radius: 3px;
              `}
              styles={{
                text: css`
                  color: #696969;
                  font-family: Pretendard-Bold;
                  font-size: 14px;
                `,
                image: css`
                  width: 16px;
                  height: 16px;
                `,
              }}
              text={t('signIn.continueWithProvider', {provider: 'Google'})}
            />

            {Platform.OS === 'ios' ? (
              <SocialSignInButton
                leftElement={
                  <Icon color="white" name="AppleLogoFill" size={16} />
                }
                onPress={appleSignIn}
                style={css`
                  background-color: black;
                  border-radius: 3px;
                `}
                styles={{
                  text: css`
                    color: white;
                    font-family: Pretendard-Bold;
                    font-size: 14px;
                  `,
                }}
                text={t('signIn.continueWithProvider', {provider: 'Apple'})}
              />
            ) : null}
            <Typography.Body4
              style={css`
                margin-top: 4px;
                text-align: center;
                line-height: 20px;
                color: ${theme.text.placeholderContrast};
              `}
            >
              {t('signIn.policyAgreement', {
                termsOfService: `**${t('signIn.termsOfService')}**`,
                privacyPolicy: `**${t('signIn.privacyPolicy')}**`,
              })
                .split('**')
                .map((str, i) =>
                  i % 2 === 0 ? (
                    str
                  ) : (
                    <Typography.Body4
                      key={str}
                      onPress={() => {
                        if (str === t('signIn.privacyPolicy')) {
                          return push('/privacyandpolicy');
                        }

                        push('/termsofservice');
                      }}
                      style={css`
                        text-decoration-line: underline;
                        color: white;
                        text-decoration-line: underline;
                      `}
                    >
                      {str}
                    </Typography.Body4>
                  ),
                )}
            </Typography.Body4>
          </Buttons>
        </Content>
      </ScrollView>
    </Container>
  );
}
