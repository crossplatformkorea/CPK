import {memo, useCallback, useState} from 'react';
import {type StyleProp, type ViewStyle} from 'react-native';
import {css} from '@emotion/native';
import {IC_GITHUB, IC_GOOGLE} from '../../../icons';
import {t} from '../../../STRINGS';
import * as Linking from 'expo-linking';

import SocialSignInButton from './ButtonSocialSignInView';
import {
  useOAuth,
  useSignIn,
  type UseOAuthFlowParams,
  useSignUp,
  useAuth,
} from '@clerk/clerk-expo';
import {Icon} from 'dooboo-ui';
import {useRouter} from 'expo-router';

type Props = {
  style?: StyleProp<ViewStyle>;
  strategy: UseOAuthFlowParams['strategy'];
};

export function ButtonSocialSignIn({strategy}: Props): JSX.Element {
  const {replace} = useRouter();
  const {startOAuthFlow} = useOAuth({strategy});
  const {isLoaded: isSignInLoaded} = useSignIn();
  const {isLoaded: isSignUpLoaded} = useSignUp();
  const {signOut} = useAuth();
  const [loading, setLoading] = useState(false);

  const signIn = useCallback(async () => {
    if (!isSignInLoaded || !isSignUpLoaded) return null;

    setLoading(true);

    const redirectUrl = Linking.createURL('oauth-native-callback', {
      scheme: 'cpk',
    });

    try {
      const {createdSessionId, signIn, signUp, setActive} =
        await startOAuthFlow({redirectUrl});

      if (!signIn || !signUp) {
        return;
      }

      const signInWith = async (strategy: UseOAuthFlowParams['strategy']) => {
        if (createdSessionId) {
          setActive!({session: createdSessionId});
        }
      };

      // If the user has an account in your application, but does not yet
      // have an OAuth account connected to it, you can transfer the OAuth
      // account to the existing user account.
      const userExistsButNeedsToSignIn =
        signUp.verifications.externalAccount.status === 'transferable' &&
        signUp.verifications.externalAccount.error?.code ===
          'external_account_exists';

      if (userExistsButNeedsToSignIn) {
        const res = await signIn.create({transfer: true});

        if (res.status === 'complete') {
          setActive?.({session: res.createdSessionId});
        }
      }

      // If the user has an OAuth account but does not yet
      // have an account in your app, you can create an account
      // for them using the OAuth information.
      const userNeedsToBeCreated =
        signIn.firstFactorVerification.status === 'transferable';

      if (userNeedsToBeCreated) {
        const res = await signUp.create({transfer: true});

        if (res.status === 'complete') {
          setActive?.({session: res.createdSessionId});
          replace('/');

          return;
        }

        return;
      }

      // If the user has an account in your application
      // and has an OAuth account connected to it, you can sign them in.
      signInWith(strategy);
    } catch (error: any) {
      console.log('error', JSON.stringify(error));
      if (error.clerkError) {
        const {code} = error.errors[0];
        console.log(`[signIn] Clerk Error (${code}):`, error);
      } else {
        console.warn('[signIn] Other Error:', error);
      }
      signOut();
    } finally {
      setLoading(false);
    }
  }, [
    isSignInLoaded,
    isSignUpLoaded,
    replace,
    signOut,
    startOAuthFlow,
    strategy,
  ]);

  if (strategy === 'oauth_apple') {
    return (
      <SocialSignInButton
        leftElement={<Icon color="white" name="AppleLogoFill" size={16} />}
        onPress={signIn}
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
    );
  }

  if (strategy === 'oauth_google') {
    return (
      <SocialSignInButton
        imageSource={IC_GOOGLE}
        onPress={signIn}
        loading={loading}
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

  return (
    <SocialSignInButton
      imageSource={IC_GITHUB}
      onPress={signIn}
      loading={loading}
      style={css`
        background-color: #f5f5f5;
        border-radius: 3px;
      `}
      styles={{
        text: css`
          color: black;
          font-family: Pretendard-Bold;
          font-size: 14px;
        `,
        image: css`
          width: 16px;
          height: 16px;
        `,
      }}
      text={t('signIn.continueWithProvider', {provider: 'Github'})}
    />
  );
}
export default memo(ButtonSocialSignIn);
