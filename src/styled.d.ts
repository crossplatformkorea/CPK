import '@emotion/react';
import type {DoobooTheme as DoobooUiTheme} from '@dooboo-ui/theme';
import type {CustomAppTheme} from './theme';
import {CSSObject} from '@emotion/react';
import {StyleProp, ViewStyle} from 'react-native';

type AllTheme = CustomAppTheme & DoobooUiTheme;

declare module '@emotion/react' {
  export interface Theme extends AllTheme {}
}

declare module 'dooboo-ui' {
  export interface DoobooUiTheme extends AllTheme {}
}

declare module '@emotion/native' {
  // Overload for ViewStyle
  export function css(
    ...args: Array<CSSObject | StyleProp<ViewStyle>>
  ): ReturnType<typeof css>;

  // Overload for TextStyle
  export function css(
    ...args: Array<CSSObject | StyleProp<TextStyle>>
  ): ReturnType<typeof css>;

  // Overload for ImageStyle
  export function css(
    ...args: Array<CSSObject | StyleProp<ImageStyle>>
  ): ReturnType<typeof css>;
}
