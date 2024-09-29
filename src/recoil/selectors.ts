import {selector} from 'recoil';
import {authRecoilState, UserInfo} from './atoms';

export const authRecoilSelector = selector<UserInfo>({
  key: 'authRecoilSelector',
  get: ({get}) => {
    const state = get(authRecoilState);

    if (state.user?.avatar_url) {
      return {
        ...state,
        user: {
          ...state.user,
          avatar_url: `${state.user.avatar_url}?${new Date().toISOString()}`,
        },
      };
    }
    return state;
  },
  set: ({set, get}, newValue) => {
    const newUserInfo = newValue as UserInfo;

    if (newUserInfo.user?.avatar_url) {
      newUserInfo.user.avatar_url = `${newUserInfo.user.avatar_url}?${new Date().toISOString()}`;
    }
    set(authRecoilState, newUserInfo);
  },
});
