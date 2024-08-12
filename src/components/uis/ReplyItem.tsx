import {Pressable, ScrollView, View} from 'react-native';
import ParsedText from 'react-native-parsed-text';
import styled, {css} from '@emotion/native';
import {Icon, Typography, useDooboo} from 'dooboo-ui';
import CustomPressable from 'dooboo-ui/uis/CustomPressable';
import {Image as ExpoImage} from 'expo-image';
import {useRouter} from 'expo-router';
import {useRecoilValue} from 'recoil';
import {ReplyWithJoins} from '../../types';
import {openURL} from '../../utils/common';
import {formatDateTime} from '../../utils/date';
import {authRecoilState} from '../../recoil/atoms';
import UserImage from './UserImage';
import {useAppLogic} from '../../providers/AppLogicProvider';

const Container = styled.View`
  padding: 14px 24px;
  min-height: 128px;

  flex-direction: row;
  gap: 16px;
`;

const Content = styled.View`
  flex: 1;

  gap: 8px;
`;

const ImageWrapper = styled.View`
  margin-top: 8px;

  flex-direction: row;
  gap: 8px;
`;

const MessageContent = styled.View`
  margin-top: 2px;
  border-radius: 8px;
  border-width: 1px;
  border-color: ${({theme}) => theme.role.border};
  padding: 16px;

  gap: 8px;
`;

type Props = {
  item: ReplyWithJoins;
  onPressLike: (item: ReplyWithJoins) => void;
  onPressDelete: (item: ReplyWithJoins) => void;
};

export default function ReplyItem({
  item,
  onPressDelete,
  onPressLike,
}: Props): JSX.Element {
  const {push, replace} = useRouter();
  const {theme} = useDooboo();
  const userId = item?.user.id;
  const {authId} = useRecoilValue(authRecoilState);
  const {handlePeerContentAction, handleUserContentAction} = useAppLogic();

  const handlePressMore = async (): Promise<void> => {
    if (authId === userId) {
      handleUserContentAction({
        onDelete: () => onPressDelete(item),
      });
      return;
    } else if (userId) {
      handlePeerContentAction({
        userId,
        onCompleted: async () => {
          replace('/');
        },
      });
    }
  };

  const hasLiked = !!item.likes?.some(
    (like) => like.user_id === userId && like.liked,
  );

  const likeCnt = item.likes?.length || 0;

  return (
    <Container>
      <Pressable
        onPress={() => {
          push({
            pathname: `/[displayName]`,
            params: {displayName: `@${item.user.display_name}`},
          });
        }}
        style={css`
          width: 48px;
          gap: 4px;
          align-items: center;
        `}
      >
        <UserImage height={48} imageUrl={item.user.avatar_url} width={48} />
      </Pressable>
      <Content>
        <MessageContent>
          <View
            style={css`
              flex-direction: row;
              align-items: center;
              justify-content: space-between;
            `}
          >
            <Typography.Body3
              style={css`
                font-family: Pretendard-Bold;
              `}
            >
              {item.user.display_name}
            </Typography.Body3>
            <CustomPressable
              onPress={handlePressMore}
              style={css`
                position: absolute;
                right: -8px;
                border-radius: 16px;
                padding: 4px;
              `}
            >
              <Icon color={theme.text.basic} name="DotsThree" size={20} />
            </CustomPressable>
          </View>

          {item.message ? (
            <ParsedText
              parse={[
                {
                  type: 'url',
                  onPress: (url) => openURL(url),
                  style: css`
                    color: ${theme.role.link};
                  `,
                },
              ]}
              selectable
              style={css`
                color: ${theme.text.basic};
                font-size: 13px;
                line-height: 20px;
              `}
            >
              {item.message}
            </ParsedText>
          ) : null}

          <ImageWrapper>
            <ScrollView
              horizontal
              style={css`
                flex: 1;
              `}
            >
              {item.images?.map((el, i) => {
                const imageUrl = el?.image_url || '';

                return (
                  <Pressable
                    key={`${imageUrl}-${i}`}
                    onPress={() =>
                      push({
                        pathname: '/picture',
                        params: {imageUrl},
                      })
                    }
                  >
                    <ExpoImage
                      source={{uri: imageUrl}}
                      // @ts-ignore
                      style={css`
                        margin-right: 10px;
                        width: 80px;
                        height: 80px;
                        border-radius: 8px;
                      `}
                    />
                  </Pressable>
                );
              })}
            </ScrollView>
          </ImageWrapper>
        </MessageContent>

        <View
          style={css`
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          `}
        >
          <Pressable
            hitSlop={{top: 5, left: 5, right: 10, bottom: 10}}
            onPress={() => onPressLike(item)}
          >
            <View
              style={css`
                flex-direction: row;
                align-items: center;
                gap: 4px;
              `}
            >
              <Icon
                color={hasLiked ? 'red' : theme.text.basic}
                name={hasLiked ? 'HeartFill' : 'Heart'}
                size={17}
              />
              <Typography.Body3
                style={css`
                  margin-bottom: 1px;
                `}
              >
                {likeCnt}
              </Typography.Body3>
            </View>
          </Pressable>
          <Typography.Body4
            style={css`
              margin-right: 2px;
              color: ${theme.text.label};
            `}
          >
            {formatDateTime(item?.created_at!)}
          </Typography.Body4>
        </View>
      </Content>
    </Container>
  );
}
