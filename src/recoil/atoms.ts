import {atom} from 'recoil';

import type {PostWithJoins, User} from '../types';
import {ReportModalProps} from '../components/modals/ReportModal';

export type UserInfo = {
  authId: string | null;
  user: User | null;
  tags: string[];
  blockedUserIds: string[];
  pushToken?: string | null;
};

export const authRecoilState = atom<UserInfo>({
  key: 'authIdState',
  default: {
    authId: null,
    user: null,
    pushToken: null,
    tags: [],
    blockedUserIds: [],
  },
});

/*
 * ReportModal State
 */
export const reportModalRecoilState = atom<ReportModalProps>({
  key: 'reportModalState',
  default: {
    visible: false,
    setVisible: () => {},
  },
});

/*
 * All Posts
 */
export const postsRecoilState = atom<PostWithJoins[]>({
  key: 'postsState',
  default: [],
});
