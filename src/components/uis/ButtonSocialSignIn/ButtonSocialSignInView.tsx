import type {
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import {TouchableOpacity} from 'react-native';
import styled from '@emotion/native';
import {LoadingIndicator, Typography, useDooboo} from 'dooboo-ui';
import {Image} from 'expo-image';

type Props = {
  style?: StyleProp<ViewStyle>;
  leftElement?: JSX.Element;
  imageSource?: ImageSourcePropType;
  text?: string;
  styles?: {
    image?: StyleProp<ImageStyle>;
    text?: StyleProp<TextStyle>;
  };
  onPress?: () => void;
  loading?: boolean;
};

const Container = styled.View`
  padding: 8px 16px;
  height: 40px;

  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 12px;
`;

export default function SocialSignInButton({
  style,
  leftElement,
  imageSource,
  text,
  styles,
  onPress,
  loading,
}: Props): JSX.Element {
  const {theme} = useDooboo();

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <Container style={style}>
        {loading ? (
          <LoadingIndicator size="small" color={theme.text.placeholder} />
        ) : (
          <>
            {leftElement ? (
              leftElement
            ) : imageSource ? (
              <Image source={imageSource} style={styles?.image} />
            ) : null}
            {text ? (
              <Typography.Body2 style={styles?.text}>{text}</Typography.Body2>
            ) : null}
          </>
        )}
      </Container>
    </TouchableOpacity>
  );
}
