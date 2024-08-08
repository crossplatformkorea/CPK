import {t} from '../STRINGS';
import {DoobooGithubStats} from '../types/github-stats';

const API_ENDPOINT = 'https://stats.dooboo.io/api/github-stats';

export const updateDoobooGithub = async (
  login: string,
): Promise<{stats: DoobooGithubStats} | undefined> => {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({login}),
    });

    if (!response.ok) {
      throw new Error('HTTP error! status:' + response.status);
    }

    return await response.json();
  } catch (error) {
    if (__DEV__) console.error('Error fetching data:', error);
    throw new Error(t('error.failedToFetchData'));
  }
};
