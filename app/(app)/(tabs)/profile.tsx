import {useCallback, useState} from 'react';
import {View} from 'react-native';
import {Typography} from 'dooboo-ui';
import {Stack} from 'expo-router';
import {useRecoilValue} from 'recoil';

import {authRecoilState} from '../../../src/recoil/atoms';
import {t} from '../../../src/STRINGS';
import {supabase} from '../../../src/supabase';

export default function Profile(): JSX.Element {
  const [loading, setLoading] = useState(true);

  return (
    <View>
      <Stack.Screen options={{title: t('common.profile')}} />
      <Typography.Heading3>{t('common.profile')}</Typography.Heading3>
    </View>
  );
}
