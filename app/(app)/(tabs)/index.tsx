import styled, {css} from '@emotion/native';
import {Fab, Typography} from 'dooboo-ui';
import StatusBarBrightness from 'dooboo-ui/uis/StatusbarBrightness';
import {Stack} from 'expo-router';

const Container = styled.View`
  flex: 1;
  align-self: stretch;
  background-color: ${({theme}) => theme.bg.basic};
`;

export default function Community(): JSX.Element {
  return (
    <Container>
      <StatusBarBrightness />
      <Typography.Heading3>커뮤니티</Typography.Heading3>
      <Fab
        animationDuration={300}
        fabIcon="Plus"
        onPressFab={() => {
          console.log('onPressFab');
        }}
        style={css`
          bottom: 16px;
        `}
      />
    </Container>
  );
}
