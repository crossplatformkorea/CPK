import type {
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import {Image} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import styled from '@emotion/native';
import {Typography} from 'dooboo-ui';

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
};

const Container = styled.View`
  padding: 8px 16px;

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
}: Props): JSX.Element {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <Container style={style}>
        {leftElement ? (
          leftElement
        ) : imageSource ? (
          <Image source={imageSource} style={styles?.image} />
        ) : null}
        {text ? (
          <Typography.Body2 style={styles?.text}>{text}</Typography.Body2>
        ) : null}
      </Container>
    </TouchableOpacity>
  );
}
