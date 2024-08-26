import {useEffect, useState} from 'react';
import type {ColorSchemeName} from 'react-native';
import {Platform, useColorScheme} from 'react-native';
import {GestureHandlerRootView, RectButton} from 'react-native-gesture-handler';
import {
  checkForUpdateAsync,
  fetchUpdateAsync,
  reloadAsync,
  useUpdates,
} from 'expo-updates';
import {dark, light} from '@dooboo-ui/theme';
import styled, {css} from '@emotion/native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Icon, useDooboo} from 'dooboo-ui';
import StatusBarBrightness from 'dooboo-ui/uis/StatusbarBrightness';
import {Stack, useRouter} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import {useRecoilState} from 'recoil';

import RootProvider from '../src/providers';
import {authRecoilState, reportModalRecoilState} from '../src/recoil/atoms';
import {getLocale, t} from '../src/STRINGS';
import {supabase} from '../src/supabase';
import {
  AsyncStorageKey,
  COMPONENT_WIDTH,
  WEB_URL,
} from '../src/utils/constants';
import ReportModal from '../src/components/modals/ReportModal';
import {fetchBlockUserIds} from '../src/apis/blockQueries';
import {AuthChangeEvent} from '@supabase/supabase-js';
import CustomLoadingIndicator from '../src/components/uis/CustomLoadingIndicator';
import {fetchUserProfile} from '../src/apis/profileQueries';
import {registerForPushNotificationsAsync} from '../src/utils/notifications';
import {fetchAddPushToken} from '../src/apis/pushTokenQueries';
import useAppState from '../src/hooks/useAppState';

SplashScreen.preventAutoHideAsync();

const Container = styled.View`
  flex: 1;
  align-self: stretch;
  background-color: ${({theme}) => theme.brand};
`;

const Content = styled.View`
  align-self: center;
  width: 100%;
  flex: 1;
  max-width: ${COMPONENT_WIDTH + 'px'};
  background-color: ${({theme}) => theme.brand};
`;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

