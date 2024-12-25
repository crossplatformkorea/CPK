import ErrorBoundary from 'react-native-error-boundary';
import {ActionSheetProvider} from '@expo/react-native-action-sheet';
import {RecoilRoot} from 'recoil';

import {theme} from '../theme';
import {handleErrorConsole} from '../utils/error';
import {AppLogicProvider} from './AppLogicProvider';
import {DarkTheme, DefaultTheme, ThemeProvider} from '@react-navigation/native';
import FallbackComponent from '../components/uis/FallbackComponent';
import {CpkProvider, ThemeType} from 'cpk-ui';

interface Props {
  initialThemeType?: ThemeType;
  children?: JSX.Element;
}

function RootProvider({initialThemeType, children}: Props): JSX.Element {
  return (
    <RecoilRoot>
      <CpkProvider
        themeConfig={{
          initialThemeType: initialThemeType ?? undefined,
          customTheme: theme,
        }}
      >
        <ThemeProvider
          //? 여긴 어차피 동적으로 바뀌지 않으니 초기값만 설정해줍니다.
          // 아래 `value`는 static하게 색상 값이 주입됩니다.
          value={initialThemeType === 'dark' ? DarkTheme : DefaultTheme}
        >
          <ErrorBoundary
            FallbackComponent={FallbackComponent}
            onError={handleErrorConsole}
          >
            <ActionSheetProvider>
              <AppLogicProvider>{children}</AppLogicProvider>
            </ActionSheetProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </CpkProvider>
    </RecoilRoot>
  );
}

export default RootProvider;
