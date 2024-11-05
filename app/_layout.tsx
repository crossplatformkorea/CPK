import {useEffect, useState} from 'react';
import type {ColorSchemeName} from 'react-native';
import {Platform, useColorScheme, View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {tokenCache} from '../src/utils/cache';
import {
  checkForUpdateAsync,
  fetchUpdateAsync,
  reloadAsync,
  useUpdates,
} from 'expo-updates';

import {dark, light} from '@dooboo-ui/theme';
import {css} from '@emotion/native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDooboo} from 'dooboo-ui';
import StatusBarBrightness from 'dooboo-ui/uis/StatusbarBrightness';
import {Slot} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import {useRecoilState} from 'recoil';

import RootProvider from '../src/providers';
import {authRecoilState, reportModalRecoilState} from '../src/recoil/atoms';
import {AsyncStorageKey} from '../src/utils/constants';
import CustomLoadingIndicator from '../src/components/uis/CustomLoadingIndicator';
import useAppState from '../src/hooks/useAppState';
import {ClerkProvider, ClerkLoaded, useUser, useAuth} from '@clerk/clerk-expo';
import ReportModal from '../src/components/modals/ReportModal';
import {getLocale, t} from '../src/STRINGS';
import {fetchUserProfile} from '../src/apis/profileQueries';
import {fetchBlockUserIds} from '../src/apis/blockQueries';
import {registerForPushNotificationsAsync} from '../src/utils/notifications';
import {fetchAddPushToken} from '../src/apis/pushTokenQueries';
import useSupabase from '../src/hooks/useSupabase';

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

function App(): JSX.Element | null {
  const {user} = useUser();
  const {assetLoaded, snackbar} = useDooboo();
  const {signOut} = useAuth();
  const [, setAuth] = useRecoilState(authRecoilState);
  const [checkEasUpdate, setCheckEasUpdate] = useState(false);
  const {isUpdateAvailable, isUpdatePending} = useUpdates();
  const {supabase} = useSupabase();

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
    if (!supabase) return;

    const checkUser = async (): Promise<void> => {
      try {
        if (!user?.id) return;

        let {data: existingUser} = await supabase
          .from('users')
          .select('id')
          .eq('clerk_id', user.id)
          .single();

        if (!existingUser) {
          const {data} = await supabase
            .from('users')
            .insert({
              clerk_id: user.id,
              provider:
                (user?.externalAccounts?.[0].provider as any) || undefined,
              locale: getLocale(),
              provider_id: user.externalAccounts?.[0].id,
              sub: user.externalAccounts?.[0].providerUserId,
              last_sign_in_at: user.lastSignInAt?.toISOString(),
              full_name: user.fullName,
              name: `${user.firstName} ${user.lastName}`,
              email: user.primaryEmailAddress?.emailAddress,
              email_confirmed_at:
                user.primaryEmailAddress?.verification.status === 'verified'
                  ? user.primaryEmailAddress?.verification.verifiedAtClient
                  : undefined,
              avatar_url: user.imageUrl,
              phone_number: user.primaryPhoneNumber?.phoneNumber,
              phone_verified: !!user.hasVerifiedPhoneNumber,
              // TODO: Remove below fields in database
              // birthday: undefined,
              // confirmed_at: undefined,
              // phone: undefined,
            })
            .single();

          if (data) {
            existingUser = data;
          }
        }

        const {profile, userTags} = await fetchUserProfile({
          clerkId: user.id,
          supabase,
        });

        if (profile) {
          if (profile?.deleted_at) {
            signOut();

            snackbar.open({
              text: t('common.deletedAccount'),
              color: 'danger',
            });

            return;
          }

          const blockedUserIds = await fetchBlockUserIds({
            userId: user.id,
            supabase,
          });

          setAuth({
            authId: profile.id,
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
                  authId: user.id,
                  expoPushToken: token,
                  supabase,
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
      } catch (err) {
        if (__DEV__) {
          console.error(err);
        }
      }
    };

    checkUser();
  }, [setAuth, signOut, snackbar, supabase, user]);

  useEffect(() => {
    if (assetLoaded) {
      SplashScreen?.hideAsync();
    }
  }, [assetLoaded]);

  if (checkEasUpdate) {
    return <CustomLoadingIndicator />;
  }

  return <Slot />;
}

function Layout(): JSX.Element | null {
  const {theme} = useDooboo();
  const [reportModalState, setReportModalState] = useRecoilState(
    reportModalRecoilState,
  );

  return (
    <View
      style={css`
        flex: 1;
        align-self: stretch;
        background-color: ${theme.bg.paper};

        flex-direction: row;
        justify-content: center;
      `}
    >
      <View
        style={css`
          flex: 1;
          max-width: 480px;
          background-color: ${theme.bg.basic};
        `}
      >
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
      </View>
    </View>
  );
}

export default function RootLayout(): JSX.Element | null {
  const colorScheme = useColorScheme();

  const [localThemeType, setLocalThemeType] = useState<string | undefined>(
    undefined,
  );

  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

  if (!publishableKey) {
    throw new Error(
      'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env',
    );
  }

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
      <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
        <ClerkLoaded>
          <RootProvider initialThemeType={localThemeType as ColorSchemeName}>
            <>
              <StatusBarBrightness />
              <Layout />
            </>
          </RootProvider>
        </ClerkLoaded>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}
