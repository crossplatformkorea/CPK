import Constants from 'expo-constants';

const extra = Constants?.expoConfig?.extra;

export const GRAPHQL_URL = extra?.GRAPHQL_URL;
export const ROOT_URL = extra?.ROOT_URL;

export const SUBSCRIPTION_URL = extra?.SUBSCRIPTION_URL;
export const googleClientIdIOS = extra?.googleClientIdIOS;
export const googleClientIdAndroid = extra?.googleClientIdAndroid;
export const googleClientIdWeb = extra?.googleClientIdWeb;
export const facebookAppId = extra?.facebookAppId;
export const expoProjectId = extra?.expoProjectId;
export const firebaseWebApiKey = extra?.firebaseWebApiKey;

export const appVersion = Constants?.expoConfig?.version;
