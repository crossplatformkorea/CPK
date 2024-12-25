import type {ReactNode} from 'react';
import type {ViewStyle} from 'react-native';
import {Platform} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled, {css} from '@emotion/native';
import {useCPK} from 'cpk-ui';

const Container = styled.View`
  flex: 1;
  align-self: stretch;
  background-color: ${({theme}) => theme.bg.paper};
  justify-content: center;

  flex-direction: row;
`;

const Content = styled.View`
  background-color: ${({theme}) => theme.bg.paper};
  flex: 1;
`;

export default function Wrapper({
  style,
  children,
}: {
  style?: ViewStyle;
  children: ReactNode;
}): JSX.Element {
  const {left, right} = useSafeAreaInsets();
  const {theme} = useCPK();

  return (
    <Container
      style={[
        css`
          background-color: ${theme.bg.paper};
        `,
        Platform.OS !== 'web' &&
          css`
            padding-right: ${left + 'px'};
            padding-right: ${right + 'px'};
          `,
        style,
      ]}
    >
      <Content
        style={css`
          flex: 1;
          background-color: ${theme.bg.basic};
        `}
      >
        {children}
      </Content>
    </Container>
  );
}
