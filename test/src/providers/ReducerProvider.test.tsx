import {Button, Text, View} from 'react-native';
import type {RenderAPI} from '@testing-library/react-native';
import {render} from '@testing-library/react-native';

import {
  ReducerProvider,
  useReducerContext,
} from '../../../src/providers/ReducerProvider';

function FakeChild(): JSX.Element {
  const {state, setUser} = useReducerContext();

  return (
    <View>
      <Text testID="TEXT">{JSON.stringify(state, null, 2)}</Text>
      <Button
        onPress={(): void => {
          setUser({
            displayName: 'test',
          });
        }}
        testID="BUTTON"
        title="Button"
      />
    </View>
  );
}

describe('[ReducerProvider] rendering test', () => {
  const component = (
    <ReducerProvider>
      <FakeChild />
    </ReducerProvider>
  );

  const testingLib: RenderAPI = render(component);

  it('renders component with provider', () => {
    const baseElement = testingLib.toJSON();

    expect(baseElement).toBeTruthy();
  });
});

// TODO: add more interaction test, refer to ThemeProvider test
