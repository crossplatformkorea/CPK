import {Platform, Pressable, View} from 'react-native';
import {Icon, useDooboo} from 'dooboo-ui';
import {Link, Redirect, Tabs, useRouter} from 'expo-router';
import {useRecoilValue} from 'recoil';

import {authRecoilState} from '../../../src/recoil/atoms';
import {t} from '../../../src/STRINGS';
import {useEffect, useRef, useState} from 'react';
import {registerForPushNotificationsAsync} from '../../../src/utils/notifications';
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
  const {authId, user} = useRecoilValue(authRecoilState);
  const [expoPushToken, setExpoPushToken] = useState('');
  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>(
    [],
  );
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);

  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  console.log('expoPushToken', expoPushToken);
  console.log('notification', notification);

  useEffect(() => {
    registerForPushNotificationsAsync().then(
      (token) => token && setExpoPushToken(token),
    );

    if (Platform.OS === 'android') {
      Notifications.getNotificationChannelsAsync().then((value) =>
        setChannels(value ?? []),
      );
    }
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(
          notificationListener.current,
        );

      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

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
