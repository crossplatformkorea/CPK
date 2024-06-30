import {useCallback, useState} from 'react';
import {View} from 'react-native';
import {Typography} from 'dooboo-ui';
import {Stack} from 'expo-router';
import {useRecoilValue} from 'recoil';

import {authRecoilState} from '../../../src/recoil/atoms';
import {supabase} from '../../../src/supabase';

export default function Profile(): JSX.Element {
  const [loading, setLoading] = useState(true);

  return (
    <View>
      <Stack.Screen options={{title: '프로필'}} />
      <Typography.Heading3>프로필</Typography.Heading3>
    </View>
  );
}
