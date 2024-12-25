import styled, {css} from '@emotion/native';
import {Image} from 'expo-image';
import {User} from '../../types';
import {Typography, useCPK} from 'cpk-ui';

const Container = styled.View`
  margin-top: 2px;
  background-color: ${({theme}) => theme.bg.basic};

  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

export default function UserListItem({user}: {user: User}): JSX.Element {
  const {theme} = useCPK();

  return (
    <Container>
      <Image
        source={{uri: user?.avatar_url || undefined}}
        style={css`
          width: 16px;
          height: 16px;
          border-radius: 8px;
          background-color: ${theme.bg.paper};
        `}
      />
      <Typography.Body4>{user?.name}</Typography.Body4>
    </Container>
  );
}
