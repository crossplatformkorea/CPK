import {memo, useEffect} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {Platform} from 'react-native';
import {css} from '@emotion/native';
import {Prompt, ResponseType} from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import {
  googleClientIdAndroid,
  googleClientIdIOS,
  googleClientIdWeb,
} from '../../../../config';
import {IC_GOOGLE} from '../../../icons';
import {t} from '../../../STRINGS';
import SocialSignInButton from './SocialSignInButton';

export type Provider = 'apple' | 'google';

type Props = {
  style?: StyleProp<ViewStyle>;
  onReceiveIdToken?: (token: string) => void;
};

export function ButtonGoogleSignIn({onReceiveIdToken}: Props): JSX.Element {
  const [, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    prompt: Prompt.SelectAccount,
    usePKCE: false,
    scopes: ['openid', 'profile', 'email'],
    responseType: Platform.select({
      web: ResponseType.Token,
    }),
    androidClientId: googleClientIdAndroid,
    iosClientId: googleClientIdIOS,
    webClientId: googleClientIdWeb,
  });

  useEffect(() => {
    if (googleResponse?.type === 'success' && googleResponse.authentication) {
      const idToken = googleResponse.authentication.idToken;
      if (idToken) onReceiveIdToken?.(idToken);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleResponse]);

  return (
    <SocialSignInButton
      imageSource={IC_GOOGLE}
      onPress={googlePromptAsync}
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
  );
}
export default memo(ButtonGoogleSignIn);
