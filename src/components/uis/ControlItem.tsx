import {Pressable, View, type ViewStyle} from 'react-native';
import styled, {css} from '@emotion/native';
import {Icon, Typography, useDooboo} from 'dooboo-ui';

const Container = styled.View`
  flex-direction: row;
  align-items: center;
`;

export type ControlItemProps = {
  style?: ViewStyle;
  hasLiked?: boolean;
  likeCnt?: number;
  replyCnt?: number;
  onPressLike?: () => void;
  onPressShare?: () => void;
};

function ControlItem({
  style,
  hasLiked = false,
  replyCnt = 0,
  likeCnt = 0,
  onPressLike,
  onPressShare,
}: ControlItemProps): JSX.Element {
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

      <Pressable hitSlop={{top: 5, left: 5, right: 10, bottom: 10}}>
        <View
          style={css`
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
