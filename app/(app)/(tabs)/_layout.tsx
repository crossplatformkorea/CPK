import {Pressable, View} from 'react-native';
import {Icon, useDooboo} from 'dooboo-ui';
import {Link, Redirect, Tabs, useRouter} from 'expo-router';
import {useRecoilState} from 'recoil';

import {authRecoilState} from '../../../src/recoil/atoms';
import {t} from '../../../src/STRINGS';
import {useEffect, useRef} from 'react';
import * as Notifications from 'expo-notifications';

function SettingsMenu(): JSX.Element {
  const {theme} = useDooboo();
  const {push} = useRouter();

  return (
    <Link asChild href="/settings">
      <Pressable onPress={() => push('/settings')}>
        {({pressed}) => (
          <Icon
            color={theme.text.basic}
            name="List"
            size={22}
            style={{marginRight: 15, opacity: pressed ? 0.5 : 1}}
          />
        )}
      </Pressable>
    </Link>
  );
}

export default function TabLayout(): JSX.Element {
  const {theme} = useDooboo();
  const [{authId, user}, setAuth] = useRecoilState(authRecoilState);
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
        name="profile"
        options={{
          title: t('common.profile'),
          tabBarIcon: ({color}) => <Icon color={color} name="User" size={24} />,
          headerRight: () => <View>{SettingsMenu()}</View>,
        }}
      />
    </Tabs>
  );
}
