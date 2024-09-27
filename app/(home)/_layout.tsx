import {Stack} from 'expo-router/stack';
import {t} from '../../src/STRINGS';
import {Icon, useDooboo} from 'dooboo-ui';
import {RectButton} from 'react-native-gesture-handler';
import {Redirect, useRouter} from 'expo-router';
import {Platform} from 'react-native';
import {WEB_URL} from '../../src/utils/constants';
import {css} from '@emotion/native';
import {useAuth} from '@clerk/clerk-expo';

export default function HomeLayout() {
  const {theme} = useDooboo();
  const {back, replace} = useRouter();
  const {isSignedIn} = useAuth();

  if (!isSignedIn) {
    return <Redirect href={'/intro'} />;
  }

  return (
    <Stack
      initialRouteName={'(tabs)'}
      screenOptions={{
        headerStyle: {backgroundColor: theme.bg.basic},
        headerTintColor: theme.text.label,
        headerTitleStyle: {
          fontWeight: 'bold',
          color: theme.text.basic,
        },
        headerLeft: ({canGoBack}) =>
          canGoBack && (
            <RectButton
              hitSlop={{top: 8, left: 8, right: 8, bottom: 8}}
              onPress={() =>
                canGoBack
                  ? back()
                  : Platform.OS === 'web'
                    ? (window.location.href = WEB_URL)
                    : replace('/')
              }
              style={
                Platform.OS === 'web'
                  ? css`
                      border-radius: 48px;
                    `
                  : css`
                      border-radius: 48px;
                      margin-left: -8px;
                      margin-top: 4px;
                    `
              }
            >
              <Icon name="CaretLeft" size={24} />
            </RectButton>
          ),
      }}
    >
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
          title: t('common.home'),
        }}
      />
    </Stack>
  );
}
