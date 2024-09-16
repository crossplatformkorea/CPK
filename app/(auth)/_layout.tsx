import {Redirect, Stack} from 'expo-router';
import {useRecoilValue} from 'recoil';
import {authRecoilState} from '../../src/recoil/atoms';

export default function AuthLayout() {
  const {authId} = useRecoilValue(authRecoilState);

  if (authId) {
    return <Redirect href={'/'} />;
  }

  return <Stack />;
}