function App(): JSX.Element | null {
  const {assetLoaded, snackbar, theme} = useDooboo();
  const {back, replace} = useRouter();
  const [{authId}, setAuth] = useRecoilState(authRecoilState);
  const [initialRouteName, setInitialRouteName] = useState<string>();
  const [checkEasUpdate, setCheckEasUpdate] = useState(false);
  const {isUpdateAvailable, isUpdatePending} = useUpdates();

  useEffect(() => {
    if (isUpdatePending) {
      reloadAsync();
    }
  }, [isUpdatePending]);

  useAppState((state) => {
    if (state === 'active') {
      /* check eas updates */
      const checkUpdate = async (): Promise<void> => {
        if (Platform.OS === 'web' || __DEV__) {
          return;
        }

        await checkForUpdateAsync();

        try {
          if (isUpdateAvailable) {
            setCheckEasUpdate(true);
            await fetchUpdateAsync();
          }
        } catch (e) {
          if (__DEV__) {
            console.error(e);
          }
        } finally {
          setCheckEasUpdate(false);
        }
      };

      checkUpdate();

      return;
    }
  });

  useEffect(() => {
    const {data} = supabase.auth.onAuthStateChange(async (evt, session) => {
      if (
        !(
          ['INITIAL_SESSION', 'SIGNED_IN', 'SIGNED_OUT'] as AuthChangeEvent[]
        ).includes(evt)
      ) {
        return;
      }

      if (session?.user) {
        const {data: existingUser} = await supabase
          .from('users')
          .select('id')
          .eq('id', session.user.id)
          .single();

        if (!existingUser) {
          const {status} = await supabase
            .from('users')
            .upsert({
              id: session.user.id,
              // AuthType
              provider: session.user.app_metadata.provider as any,
              locale: getLocale(),
              provider_id: session.user.app_metadata.provider_id,
              last_sign_in_at: session.user.app_metadata.last_sign_in_at,
              full_name: session.user.user_metadata.full_name,
              name: session.user.user_metadata.name,
              sub: session.user.user_metadata.sub,
              email: session.user.email,
              email_confirmed_at: session.user.email_confirmed_at,
              birthday: session.user.user_metadata.birthday,
              confirmed_at: session.user.user_metadata.confirmed_at,
              avatar_url: session.user.user_metadata.avatar_url,
              description: session.user.user_metadata.description,
              phone_number: session.user.user_metadata.phone_number,
              phone: session.user.user_metadata.phone,
              phone_verified: session.user.user_metadata.phone_verified,
            })
            .single();

          if (status !== 201 && status !== 200) {
            await supabase.auth.signOut();

            return;
          }
        }

        const {profile, userTags} = await fetchUserProfile(session.user.id);

        if (profile) {
          if (profile?.deleted_at) {
            await supabase.auth.signOut();
            snackbar.open({
              text: t('common.deletedAccount'),
              color: 'danger',
            });

            return;
          }

          const blockedUserIds = await fetchBlockUserIds(session.user.id);

          setAuth({
            authId: session.user.id,
            user: profile,
            blockedUserIds,
            tags: userTags,
          });

          registerForPushNotificationsAsync()
            .then((token) => {
              if (token) {
                setAuth((prev) => ({
                  ...prev,
                  pushToken: token,
                }));

                fetchAddPushToken({
                  authId: session.user.id,
                  expoPushToken: token,
                });
              }

              return;
            })
            .catch((err) => {
              if (__DEV__) {
                console.error(err);
              }
            });
        }

        return;
      }

      setAuth({
        authId: null,
        user: null,
        blockedUserIds: [],
        pushToken: null,
        tags: [],
      });
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [setAuth, snackbar]);

  useEffect(() => {
    if (assetLoaded) {
      // Adhoc: Set a timeout to hide the splash screen
      // Wait for 2 seconds because supabase takes time to initialize
      const timeout = setTimeout(() => {
        SplashScreen.hideAsync();
        setInitialRouteName(authId ? '/' : 'sign-in');

        if (timeout) {
          clearTimeout(timeout);
        }
      }, 2000);
    }
  }, [assetLoaded, authId]);

  if (!initialRouteName || checkEasUpdate) {
    return <CustomLoadingIndicator />;
  }

  return (
    <Container>
      <Content>
        <Stack
          initialRouteName={initialRouteName}
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
                          padding: 8px;
                          border-radius: 48px;
                        `
                      : css`
                          padding: 8px;
                          border-radius: 48px;
                          margin-left: -8px;
                        `
                  }
                >
                  <Icon name="CaretLeft" size={24} />
                </RectButton>
              ),
          }}
        >
          <Stack.Screen name="(app)/(tabs)" options={{headerShown: false}} />
          {/* Note: Only modals are written here.  */}
        </Stack>
      </Content>
    </Container>
  );
}

function Layout(): JSX.Element | null {
  const [reportModalState, setReportModalState] = useRecoilState(
    reportModalRecoilState,
  );

  return (
    <>
      <App />
      <ReportModal
        {...reportModalState}
        setVisible={(value) => {
          setReportModalState({
            ...reportModalState,
            // @ts-ignore
            visible: value,
          });
        }}
      />
    </>
  );
}

export default function RootLayout(): JSX.Element | null {
  const colorScheme = useColorScheme();

  const [localThemeType, setLocalThemeType] = useState<string | undefined>(
    undefined,
  );

  useEffect(() => {
    const initializeThemeType = async (): Promise<void> => {
      const darkMode = await AsyncStorage.getItem(AsyncStorageKey.DarkMode);

      const isDarkMode = !darkMode
        ? colorScheme === 'dark'
        : darkMode === 'true';

      SystemUI.setBackgroundColorAsync(
        isDarkMode ? dark.bg.basic : light.bg.basic,
      );

      setLocalThemeType(isDarkMode ? 'dark' : 'light');
    };

    initializeThemeType();
  }, [colorScheme]);

  if (!localThemeType) {
    return null;
  }

  return (
    <GestureHandlerRootView
      style={css`
        flex: 1;
      `}
    >
      <RootProvider initialThemeType={localThemeType as ColorSchemeName}>
        <>
          <StatusBarBrightness />
          <Layout />
        </>
      </RootProvider>
    </GestureHandlerRootView>
  );
}
