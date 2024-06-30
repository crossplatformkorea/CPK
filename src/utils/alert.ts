import {Alert, Platform} from 'react-native';

export const showAlert = (
  message: string,
  options?: {
    onPress?: () => void;
    error: Error;
  },
): void => {
  const parsedMessage = !message ? '오류 발생' : message;
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.error(options?.error.message);
  }

  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    alert(parsedMessage);

    return;
  }

  Alert.alert('', parsedMessage, [
    {
      text: '확인',
      onPress: options?.onPress,
    },
  ]);
};

export const showConfirm = async ({
  title,
  description,
}: {
  title: string;
  description: string;
}): Promise<boolean> => {
  if (Platform.OS === 'web') {
    const message = '[ ' + title + ' ]' + '\n\n' + description;
    // eslint-disable-next-line no-alert
    const result = window.confirm(message);

    return result;
  }

  return await new Promise<boolean>((resolve) => {
    Alert.alert(title, description, [
      {
        text: '취소',
        onPress: () => {
          resolve(false);
        },
      },
      {
        text: '확인',
        onPress: () => {
          resolve(true);
        },
      },
    ]);
  });
};
