import {Pressable, View} from 'react-native';
import {Icon, useDooboo} from 'dooboo-ui';
import {Link, Redirect, Tabs, useRouter} from 'expo-router';
import {useRecoilValue} from 'recoil';

import {authRecoilState} from '../../../src/recoil/atoms';

function SettingsMenu(): JSX.Element {
  const {theme} = useDooboo();
  const {push} = useRouter();

  return (
    <Link asChild href="/settings">
      <Pressable onPress={() => push('settings')}>
        {({pressed}) => (
          <Icon
            color={theme.text.basic}
            name="List"
            size={22}
            style={{marginRight: 15, opacity: pressed ? 0.5 : 1}}
          />
        )}
      </Pressable>
    </Link>
  );
}

export default function TabLayout(): JSX.Element {
  const {theme} = useDooboo();
  const {authId} = useRecoilValue(authRecoilState);

  if (!authId) {
    return <Redirect href="sign-in" />;
  }

  if (!authId) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.role.primary,
        headerStyle: {backgroundColor: theme.bg.basic},
        headerTitleStyle: {color: theme.text.basic},
        tabBarStyle: {backgroundColor: theme.bg.basic},
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '커뮤니티',
          tabBarIcon: ({color}) => (
            <Icon color={color} name="Article" size={24} />
          ),
          headerRight: () => <View>{SettingsMenu()}</View>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '프로필',
          tabBarIcon: ({color}) => <Icon color={color} name="User" size={24} />,
          headerRight: () => <View>{SettingsMenu()}</View>,
        }}
      />
    </Tabs>
  );
}
