import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import {css} from '@emotion/native';
import {t} from '../../STRINGS';
import SvgMask from '../svgs/SvgMask';
import {Typography, useCPK} from 'cpk-ui';

export default function NotFound({
  text,
  style,
}: {
  text?: string | JSX.Element;
  style?: StyleProp<ViewStyle>;
}): JSX.Element {
  const {theme} = useCPK();

  return (
    <View
      style={[
        css`
          padding: 24px 24px 0 24px;
          justify-content: center;
          align-items: center;
          gap: 8px;
        `,
        style,
      ]}
    >
      <SvgMask />
      {!text || typeof text === 'string' ? (
        <Typography.Body3
          style={css`
            font-family: Pretendard-Bold;
            color: ${theme.text.disabled};
          `}
        >
          {text || t('common.notFoundData')}
        </Typography.Body3>
      ) : (
        text
      )}
    </View>
  );
}
