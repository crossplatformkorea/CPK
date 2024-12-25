import type {ComponentProps, Dispatch, SetStateAction} from 'react';
import {useEffect, useState} from 'react';
import styled, {css} from '@emotion/native';
import {t} from '../../../STRINGS';
import {Modal} from 'react-native';
import {Button, EditText, Typography, useCPK} from 'cpk-ui';

type AlertModalPropType = {
  visible: boolean;
  title?: string;
  loading?: boolean;
  onConfirm?: (message: string) => void;
  onCancel?: () => void;
  setOpened?: Dispatch<SetStateAction<boolean>>;
  defaultMessage?: string;
  maxLength?: number;
  numberOfLines?: number;
  textInputProps?: ComponentProps<typeof EditText>['textInputProps'];
};

const Container = styled.View`
  flex-direction: row;
  height: 100%;
  align-self: center;
`;

const Content = styled.View`
  width: 100%;
  align-self: center;
  background-color: ${({theme}) => theme.bg.basic};
  border-radius: 8px;
  padding: 24px;
  margin: 16px;

  max-width: 600px;
`;

const ButtonWrapper = styled.View`
  flex-direction: row;
  gap: 10px;
`;

export default function InputModal({
  visible,
  title,
  onConfirm,
  onCancel,
  loading = false,
  defaultMessage = '',
  maxLength,
  numberOfLines,
  textInputProps,
}: AlertModalPropType): JSX.Element {
  const {theme} = useCPK();
  const [message, setMessage] = useState('');

  /* To set message whenever defaultMessage is changed */
  useEffect(() => {
    setMessage(defaultMessage);
  }, [defaultMessage]);

  return (
    <Modal
      presentationStyle="overFullScreen"
      transparent
      animationType="fade"
      visible={visible}
    >
      <Container>
        <Content>
          <Typography.Body1
            style={css`
              font-family: Pretendard-Bold;
              margin-bottom: 16px;
            `}
          >
            {title}
          </Typography.Body1>
          <EditText
            decoration="boxed"
            maxLength={maxLength}
            multiline
            numberOfLines={numberOfLines}
            onChangeText={setMessage}
            placeholder={t('common.reportHint')}
            onSubmitEditing={() => onConfirm?.(message)}
            style={css`
              margin-bottom: 24px;
            `}
            styles={{
              container: css`
                max-height: 200px;
                border-radius: 4px;
              `,
            }}
            textInputProps={textInputProps}
            value={message}
          />
          <ButtonWrapper>
            <Button
              color="light"
              onPress={() => {
                onCancel?.();
                setMessage(defaultMessage);
              }}
              style={css`
                flex: 1;
              `}
              styles={{
                container: css`
                  height: 48px;
                `,
                text: css`
                  color: ${theme.text.placeholder};
                  font-family: Pretendard-Bold;
                  font-size: 16px;
                `,
              }}
              text={t('common.cancel')}
              touchableHighlightProps={{
                underlayColor: theme.text.contrast,
              }}
            />
            <Button
              loading={loading}
              onPress={() => {
                onConfirm?.(message);
                setMessage('');
              }}
              style={css`
                flex: 1;
              `}
              styles={{
                container: css`
                  height: 48px;
                `,
                text: css`
                  font-family: Pretendard-Bold;
                  font-size: 16px;
                `,
              }}
              text={t('common.ok')}
              touchableHighlightProps={{
                underlayColor: theme.text.contrast,
              }}
            />
          </ButtonWrapper>
        </Content>
      </Container>
    </Modal>
  );
}
