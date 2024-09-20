import Constants from 'expo-constants';

const extra = Constants?.expoConfig?.extra;

export const expoProjectId = extra?.eas?.projectId;
