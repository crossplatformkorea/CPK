import {type ReactNode, useRef} from 'react';
import type {ScrollViewProps, StyleProp, ViewStyle} from 'react-native';
import {Platform, ScrollView} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {css} from '@emotion/native';
import {MAX_WIDTH} from '../../utils/constants';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  bounces?: boolean;
  shouldScrollToEndOnContentSizeChange?: boolean;
  scrollViewProps?: Omit<
    ScrollViewProps,
    | 'showsVerticalScrollIndicator'
    | 'style'
    | 'contentContainerStyle'
    | 'bounces'
  >;
};

export default function CustomScrollView({
  children,
  style,
  contentContainerStyle,
  bounces,
  scrollViewProps,
  shouldScrollToEndOnContentSizeChange = false,
}: Props): JSX.Element {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  return (
    <ScrollView
      {...scrollViewProps}
      bounces={bounces}
      contentContainerStyle={[
        css`
          padding-left: ${Math.max(insets.left) + 'px'};
          padding-right: ${Math.max(insets.right) + 'px'};
        `,
        contentContainerStyle,
      ]}
      onContentSizeChange={() => {
        if (shouldScrollToEndOnContentSizeChange) {
          scrollViewRef?.current?.scrollToEnd({animated: true});
        }
      }}
      ref={scrollViewRef}
      showsVerticalScrollIndicator={Platform.OS === 'web'}
      style={[
        css`
          width: 100%;
          max-width: ${MAX_WIDTH};
          align-self: center;
        `,
        style,
      ]}
    >
      {children}
    </ScrollView>
  );
}
