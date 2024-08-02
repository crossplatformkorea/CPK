import {Button, View} from 'react-native';
import type {RenderAPI} from '@testing-library/react-native';
import {render} from '@testing-library/react-native';

import {
  AppLogicProvider,
  useAppLogic,
} from '../../../src/providers/AppLogicProvider';
import RootProvider from '../../../src/providers';

function FakeChild(): JSX.Element {
  const {setServerVersion} = useAppLogic();

  return (
    <View>
      <Button
        onPress={() => setServerVersion('1.0.0')}
        testID="BUTTON"
        title="Button"
      />
    </View>
  );
}

describe('Rendering', () => {
  const component = (
    <RootProvider>
      <AppLogicProvider>
        <FakeChild />
      </AppLogicProvider>
    </RootProvider>
  );

  const testingLib: RenderAPI = render(component);

  it('renders component with provider', () => {
    const baseElement = testingLib.toJSON();

    expect(baseElement).toBeTruthy();
  });
});
