import { Platform } from 'react-native';
import {DoobooGithubStats, Stats} from '../types/github-stats';

export const LIST_CNT = 10;

export const AsyncStorageKey = {
  Token: 'token',
  DarkMode: 'dark-mode',
};

export const delayPressIn = 200;
export const WEB_URL = 'https://forums.crossplatformkorea.com';
export const COMPONENT_WIDTH = 500;
export const PAGE_SIZE = 10;
export const HEADER_HEIGHT = 56;
export const MAX_IMAGES_UPLOAD_LENGTH = 5;
export const MAX_WIDTH = 1000;
export const EMAIL_ADDRESS = 'crossplatformkorea@gmail.com';
export const TITLE_MAX_LENGTH = Platform.OS === 'web' ? 52 : 29;

export const initStats: Stats = {
  name: '',
  description: '',
  score: 0.0,
  statElements: [],
  icon: '',
  id: '',
};

export const DEFAULT_GITHUB_STATS: DoobooGithubStats = {
  json: {
    login: '',
  },
  pluginStats: {
    earth: initStats,
    fire: initStats,
    gold: initStats,
    people: initStats,
    tree: initStats,
    water: initStats,
    dooboo: initStats,
  },
  plugin: {
    name: 'dooboo-github',
    apiURL: '',
  },
};
