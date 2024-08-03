import styled, {css} from '@emotion/native';
import {Stack, useRouter} from 'expo-router';
import {yupResolver} from '@hookform/resolvers/yup';
import {EditText, Typography, useDooboo} from 'dooboo-ui';
import * as yup from 'yup';
import {Controller, SubmitHandler, useForm} from 'react-hook-form';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import {useRecoilValue} from 'recoil';
import {useState} from 'react';
import {ImagePickerAsset} from 'expo-image-picker';
import { t } from '../../src/STRINGS';
import CustomScrollView from '../../src/components/uis/CustomScrollView';
const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${({theme}) => theme.bg.basic};
`;

const Content = styled.View`
  flex: 1;

  gap: 16px;
`;

const schema = yup.object().shape({
  displayName: yup.string().required(t('common.requiredField')),
});

type FormData = yup.InferType<typeof schema>;

export default function Onboarding(): JSX.Element {
  const {back} = useRouter();
  const {theme} = useDooboo();
  const [assets, setAssets] = useState<ImagePickerAsset[]>([]);

  const {
    control,
    handleSubmit,
    formState: {errors, isSubmitting},
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const handleFinishOnboarding: SubmitHandler<FormData> = async (data) => {};

  return (
    <Container>
      <Stack.Screen
        options={{
          title: t('onboarding.title'),
          headerRight: () => (
            <Pressable
              onPress={handleSubmit(handleFinishOnboarding)}
              hitSlop={{
                bottom: 8,
                left: 8,
                right: 8,
                top: 8,
              }}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={theme.text.label} />
              ) : (
                <Typography.Body3>{t('post.write.register')}</Typography.Body3>
              )}
            </Pressable>
          ),
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.select({ios: 'padding', default: undefined})}
        keyboardVerticalOffset={Platform.select({ios: 116, default: 88})}
        style={css`
          background-color: ${theme.bg.basic};
        `}
      >
        <CustomScrollView
          bounces={false}
          style={css`
            padding: 24px;
          `}
        >
          <Content>
            <Controller
              control={control}
              name="displayName"
              render={({field: {onChange, value}}) => (
                <EditText
                  required
                  styles={{
                    label: css`
                      font-size: 14px;
                    `,
                    labelContainer: css`
                      margin-bottom: 8px;
                    `,
                  }}
                  colors={{focused: theme.role.primary}}
                  label={t('onboarding.displayName')}
                  onChangeText={onChange}
                  placeholder={t('onboarding.displayNamePlaceholder')}
                  value={value}
                  decoration="boxed"
                  error={errors.displayName ? errors.displayName.message : ''}
                />
              )}
              rules={{required: true, validate: (value) => !!value}}
            />
          </Content>
        </CustomScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
}
