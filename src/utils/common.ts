import {Linking, Platform} from 'react-native';
import * as VideoThumbnails from 'expo-video-thumbnails';
import {ImagePickerAsset} from 'expo-image-picker';
import {getDeviceTypeSync} from 'react-native-device-info';
import {EMAIL_ADDRESS} from './constants';
import {t} from '../STRINGS';
import {showAlert} from './alert';

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

export const openEmail = () => {
  const email = EMAIL_ADDRESS;
  const url = `mailto:${email}`;

  Linking.canOpenURL(url)
    .then((supported) => {
      if (!supported) {
        showAlert(t('error.unableToOpenEmailClient'));
      } else {
        return Linking.openURL(url);
      }
    })
    .catch((err) => {
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.error('An error occurred', err);
      }

      showAlert(t('error.unableToOpenEmailClient'));
    });
};

export const goToAppStore = (): void => {
  if (Platform.OS === 'ios') {
    Linking.openURL('itms-apps://itunes.apple.com/us/app/apple-store/<cpk-id>');
  } else {
    Linking.openURL('market://details?id=com.dooboolab.cpk');
  }
};

export const generateThumbnailFromVideo = async (
  videoUri: string,
  time?: number,
): Promise<string | undefined> => {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    const {uri} = await VideoThumbnails.getThumbnailAsync(videoUri, {
      time: time || 300,
    });

    return uri;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('error', error);
  }
};

export function getUniqueElements<T>(arr1: T[], arr2: T[]): T[] {
  const uniqueElements: T[] = [];

  arr1.forEach((element: T) => {
    if (!arr2.includes(element)) {
      uniqueElements.push(element);
    }
  });

  arr2.forEach((element: T) => {
    if (!arr1.includes(element)) {
      uniqueElements.push(element);
    }
  });

  return uniqueElements;
}

export const filterUploadableAssets = (
  assets: ImagePickerAsset[],
): ImagePickerAsset[] => {
  const isImageHttp = (url: string): boolean => {
    return url.includes('http://') || url.includes('https://');
  };

  return assets.filter((asset) => {
    return !asset.uri || !isImageHttp(asset.uri);
  });
};

export const isDesktopDevice = (): boolean =>
  getDeviceTypeSync() === 'Desktop' ||
  Platform.OS === 'web' ||
  Platform.OS === 'macos' ||
  Platform.OS === 'windows';

export function removeLeadingAt(str: string): string {
  if (str.startsWith('@')) {
    return str.substring(1);
  }

  return str;
}
