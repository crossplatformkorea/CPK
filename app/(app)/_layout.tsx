import {Stack} from 'expo-router/stack';
import { t } from '../../src/STRINGS';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{headerShown: false, title: t('common.home')}} />
    </Stack>
  );
}
