import {Linking, Platform} from 'react-native';

export const openURL = async (url: string): Promise<void> => {
  const supported = await Linking.canOpenURL(url);

  if (supported) {
    await Linking.openURL(url);
  }

  if (Platform.OS === 'web') {
    window.open(url, '_blank');
  }
};

export const validateEmail = (email: string): boolean => {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  return re.test(email);
};


export const goToAppStore = (): void => {
  if (Platform.OS === 'ios') {
    Linking.openURL(
      'itms-apps://itunes.apple.com/us/app/apple-store/<cpk-id>',
    );
  } else {
    Linking.openURL('market://details?id=com.dooboolab.cpk');
  }
};
