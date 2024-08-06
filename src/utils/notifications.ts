import {Platform} from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import {t} from '../STRINGS';
import {expoProjectId} from '../../config';

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const {status: existingStatus} = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const {status} = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      throw new Error(t('error.failedToGetPushToken'));
    }

    try {
      if (!expoProjectId) {
        throw new Error(t('error.projectIdNotFound'));
      }

      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: expoProjectId,
        })
      ).data;
    } catch (e) {
      if (__DEV__) token = `${e}`;
    }
  } else {
    if (__DEV__)
      console.error(
        t('error.mustUsePhysicalDeviceForSubject', {
          subject: t('common.pushNotifications'),
        }),
      );
  }

  return token;
}

export async function sendPushNotification(expoPushToken: string) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'Original Title',
    body: 'And here is the body!',
    data: {someData: 'goes here'},
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}
