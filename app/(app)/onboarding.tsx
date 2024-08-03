import styled, {css} from '@emotion/native';
import {Stack, useRouter} from 'expo-router';
import {yupResolver} from '@hookform/resolvers/yup';
import {EditText, Typography, useDooboo} from 'dooboo-ui';
import * as yup from 'yup';
import {Controller, SubmitHandler, useForm} from 'react-hook-form';
import {ActivityIndicator, Pressable, Text, View} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {Image} from 'expo-image';

import {useRecoilValue} from 'recoil';
import {useState} from 'react';
import {ImagePickerAsset} from 'expo-image-picker';
import {t} from '../../src/STRINGS';
import CustomScrollView from '../../src/components/uis/CustomScrollView';
import ProfileImageInput from '../../src/components/fragments/ProfileImageInput';
const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${({theme}) => theme.bg.basic};
`;

const SectionHeaderGradient = styled(LinearGradient)`
  height: 180px;

  justify-content: center;
  align-items: center;
`;

const UserImageView = styled.View`
  width: 96px;
  height: 96px;

  position: absolute;
  bottom: -46px;
  left: 20px;
`;

const Content = styled.View`
  flex: 1;
  padding: 60px 24px 24px 24px;

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
                <Typography.Body3>{t('common.done')}</Typography.Body3>
              )}
            </Pressable>
          ),
        }}
      />

      <CustomScrollView bounces={false}>
        <View>
          <SectionHeaderGradient
            colors={[theme.brandContrast, theme.brand]}
            style={css`
              padding: 24px 24px 36px 24px;
              text-align: center;
              gap: 6px;
            `}
          >
            <Text
              style={css`
                font-size: 20px;
                font-family: Pretendard-Bold;
                color: ${theme.text.contrast};
                padding-bottom: 4px;
              `}
            >
              {t('onboarding.sectionTitle')}
            </Text>
            <Text
              style={css`
                font-size: 16px;
                font-family: Pretendard-Bold;
                color: ${theme.text.contrast};
                opacity: 0.8;
                padding-bottom: 4px;
                text-align: center;
              `}
            >
              {t('onboarding.sectionDescription')}
            </Text>
          </SectionHeaderGradient>
          <UserImageView>
            <ProfileImageInput />
          </UserImageView>
        </View>
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
    </Container>
  );
}
