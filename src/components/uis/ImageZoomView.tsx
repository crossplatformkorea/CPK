import {Image, Platform} from 'react-native';
import type {ImageZoomProps} from '@likashefqet/react-native-image-zoom';
import {ImageZoom} from '@likashefqet/react-native-image-zoom';

export default function ImageZoomView(props: ImageZoomProps): JSX.Element {
  if (Platform.OS === 'web') {
    return <Image {...props} />;
  }

  return <ImageZoom {...props} />;
}
