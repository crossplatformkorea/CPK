import {SafeAreaProvider} from 'react-native-safe-area-context';
import type {ThemeType} from 'dooboo-ui';
import type * as Device from 'expo-device';

import RootProvider from '../src/providers';

type MockContext = {
  themeType?: ThemeType;
  deviceType?: Device.DeviceType;
};

export const createTestElement = (
  child: JSX.Element,
  mockContext?: MockContext,
  themeType?: ThemeType,
): JSX.Element => (
  <RootProvider initialThemeType={themeType}>{child}</RootProvider>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createTestProps = (
  obj?: Record<string, unknown>,
): Record<string, unknown> | unknown | any => ({
  navigation: {
    navigate: jest.fn(),
    goBack: jest.fn(),
  },
  ...obj,
});

/**
 * Create a navigation stub which can be used to mock `useNavigation` hook.
 * Each method can be overriden for each test cases.
 * @example
 * const mockNavigation = createMockNavigation();
 * const mockRoute = {}; // Provide your own route params here.
 * mockNavigation.setParams.mockImplementation(() => {
 *   // Your implementation can go here.
 * });
 * jest.mock('@react-navigation/core', () => ({
 *   ...jest.requireActual<typeof ReactNavigation>('@react-navigation/core'),
 *   useNavigation: () => mockNavigation,
 *   useRoute: () => mockRoute,
 * }));
 * @returns the generated navigation stub.
 */
export function createMockNavigation(): any {
  return {
    getId: jest.fn(),
    addListener: jest.fn(),
    canGoBack: jest.fn(),
    getParent: jest.fn(),
    getState: jest.fn(),
    dispatch: jest.fn(),
    goBack: jest.fn(),
    isFocused: jest.fn(),
    navigate: jest.fn(),
    removeListener: jest.fn(),
    reset: jest.fn(),
    setOptions: jest.fn(),
    setParams: jest.fn(),
    pop: jest.fn(),
    popToTop: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
  };
}

export function TestSafeAreaProvider({
  children,
}: {
  children: JSX.Element;
}): JSX.Element {
  return (
    <SafeAreaProvider
      initialMetrics={{
        frame: {x: 0, y: 0, width: 0, height: 0},
        insets: {top: 0, left: 0, right: 0, bottom: 0},
      }}
    >
      {children}
    </SafeAreaProvider>
  );
}
