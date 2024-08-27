import {create} from 'zustand';
import {immer} from 'zustand/middleware/immer';

import type {User} from '../types';
import { Dispatch, SetStateAction } from 'react';

export type UserInfo = {
  authId: string | null;
  user: User | null;
  tags: string[];
  blockedUserIds: string[];
  pushToken?: string | null;
};

const initialState: UserInfo = {
  authId: null,
  user: null,
  pushToken: null,
  tags: [],
  blockedUserIds: [],
};

export const useAuthStore = create<
  UserInfo & {
    setAuth: Dispatch<SetStateAction<UserInfo>>;
  }
>()(
  immer((set) => ({
    ...initialState,
    setAuth: (info) =>
      set((state) => {
        state.auth = {
          ...state.auth,
          ...info,
        };
      }),
  })),
);
