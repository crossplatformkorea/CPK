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
import {LinearGradient} from 'expo-linear-gradient';
import {useState} from 'react';
import {ImagePickerAsset} from 'expo-image-picker';
import {t} from '../../src/STRINGS';
import CustomScrollView from '../../src/components/uis/CustomScrollView';
import ProfileImageInput from '../../src/components/fragments/ProfileImageInput';
import CustomPressable from 'dooboo-ui/uis/CustomPressable';
import {delayPressIn} from '../../src/utils/constants';
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
  avatarUrl: yup.string(),
  meetupId: yup.string(),
  affiliation: yup.string(),
  githubId: yup.string(),
  otherSnsUrls: yup.array().of(yup.string()),
  tags: yup.array().of(yup.string()),
  desiredConnection: yup.string(),
  introduction: yup.string(),
  motivationForEventParticipation: yup.string(),
  futureExpectations: yup.string(),
});

type FormData = yup.InferType<
  typeof schema & {
    tags: string[];
  }
>;

export default function Onboarding(): JSX.Element {
  const {back} = useRouter();
  const {theme} = useDooboo();
  const [assets, setAssets] = useState<ImagePickerAsset[]>([]);
  const [tag, setTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);

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
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const handleFinishOnboarding: SubmitHandler<FormData> = async (data) => {
    const formDataWithTags = {
      ...data,
      tags,
    };
    console.log(formDataWithTags);
  };

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
            <Controller
              control={control}
              name="meetupId"
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
                  error={errors.meetupId ? errors.meetupId.message : ''}
                />
              )}
              rules={{validate: (value) => !!value}}
            />
            <Controller
              control={control}
              name="githubId"
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
                  label={t('onboarding.githubId')}
                  onChangeText={onChange}
                  placeholder={t('onboarding.githubIdPlaceholder')}
                  value={value}
                  decoration="boxed"
                  error={errors.githubId ? errors.githubId.message : ''}
                />
              )}
              rules={{validate: (value) => !!value}}
            />
            <Controller
              control={control}
              name="affiliation"
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
              name="desiredConnection"
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
                  error={errors.desiredConnection ? errors.desiredConnection.message : ''}
                />
              )}
              rules={{validate: (value) => !!value}}
            />
            <Controller
              control={control}
              name="motivationForEventParticipation"
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
                  label={t('onboarding.motivationForEventParticipation')}
                  onChangeText={onChange}
                  placeholder={t(
                    'onboarding.motivationForEventParticipationPlaceholder',
                  )}
                  value={value}
                  decoration="boxed"
                  error={
                    errors.motivationForEventParticipation
                      ? errors.motivationForEventParticipation.message
                      : ''
                  }
                />
              )}
              rules={{validate: (value) => !!value}}
            />
            <Controller
              control={control}
              name="futureExpectations"
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
                    errors.futureExpectations
                      ? errors.futureExpectations.message
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
