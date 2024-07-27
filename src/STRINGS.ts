import type {ComponentProps} from 'react';
import type {Icon} from 'dooboo-ui';
import * as Localization from 'expo-localization';

import en from '../assets/langs/en.json';
import ko from '../assets/langs/ko.json';

// import {I18n} from 'i18n-js';
// ad-hoc: https://github.com/fnando/i18n/issues/26#issuecomment-1225775247
const {I18n} = require('i18n-js/dist/require/index');
const i18n = new I18n({en, ko});

i18n.defaultLocale = 'en';
i18n.enableFallback = true;
i18n.locale = Localization.locale;

export const getLocale = (): string => (i18n.locale === 'ko-US' ? 'ko' : 'en');

export const capitalize = (
  str: string,
): ComponentProps<typeof Icon>['name'] => {
  return (str.charAt(0).toUpperCase() + str.slice(1)) as ComponentProps<
    typeof Icon
  >['name'];
};

type NestedKeys<T> = T extends object
  ? {
      [K in keyof T]: K extends string | number
        ? `${K}` | (T[K] extends object ? `${K}.${NestedKeys<T[K]>}` : never)
        : never;
    }[keyof T]
  : '';

export const t = (param: NestedKeys<typeof en>, mapObj?: object): string => {
  if (mapObj) {
    return i18n.t(param, mapObj);
  }

  return i18n.t(param);
};
