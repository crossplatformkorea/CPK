import {DevSettings, Platform} from 'react-native';
import styled, {css} from '@emotion/native';
import {Button, Typography, useDooboo} from 'dooboo-ui';
import * as Updates from 'expo-updates';
import {Image} from 'expo-image';
import {IC_ICON} from '../../icons';
import {goToAppStore} from '../../utils/common';
import {t} from '../../STRINGS';

const Container = styled.SafeAreaView`
  flex: 1;
  align-self: stretch;
  background-color: ${({theme}) => theme.bg.paper};

  gap: 12px;
  justify-content: center;
  align-items: center;
`;

export default function FallbackComponent(): JSX.Element {
  const {theme} = useDooboo();

  return (
    <Container>
      <Image
        source={IC_ICON}
        style={css`
          width: 120px;
          height: 120px;
          margin-bottom: 28px;
        `}
      />
      <Typography.Body1
        style={css`
          font-family: Pretendard-Bold;
          line-height: 28px;
          margin-bottom: 22px;
          text-align: center;
        `}
      >
        {`${t('common.appErrorMessage')}`}
      </Typography.Body1>
      <Button
        borderRadius={28}
        color="light"
        onPress={async () => {
          if (__DEV__) {
            DevSettings.reload();

            return;
          }

          if (Platform.OS === 'web') {
            window.location.reload();

            return;
          }

          const update = await Updates?.checkForUpdateAsync();

          if (update.isAvailable) {
            await Updates.fetchUpdateAsync();
          }

          await Updates.reloadAsync();
        }}
        styles={{
          text: css`
            font-size: 14px;
            font-family: Pretendard-Bold;
          `,
        }}
        text={t('common.retry')}
        type="outlined"
      />
      <Typography.Body2
        style={css`
          font-family: Pretendard-Bold;
          color: ${theme.text.label};
          align-self: center;
        `}
      >
        {t('common.or')}
      </Typography.Body2>
      <Button
        borderRadius={28}
        color="light"
        onPress={() => goToAppStore()}
        style={css`
          margin-bottom: 18px;
        `}
        styles={{
          text: css`
            font-size: 14px;
            font-family: Pretendard-Bold;
          `,
        }}
        text={t('common.updateApp')}
        type="outlined"
      />
    </Container>
  );
}
