import {atom} from 'recoil';

import type {User} from '../types/supabase';

export type UserInfo = {
  authId: string | null;
  user: User | null;
};

export const authRecoilState = atom<UserInfo>({
  key: 'authIdState',
  default: {
    authId: null,
    user: null,
  },
});
