import {useEffect, useState} from 'react';
import {css} from '@emotion/native';
import {Button} from 'dooboo-ui';
import {usePathname, useRouter} from 'expo-router';

import {t} from '../src/STRINGS';
import {showAlert} from '../src/utils/alert';
import CustomLoadingIndicator from '../src/components/uis/CustomLoadingIndicator';

/* 
  For android redirect. This looks like expo router bug.
  issue: https://github.com/expo/router/issues/157
*/
export default function Unmatched(): JSX.Element {
  const [showReload] = useState(false);
  const {replace, canGoBack, back} = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // ios 신규 설치 버그 수정
    // https://github.com/dooboolab/dooboo-task/issues/101
    if (pathname === '/google/link') {
      if (canGoBack()) {
        back();
        return;
      }

      replace('/');

      return;
    }
  }, [back, canGoBack, pathname, replace]);

  return (
    <CustomLoadingIndicator>
      {showReload ? (
        <Button
          borderRadius={28}
          color="light"
          onPress={() => replace('/')}
          style={css`
            margin-top: 14px;
          `}
          styles={{
            text: css`
              font-size: 14px;
              font-family: Pretendard-Bold;
            `,
          }}
          text={t('common.retry')}
          touchableHighlightProps={{
            onLongPress: () => {
              showAlert(pathname);
            },
          }}
          type="outlined"
        />
      ) : null}
    </CustomLoadingIndicator>
  );
}
