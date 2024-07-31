import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import {css} from '@emotion/native';
import {Typography, useDooboo} from 'dooboo-ui';
import { t } from '../../STRINGS';


export default function NotFound({
  text,
  style,
}: {
  text?: string | JSX.Element;
  style?: StyleProp<ViewStyle>;
}): JSX.Element {
  const {theme} = useDooboo();

  return (
    <View
      style={[
        css`
          justify-content: center;
          align-items: center;
          padding: 24px 24px 0 24px;
        `,
        style,
      ]}
    >
      {!text || typeof text === 'string' ? (
        <Typography.Body3
          style={css`
            font-family: Pretendard-Bold;
            color: ${theme.text.disabled};
          `}
        >
          {text || t('common.notFound')}
        </Typography.Body3>
      ) : (
        text
      )}
    </View>
  );
}
