import {atom} from 'recoil';

export const authRecoilState = atom<string | null>({
  key: 'authIdState',
  default: null,
});
