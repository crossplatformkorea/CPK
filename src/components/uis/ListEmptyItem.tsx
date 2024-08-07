import type {ViewStyle} from 'react-native';
import styled, {css} from '@emotion/native';
import {Icon, useDooboo} from 'dooboo-ui';

const Container = styled.View`
  align-items: center;
  justify-content: center;
`;

export default function ListEmptyItem({style}: {style?: ViewStyle}): JSX.Element {
  const {theme} = useDooboo();

  return (
    <Container
      style={[
        css`
          padding: 24px;
        `,
        style,
      ]}
    >
      <Icon color={theme.text.disabled} name="QuestBoxFill" size={14} />
    </Container>
  );
}

