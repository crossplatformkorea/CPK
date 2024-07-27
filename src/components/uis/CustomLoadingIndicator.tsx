import type {ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import {css} from '@emotion/native';
import {useDooboo} from 'dooboo-ui';

import LottieView from './LottieView';

function CustomLoadingIndicator({
  style,
  children,
}: {
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}): JSX.Element {
  const {theme} = useDooboo();

  return (
    <View
      style={[
        css`
          flex: 1;
          align-self: stretch;
          background-color: ${theme.bg.basic};
          justify-content: center;
          align-items: center;
        `,
        style,
      ]}
    >
      <View
        style={css`
          flex-direction: row;
          width: 60px;
          height: 60px;
          align-self: center;
        `}
      >
        <LottieView
          autoPlay
          speed={2.5}
          style={css`
            flex: 1;
          `}
        />
      </View>
      {children}
    </View>
  );
}

export default CustomLoadingIndicator;
