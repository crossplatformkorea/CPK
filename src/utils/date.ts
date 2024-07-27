import {formatDistance} from 'date-fns';
import {enUS, ko} from 'date-fns/locale';

import {getLocale} from '../STRINGS';

export const formatDateTime = (date: string): string => {
  if (!date) {
    return '';
  }

  return formatDistance(new Date(date), Date.now(), {
    locale: getLocale() === 'ko' ? ko : enUS,
    addSuffix: true,
  });
};
