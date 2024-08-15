import 'dotenv/config';

import type {ConfigContext, ExpoConfig} from '@expo/config';
import withAndroidLocalizedName from '@mmomtchev/expo-android-localized-app-name';
import dotenv from 'dotenv';
import {expand} from 'dotenv-expand';
import path from 'path';

import {version} from './package.json';

// https://github.com/expo/expo/issues/23727#issuecomment-1651609858
if (process.env.STAGE) {
  expand(
    dotenv.config({
      path: path.join(
        __dirname,
        ['./.env', process.env.STAGE].filter(Boolean).join('.'),
      ),
      override: true,
    }),
  );
}

const DEEP_LINK_URL = '[firebaseAppId].web.app';
const buildNumber = 6;

export default ({config}: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Cross-Platform Korea',
  scheme: 'CPK',
  slug: 'cpk',
  privacy: 'public',
  platforms: ['ios', 'android', 'web'],
  version,
  orientation: 'default',
  icon: './assets/icon.png',
  backgroundColor: '#343434',
  plugins: [
    [
      'expo-build-properties',
      {
        // https://github.com/software-mansion/react-native-screens/issues/2219
        ios: {newArchEnabled: true},
        android: {newArchEnabled: true},
      },
    ],
    // @ts-ignore
    withAndroidLocalizedName,
    'expo-router',
    'expo-tracking-transparency',
    'expo-localization',
    [
      'expo-font',
      {
        fonts: [
          'node_modules/dooboo-ui/uis/Icon/doobooui.ttf',
          'node_modules/dooboo-ui/uis/Icon/Pretendard-Bold.otf',
          'node_modules/dooboo-ui/uis/Icon/Pretendard-Regular.otf',
          'node_modules/dooboo-ui/uis/Icon/Pretendard-Thin.otf',
        ],
      },
    ],
    [
      'expo-notifications',
      {
        icon: './assets/notification_icon.png',
        color: '#ffffff',
        defaultChannel: 'default',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  splash: {
    image: './assets/splash.png',
    resizeMode: 'cover',
    backgroundColor: '#343434',
  },
  extra: {
    supabaseUrl: process.env.supabaseUrl,
    supabaseAnonKey: process.env.supabaseAnonKey,
    googleClientIdAndroid: process.env.googleClientIdAndroid,
    googleClientIdIOS: process.env.googleClientIdIOS,
    googleClientIdWeb: process.env.googleClientIdWeb,
    eas: {projectId: 'bc7483f7-8ec6-409e-91a9-62a0f872c28b'},
  },
  updates: {
    fallbackToCacheTimeout: 0,
    // requestHeaders: {'expo-channel-name': 'production'},
    // url: '',
  },
  assetBundlePatterns: ['**/*'],
  userInterfaceStyle: 'automatic',
  locales: {
    ko: './assets/langs/ios/ko.json',
  },
  ios: {
    buildNumber: buildNumber.toString(),
    bundleIdentifier: 'com.dooboolab.cpk',
    associatedDomains: [`applinks:${DEEP_LINK_URL}`],
    supportsTablet: true,
    entitlements: {
      'com.apple.developer.applesignin': ['Default'],
    },
    googleServicesFile: process.env.GOOGLE_SERVICES_IOS,
    infoPlist: {
      LSApplicationQueriesSchemes: ['mailto'],
      CFBundleAllowMixedLocalizations: true,
      CFBundleURLTypes: [
        {
          CFBundleURLSchemes: [
            'com.googleusercontent.apps.407149235586-hnmknj6bpio4asa4ou56tkvtrrtl2d8e',
          ],
        },
      ],
    },
  },
  android: {
    googleServicesFile: process.env.GOOGLE_SERVICES_ANDROID,
    userInterfaceStyle: 'automatic',
    versionCode: buildNumber,
    permissions: [
      'RECEIVE_BOOT_COMPLETED',
      'CAMERA',
      'CAMERA_ROLL',
      'READ_EXTERNAL_STORAGE',
      'WRITE_EXTERNAL_STORAGE',
      'NOTIFICATIONS',
      'USER_FACING_NOTIFICATIONS',
      'SCHEDULE_EXACT_ALARM',
    ],
    adaptiveIcon: {
      foregroundImage: './assets/adaptive_icon.png',
      backgroundColor: '#343434',
    },
    package: 'com.dooboolab.cpk',
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: {
          scheme: 'https',
          host: DEEP_LINK_URL,
          pathPrefix: '/',
        },
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
  },
  description: 'Official Cross-Platform Korea community app',
  web: {bundler: 'metro', favicon: './assets/favicon.png'},
});
