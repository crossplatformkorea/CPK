import styled, {css} from '@emotion/native';
import {Stack, useRouter} from 'expo-router';
import {yupResolver} from '@hookform/resolvers/yup';
import {EditText, Icon, Typography, useDooboo} from 'dooboo-ui';
import * as yup from 'yup';
import {Controller, SubmitHandler, useForm} from 'react-hook-form';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import {useState, useEffect} from 'react';
import useSwr from 'swr';
import {t} from '../../../src/STRINGS';
import {useRecoilState} from 'recoil';
import {authRecoilState} from '../../../src/recoil/atoms';
import {uploadFileToSupabase} from '../../../src/supabase';
import {ImageInsertArgs} from '../../../src/types';
import CustomScrollView from '../../../src/components/uis/CustomScrollView';
import ProfileImageInput from '../../../src/components/fragments/ProfileImageInput';
import {delayPressIn} from '../../../src/utils/constants';
import CustomPressable from 'dooboo-ui/uis/CustomPressable';
import {
  fetchUpdateProfile,
  fetchUserProfile,
} from '../../../src/apis/profileQueries';
import FallbackComponent from '../../../src/components/uis/FallbackComponent';
import CustomLoadingIndicator from '../../../src/components/uis/CustomLoadingIndicator';
import {showAlert} from '../../../src/utils/alert';

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${({theme}) => theme.bg.basic};
`;

const UserImageView = styled.View`
  align-items: center;
  padding: 24px;
  background-color: ${({theme}) => theme.bg.paper};
`;

const Content = styled.View`
  flex: 1;
  padding: 24px;
  gap: 16px;
