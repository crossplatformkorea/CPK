import styled from "@emotion/native";
import { Typography } from "dooboo-ui";
import { t } from "../../STRINGS";

const Container = styled.SafeAreaView`
  background-color: ${({theme}) => theme.bg.basic};
  padding-bottom: 40px;

  flex: 1;
  align-self: stretch;
  justify-content: center;
  align-items: center;
`;

export default function NotFound(): JSX.Element {
  return (
    <Container>
      <Typography.Heading5>{t('common.notFound')}</Typography.Heading5>
    </Container>
  );
}