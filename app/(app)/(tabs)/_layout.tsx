import {View} from 'react-native';
import {Icon, useDooboo} from 'dooboo-ui';
import {Redirect, Tabs, useRouter} from 'expo-router';

import {t} from '../../../src/STRINGS';
import {useEffect, useRef} from 'react';
import * as Notifications from 'expo-notifications';
import {RectButton} from 'react-native-gesture-handler';
import {css} from '@emotion/native';
import {Image} from 'expo-image';
import {IC_ICON} from '../../../src/icons';
import {useAuthStore} from '../../../src/stores/authStore';

function SettingsMenu(): JSX.Element {
  const {theme} = useDooboo();
  const {push} = useRouter();

  return (
    <RectButton
      onPress={() => push('/settings')}
      style={css`
        align-items: center;
        justify-content: center;
        padding: 8px;
        border-radius: 99px;
        margin-right: 4px;
      `}
    >
      <Icon color={theme.text.basic} name="List" size={22} />
    </RectButton>
  );
}

export default function TabLayout(): JSX.Element {
  const {theme} = useDooboo();
  const {authId, user, setAuth} = useAuthStore();
  const notificationResponseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    if (!authId) return;
    notificationResponseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(JSON.stringify(response.notification.request));
      });

    return () => {
      notificationResponseListener.current &&
        Notifications.removeNotificationSubscription(
          notificationResponseListener.current,
        );
    };
  }, [authId, setAuth]);

  if (!authId) {
    return <Redirect href="/sign-in" />;
  }

  if (!user?.display_name) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.role.primary,
        headerStyle: {backgroundColor: theme.bg.basic},
        headerTitleStyle: {color: theme.text.basic},
        tabBarStyle: {backgroundColor: theme.bg.basic},
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('common.community'),
          tabBarIcon: ({color}) => (
            <Icon color={color} name="Article" size={24} />
          ),
          headerRight: () => <View>{SettingsMenu()}</View>,
        }}
      />
      <Tabs.Screen
        name="my"
        options={{
          title: t('common.my'),
          tabBarIcon: ({focused}) => (
            <View
              style={css`
                width: 24px;
                height: 24px;
                border-radius: 12px;
                background-color: ${theme.bg.paper};
                overflow: hidden;
              `}
            >
              <Image
                source={user?.avatar_url ? {uri: user.avatar_url} : IC_ICON}
                style={css`
                  width: 24px;
                  height: 24px;
                  opacity: ${focused ? '1' : '0.5'};
                `}
              />
            </View>
          ),
          headerRight: () => <View>{SettingsMenu()}</View>,
        }}
      />
    </Tabs>
  );
}
