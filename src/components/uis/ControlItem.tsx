import {Pressable, View, type ViewStyle} from 'react-native';
import styled, {css} from '@emotion/native';
import {Icon, Typography, useDooboo} from 'dooboo-ui';

const Container = styled.View`
  flex-direction: row;
  align-items: center;
`;

type Props = {
  style?: ViewStyle;
  hasLiked?: boolean;
  likeCnt?: number;
  replyCnt?: number;
  onPressLike?: () => void;
  onPressReply?: () => void;
  onPressShare?: () => void;
};

function ControlItem({
  style,
  hasLiked = false,
  replyCnt = 0,
  likeCnt = 0,
  onPressLike,
  onPressReply,
  onPressShare,
}: Props): JSX.Element {
  const {theme} = useDooboo();

  return (
    <Container
      style={[
        css`
          flex-direction: row;
          align-items: center;
          gap: 16px;
        `,
        style,
      ]}
    >
      <Pressable
        hitSlop={{top: 5, left: 5, right: 10, bottom: 10}}
        onPress={onPressLike}
      >
        <View
          style={css`
            padding: 16px 0 4px 0;

            flex-direction: row;
            align-items: center;
            gap: 6px;
          `}
        >
          <Icon
            color={hasLiked ? 'red' : theme.text.basic}
            name={hasLiked ? 'HeartFill' : 'Heart'}
            size={17}
          />
          <Typography.Body3>{likeCnt ?? 0}</Typography.Body3>
        </View>
      </Pressable>

      <Pressable
        hitSlop={{top: 5, left: 5, right: 10, bottom: 10}}
        onPress={onPressReply}
      >
        <View
          style={css`
            padding: 16px 0 4px 0;

            flex-direction: row;
            align-items: center;
            gap: 6px;
          `}
        >
          <Icon color={theme.text.basic} name="ChatCenteredText" size={18} />
          <Typography.Body3>{replyCnt ?? 0}</Typography.Body3>
        </View>
      </Pressable>

      <Pressable
        hitSlop={{top: 5, left: 5, right: 10, bottom: 10}}
        onPress={onPressShare}
      >
        <View
          style={css`
            padding: 16px 0 4px 0;

            flex-direction: row;
            align-items: center;
            gap: 6px;
          `}
        >
          <Icon color={theme.text.basic} name="ShareFat" size={18} />
        </View>
      </Pressable>
    </Container>
  );
}

export default ControlItem;
