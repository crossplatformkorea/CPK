import styled from '@emotion/native';
import {type ReactElement} from 'react';
import {
  IC_TIER_BRONZE,
  IC_TIER_CHALLENGER,
  IC_TIER_DIAMOND,
  IC_TIER_GOLD,
  IC_TIER_MASTER,
  IC_TIER_PLATINUM,
  IC_TIER_SILVER,
} from '../../../icons';

const Container = styled.View`
  align-self: stretch;
  justify-content: center;

  flex-direction: row;
  align-items: center;
`;

const TierView = styled.View`
  min-width: 90px;

  flex-direction: row;
  align-items: center;
`;

const ScoreView = styled.View`
  min-width: 64px;
  margin-left: 100px;

  flex-direction: row;
  align-items: center;
`;

const StyledImage = styled.Image`
  width: 32px;
  height: 32px;
  margin-right: 8px;
`;

const LabelText = styled.Text`
  font-size: 12px;
  opacity: 0.5;
  color: ${({theme}) => theme.text.basic};
`;

const ValueText = styled.Text`
  margin-left: 8px;
  font-size: 24px;
  font-weight: bold;
  color: ${({theme}) => theme.text.basic};
`;

export type ScoreType = {
  tierName:
    | 'Iron'
    | 'Bronze'
    | 'Silver'
    | 'Gold'
    | 'Platinum'
    | 'Master'
    | 'Diamond'
    | 'Challenger';
  score: number;
};

const Score = ({tierName, score = 0}: ScoreType): ReactElement => {
  return (
    <Container>
      <TierView>
        <StyledImage
          source={
            tierName === 'Iron'
              ? IC_TIER_BRONZE
              : tierName === 'Bronze'
                ? IC_TIER_BRONZE
                : tierName === 'Silver'
                  ? IC_TIER_SILVER
                  : tierName === 'Gold'
                    ? IC_TIER_GOLD
                    : tierName === 'Platinum'
                      ? IC_TIER_PLATINUM
                      : tierName === 'Diamond'
                        ? IC_TIER_DIAMOND
                        : tierName === 'Master'
                          ? IC_TIER_MASTER
                          : IC_TIER_CHALLENGER
          }
        />
        <LabelText>{tierName}</LabelText>
      </TierView>
      <ScoreView>
        <LabelText>AVG</LabelText>
        <ValueText>{score}</ValueText>
      </ScoreView>
    </Container>
  );
};

export default Score;
