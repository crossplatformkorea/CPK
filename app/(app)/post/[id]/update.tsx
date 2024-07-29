import styled, {css} from '@emotion/native';
import {Stack, useLocalSearchParams, useRouter} from 'expo-router';
import {yupResolver} from '@hookform/resolvers/yup';
import {EditText, Typography, useDooboo} from 'dooboo-ui';
import * as yup from 'yup';
import {Controller, SubmitHandler, useForm} from 'react-hook-form';
import {ActivityIndicator, Pressable} from 'react-native';
import ErrorFallback from '../../../../src/components/uis/ErrorFallback';
import {useRecoilValue} from 'recoil';
import {PostInsertArgs} from '../../../../src/types';
import {supabase} from '../../../../src/supabase';
import {authRecoilState} from '../../../../src/recoil/atoms';
import {t} from '../../../../src/STRINGS';
import useSWR from 'swr';
import {fetchPostById} from '../../../../src/apis/postQueries';
import CustomLoadingIndicator from '../../../../src/components/uis/CustomLoadingIndicator';
import NotFound from '../../../../src/components/uis/NotFound';

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

const updatePost = async (id: string, post: PostInsertArgs) => {
  const {data, error} = await supabase
    .from('posts')
    .update({
      title: post.title,
      content: post.content,
      url: post.url,
    })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export default function PostUpdate(): JSX.Element {
  const {id} = useLocalSearchParams<{id: string}>();
  const {back} = useRouter();
  const {theme, snackbar} = useDooboo();
  const {authId} = useRecoilValue(authRecoilState);

  const {
    control,
    handleSubmit,
    formState: {errors, isSubmitting},
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const {
    data: post,
    error,
    isValidating,
  } = useSWR(id ? `post-${id}` : null, () => fetchPostById(id || ''), {
    onSuccess: (data) => {
      if (data) {
        reset({
          title: data.title,
          content: data.content,
          url: data?.url || undefined,
        });
      }
    },
  });

  const handleUpdatePost: SubmitHandler<FormData> = async (data) => {
    if (!authId || !id) return;

    try {
      await updatePost(id, {
        title: data.title,
        content: data.content,
        url: data.url || null,
        user_id: authId,
      });

      snackbar.open({
        text: t('post.update.updateSuccess'),
        color: 'success',
      });

      back();
    } catch (e) {
      snackbar.open({
        text: t('post.update.updateFailed'),
        color: 'danger',
      });

      if (__DEV__) console.error('Error updating post:', e);
    }
  };

  const content = (() => {
    switch (true) {
      case isValidating:
        return <CustomLoadingIndicator />;
      case error:
        return <ErrorFallback />;
      case !post:
        return <NotFound />;
      case !!post:
        return (
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
        );
      default:
        return null;
    }
  })();

  return (
    <Container>
      <Stack.Screen
        options={{
          title: post?.title || t('common.post'),
          headerRight: () => (
            <Pressable
              onPress={handleSubmit(handleUpdatePost)}
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
                <Typography.Body3>{t('common.update')}</Typography.Body3>
              )}
            </Pressable>
          ),
        }}
      />
      {content}
    </Container>
  );
}
