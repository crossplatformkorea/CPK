import {atom} from 'recoil';

import type {User} from '../types';
import { ReportModalProps } from '../components/modals/ReportModal';

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
