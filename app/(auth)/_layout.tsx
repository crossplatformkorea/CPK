import {Stack} from 'expo-router/stack';
import {Redirect} from 'expo-router';
import {useAuth} from '@clerk/clerk-expo';
import {useCPK} from 'cpk-ui';

export default function AuthLayout() {
  const {theme} = useCPK();
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
