import {memo} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {css} from '@emotion/native';
import {IC_GOOGLE} from '../../../icons';
import {t} from '../../../STRINGS';
import SocialSignInButton from './SocialSignInButton';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

export type Provider = 'apple' | 'google';

type Props = {
  style?: StyleProp<ViewStyle>;
  onReceiveIdToken?: (token: string) => void;
};

export function ButtonGoogleSignIn({onReceiveIdToken}: Props): JSX.Element {
  const googleSignIn = async () => {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();

    if (userInfo?.idToken) onReceiveIdToken?.(userInfo.idToken);
  };

  return (
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
  );
}
export default memo(ButtonGoogleSignIn);