`;

const schema = yup.object().shape({
  display_name: yup.string().required(t('common.requiredField')).min(2).max(20),
  github_id: yup.string().required(t('common.requiredField')),
  affiliation: yup.string().required(t('common.requiredField')),
  meetup_id: yup.string(),
  avatar_url: yup.string(),
  other_sns_urls: yup.array().of(yup.string()),
  tags: yup.array().of(yup.string()),
  desired_connection: yup.string(),
  introduction: yup.string(),
  motivation_for_event_participation: yup.string(),
  future_expectations: yup.string(),
});

type FormData = yup.InferType<
  typeof schema & {
    tags: string[];
    profileImg?: string;
  }
>;

const fetcher = async (authId?: string | null) => {
  if (!authId) return;

  const {profile, userTags} = await fetchUserProfile(authId);
  return {profile, userTags};
};

export default function ProfileUpdate(): JSX.Element {
  const {theme} = useDooboo();
  const [{authId}, setAuth] = useRecoilState(authRecoilState);
  const [tag, setTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [profileImg, setProfileImg] = useState<string>();
  const [displayNameError, setDisplayNameError] = useState<string>();
  const {back} = useRouter();

  const {data: user, error} = useSwr(authId && `/profile/${authId}`, () =>
    fetcher(authId),
  );

  const handleAddTag = () => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTag('');
    }
  };

  const {
    control,
    handleSubmit,
    formState: {errors, isSubmitting},
    setValue,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const handleProfileUpdate: SubmitHandler<FormData> = async (data) => {
    if (!authId) return;

    let image: ImageInsertArgs | undefined = {};

    if (profileImg && !profileImg.startsWith('http')) {
      const destPath = `users/${authId}`;

      image = await uploadFileToSupabase({
        uri: profileImg,
        fileType: 'Image',
        bucket: 'images',
        destPath,
      });
    }

    const formDataWithTags = {
      ...data,
      avatar_url:
        !profileImg && user?.profile?.avatar_url
          ? null
          : image?.image_url || undefined,
    };

    try {
      const user = await fetchUpdateProfile({
        args: formDataWithTags,
        authId,
        tags: tags || [],
      });

      if (user) {
        setTags(tags);
        setAuth((prev) => ({...prev, user}));
        back();
      }
    } catch (error: any) {
      if (error?.name === 'displayName') {
        setDisplayNameError(error?.message || '');
        return;
      }

      showAlert((error as Error)?.message || '');
    }
  };

  useEffect(() => {
    if (user?.profile) {
      setValue('display_name', user.profile.display_name || '');
      setValue('meetup_id', user.profile.meetup_id || '');
      setValue('github_id', user.profile.github_id || '');
      setValue('affiliation', user.profile.affiliation || '');
      setValue('introduction', user.profile.introduction || '');
      setValue('desired_connection', user.profile.desired_connection || '');
      setValue(
        'motivation_for_event_participation',
        user.profile.motivation_for_event_participation || '',
      );
      setValue('future_expectations', user.profile.future_expectations || '');
      setTags(user.userTags);
      setProfileImg(`${user.profile.avatar_url}` || undefined);
    }
  }, [user, setValue]);

  if (error) {
    return <FallbackComponent />;
  }

  if (!user) {
    return <CustomLoadingIndicator />;
  }

  return (
    <Container>
      <Stack.Screen
        options={{
          title: t('profileUpdate.title'),
          headerRight: () => (
            <Pressable
              onPress={handleSubmit(handleProfileUpdate)}
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
      <KeyboardAvoidingView
        behavior={Platform.select({ios: 'padding', default: undefined})}
        keyboardVerticalOffset={80}
        style={[
          css`
            background-color: ${theme.bg.basic};
            flex: 1;
            align-self: stretch;
          `,
        ]}
      >
        <CustomScrollView bounces={false}>
          <UserImageView>
            <ProfileImageInput
              imageUri={profileImg}
              onChangeImageUri={setProfileImg}
              onDeleteImageUri={() => setProfileImg(undefined)}
            />
          </UserImageView>
          <Content>
            <Controller
              control={control}
              name="display_name"
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
                  error={
                    displayNameError
                      ? displayNameError
                      : errors.display_name
                        ? t('error.displayNameInvalid')
                        : ''
                  }
                />
              )}
              rules={{required: true, validate: (value) => !!value}}
            />
            <Controller
              control={control}
              name="github_id"
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
                  label={t('onboarding.githubId')}
                  onChangeText={onChange}
                  placeholder={t('onboarding.githubIdPlaceholder')}
                  value={value}
                  decoration="boxed"
                  error={errors.github_id ? errors.github_id.message : ''}
                />
              )}
              rules={{validate: (value) => !!value}}
            />
            <Controller
              control={control}
              name="affiliation"
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
                  label={t('onboarding.affiliation')}
                  onChangeText={onChange}
                  placeholder={t('onboarding.affiliationPlaceholder')}
                  value={value}
                  decoration="boxed"
                  error={errors.affiliation ? errors.affiliation.message : ''}
                />
              )}
              rules={{validate: (value) => !!value}}
            />
            <Controller
              control={control}
              name="meetup_id"
              render={({field: {onChange, value}}) => (
                <EditText
                  styles={{
                    label: css`
                      font-size: 14px;
                    `,
                    labelContainer: css`
                      margin-bottom: 8px;
                    `,
                  }}
                  colors={{focused: theme.role.primary}}
                  label={t('onboarding.meetupId')}
                  onChangeText={onChange}
                  placeholder={t('onboarding.meetupIdPlaceholder')}
                  value={value}
                  decoration="boxed"
                  error={errors.meetup_id ? errors.meetup_id.message : ''}
                />
              )}
              rules={{validate: (value) => !!value}}
            />
            <Controller
              control={control}
              name="introduction"
              render={({field: {onChange, value}}) => (
                <EditText
                  styles={{
                    label: css`
                      font-size: 14px;
                    `,
                    labelContainer: css`
                      margin-bottom: 8px;
                    `,
                    input: css`
                      min-height: 120px;
                    `,
                  }}
                  multiline
                  colors={{focused: theme.role.primary}}
                  label={t('onboarding.introduction')}
                  onChangeText={onChange}
                  placeholder={t('onboarding.introductionPlaceholder')}
                  value={value}
                  decoration="boxed"
                  error={errors.introduction ? errors.introduction.message : ''}
                />
              )}
              rules={{validate: (value) => !!value}}
            />
            <Controller
              control={control}
              name="desired_connection"
              render={({field: {onChange, value}}) => (
                <EditText
                  styles={{
                    label: css`
                      font-size: 14px;
                    `,
                    labelContainer: css`
                      margin-bottom: 8px;
                    `,
                    input: css`
                      min-height: 120px;
                    `,
                  }}
                  multiline
                  colors={{focused: theme.role.primary}}
                  label={t('onboarding.desiredConnection')}
                  onChangeText={onChange}
                  placeholder={t('onboarding.desiredConnectionPlaceholder')}
                  value={value}
                  decoration="boxed"
                  error={
                    errors.desired_connection
                      ? errors.desired_connection.message
                      : ''
                  }
                />
              )}
              rules={{validate: (value) => !!value}}
            />
            <Controller
              control={control}
              name="future_expectations"
              render={({field: {onChange, value}}) => (
                <EditText
                  styles={{
                    label: css`
                      font-size: 14px;
                    `,
                    labelContainer: css`
                      margin-bottom: 8px;
                    `,
                    input: css`
                      min-height: 120px;
                    `,
                  }}
                  multiline
                  colors={{focused: theme.role.primary}}
                  label={t('onboarding.futureExpectations')}
                  onChangeText={onChange}
                  placeholder={t('onboarding.futureExpectationsPlaceholder')}
                  value={value}
                  decoration="boxed"
                  error={
                    errors.future_expectations
                      ? errors.future_expectations.message
                      : ''
                  }
                />
              )}
              rules={{validate: (value) => !!value}}
            />

            {/* Tags */}
            <Controller
              control={control}
              name="tags"
              render={() => (
                <>
                  <View
                    style={css`
                      flex-direction: row;
                    `}
                  >
                    <EditText
                      decoration="boxed"
                      editable={!isSubmitting}
                      label={t('onboarding.yourTags')}
                      onChangeText={(text) => {
                        setTag(
                          text.length > 12
                            ? text.trim().slice(0, 20)
                            : text.trim(),
                        );
                      }}
                      onSubmitEditing={handleAddTag}
                      placeholder={t('onboarding.yourTagsPlaceholder')}
                      style={css`
                        flex: 1;
                      `}
                      styles={{
                        container: css`
                          border-radius: 4px;
                        `,
                      }}
                      textInputProps={{
                        returnKeyLabel: t('common.add'),
                        returnKeyType: 'done',
                      }}
                      value={tag}
                    />
                    <View
                      style={css`
                        flex-direction: row;
                        justify-content: center;
                        align-items: center;
                      `}
                    >
                      <CustomPressable
                        delayHoverIn={delayPressIn}
                        disabled={isSubmitting}
                        onPress={handleAddTag}
                        style={css`
                          margin-top: 32px;
                          margin-left: 12px;
                          border-radius: 48px;
                        `}
                      >
                        <Icon
                          name="PlusCircle"
                          size={20}
                          style={css`
                            color: ${theme.text.placeholder};
                          `}
                        />
                      </CustomPressable>
                    </View>
                  </View>
                  <View
                    style={css`
                      flex-direction: row;
                      flex-wrap: wrap;
                      gap: 8px;
                      margin-bottom: 16px;
                    `}
                  >
                    {tags.map((tag, index) => (
                      <View
                        key={index}
                        style={css`
                          background-color: ${theme.bg.paper};
                          padding: 8px;
                          border-radius: 4px;
                          flex-direction: row;
                          align-items: center;
                        `}
                      >
                        <Text
                          style={css`
                            color: ${theme.text.basic};
                          `}
                        >
                          {tag}
                        </Text>
                        <CustomPressable
                          delayHoverIn={delayPressIn}
                          onPress={() => setTags(tags.filter((t) => t !== tag))}
                          style={css`
                            margin-left: 8px;
                          `}
                        >
                          <Icon
                            name="XCircle"
                            size={20}
                            style={css`
                              color: ${theme.text.placeholder};
                            `}
                          />
                        </CustomPressable>
                      </View>
                    ))}
                  </View>
                </>
              )}
            />
          </Content>
        </CustomScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
}
