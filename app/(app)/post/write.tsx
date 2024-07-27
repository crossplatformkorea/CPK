import styled, {css} from '@emotion/native';
import {Stack} from 'expo-router';
import {yupResolver} from '@hookform/resolvers/yup';
import {t} from '../../../src/STRINGS';
import {EditText, Typography, useDooboo} from 'dooboo-ui';
import * as yup from 'yup';
import {Controller, SubmitHandler, useForm} from 'react-hook-form';
import CustomPressable from 'dooboo-ui/uis/CustomPressable';
import { ActivityIndicator, Pressable } from 'react-native';

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${({theme}) => theme.bg.basic};
`;

const Content = styled.View`
  flex: 1;
  padding: 24px;

  gap: 16px;
`;

const schema = yup.object().shape({
  title: yup.string().required(t('post.write.titlePlaceholder')),
  content: yup.string().required(t('post.write.contentPlaceholder')),
  url: yup.string(),
});

type FormData = yup.InferType<typeof schema>;

export default function CommunityWrite(): JSX.Element {
  const {theme} = useDooboo();

  const {
    control,
    handleSubmit,
    formState: {errors, isSubmitting},
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const writeContent: SubmitHandler<FormData> = async (data) => {
    console.log('data: ', data);
  };

  return (
    <Container>
      <Stack.Screen
        options={{
          title: t('post.write.write'),
          headerRight: () => (
            <Pressable
              onPress={handleSubmit(writeContent)}
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
                <Typography.Body3>
                  {t('post.write.register')}
                </Typography.Body3>
              )}
            </Pressable>
          ),
        }}
      />
      <Content>
        <Controller
          control={control}
          name="title"
          render={({field: {onChange, value}}) => (
            <EditText
              styles={{
                label: css`
                  font-size: 14px;
                  margin-bottom: -4px;
                `,
              }}
              colors={{focused: theme.role.primary}}
              label={t('post.write.title')}
              onChangeText={onChange}
              placeholder={t('post.write.titlePlaceholder')}
              value={value}
              decoration="boxed"
              error={errors.title ? errors.title.message : ''}
            />
          )}
          rules={{required: true, validate: (value) => !!value}}
        />
        <Controller
          control={control}
          name="content"
          render={({field: {onChange, value}}) => (
            <EditText
              styles={{
                label: css`
                  font-size: 14px;
                  margin-bottom: -4px;
                `,
                input: css`
                  min-height: 320px;
                  max-height: 440px;
                `,
              }}
              multiline
              numberOfLines={10}
              colors={{focused: theme.role.primary}}
              label={t('post.write.content')}
              onChangeText={onChange}
              placeholder={t('post.write.contentPlaceholder')}
              value={value}
              decoration="boxed"
              error={errors.content ? errors.content.message : ''}
            />
          )}
          rules={{required: true, validate: (value) => !!value}}
        />
        <Controller
          control={control}
          name="url"
          render={({field: {onChange, value}}) => (
            <EditText
              styles={{
                label: css`
                  font-size: 14px;
                  margin-bottom: -4px;
                `,
              }}
              colors={{focused: theme.role.primary}}
              label={t('post.write.urlTitle')}
              onChangeText={onChange}
              placeholder={t('post.write.urlPlaceholder')}
              value={value}
              decoration="boxed"
            />
          )}
          rules={{required: true, validate: (value) => !!value}}
        />
      </Content>
    </Container>
  );
}
