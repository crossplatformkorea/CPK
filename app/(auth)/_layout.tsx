import {Stack} from 'expo-router/stack';
import {useDooboo} from 'dooboo-ui';
import {Redirect} from 'expo-router';
import {useAuth} from '@clerk/clerk-expo';

export default function AuthLayout() {
  const {theme} = useDooboo();
  const {isSignedIn} = useAuth();

  if (isSignedIn) {
    return <Redirect href={'/(tabs)'} />;
  }

  return (
    <Stack
      initialRouteName="intro"
      screenOptions={{
        headerStyle: {backgroundColor: theme.bg.basic},
        headerTintColor: theme.text.label,
        headerTitleStyle: {
          fontWeight: 'bold',
          color: theme.text.basic,
        },
      }}
    />
  );
}
