import type {StyleProp, ViewStyle} from 'react-native';
import styled, {css} from '@emotion/native';
import {Icon, useDooboo} from 'dooboo-ui';
import {Image} from 'expo-image';

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
  const {theme} = useDooboo();

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
      {imageUrl ? (
        <Image
          source={{uri: imageUrl}}
          style={css`
            width: ${width + 'px'};
            height: ${height + 'px'};
            border-radius: ${width / 2 + 'px'};
          `}
        />
      ) : (
        <Icon color={theme.role.border} name="QuestBoxFill" size={width / 2} />
      )}
    </Container>
  );
}
