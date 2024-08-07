import type {StyleProp, ViewStyle} from 'react-native';
import styled, {css} from '@emotion/native';
import {Image} from 'expo-image';
import {IC_ICON} from '../../icons';

const Container = styled.View`
  border: 0.3px solid ${({theme}) => theme.role.border};
  background-color: ${({theme}) => theme.bg.basic};

  justify-content: center;
  align-items: center;
`;

export default function UserImage({
  imageUrl,
  style,
  width = 24,
  height = 24,
}: {
  width?: number;
  height?: number;
  imageUrl?: string | undefined | null;
  style?: StyleProp<ViewStyle>;
}): JSX.Element {
  return (
    <Container
      style={[
        css`
          width: ${width + 'px'};
          height: ${height + 'px'};
          border-radius: ${width / 2 + 'px'};
        `,
        style,
      ]}
    >
      <Image
        source={imageUrl ? {uri: imageUrl} : IC_ICON}
        style={css`
          width: ${width + 'px'};
          height: ${height + 'px'};
          border-radius: ${width / 2 + 'px'};
          opacity: ${imageUrl ? '1' : '0.7'};
        `}
      />
    </Container>
  );
}
