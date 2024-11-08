import Svg, {Defs, LinearGradient, Polygon, Stop} from 'react-native-svg';
import {IMG_SPIDER_WEB_LIGHT, IMG_SPIDER_WEB_DARK} from '../../../icons';
import Animated, {BounceIn} from 'react-native-reanimated';

import {type ReactElement} from 'react';
import styled, {css} from '@emotion/native';
import {useDooboo} from 'dooboo-ui';
import {Platform, TouchableOpacity} from 'react-native';
import {StatType} from '../../../types/github-stats';
import SvgStatsPerson from '../../svgs/SvgStatsPerson';
import SvgStatsTree from '../../svgs/SvgStatsTree';
import SvgStatsFire from '../../svgs/SvgStatsFire';
import SvgStatsEarth from '../../svgs/SvgStatsEarth';
import SvgStatsGold from '../../svgs/SvgStatsGold';
import SvgStatsWater from '../../svgs/SvgStatsWater';
import {Image} from 'expo-image';

type Axis = {x: number; y: number};

const Container = styled.View<{width: number}>`
  padding: 32px;
  width: ${({width}) => width} + 'px';

  justify-content: center;
  align-items: center;
`;

const StatsContainer = styled.View`
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4px;
`;

const convertPosition = (
  centerPosition: Axis,
  percentage: number,
  type: StatType,
): string => {
  const toString = (axis: Axis): string => `${axis.x},${axis.y}`;

  let threshold: Axis = centerPosition;
  let thresholdAxis: Axis = {
    x: threshold.x * percentage + centerPosition.x,
    y: threshold.y * percentage + centerPosition.y,
  };
  let newCenterPosition: Axis = centerPosition;

  switch (type) {
    case 'tree':
      newCenterPosition = {
        x: centerPosition.x + centerPosition.x * 0.18,
        y: -centerPosition.y * -0.9,
      };

      threshold = {
        x: centerPosition.x,
        y: -centerPosition.y * 0.5,
      };
      break;

    case 'fire':
      newCenterPosition = {
        x: centerPosition.x + centerPosition.x * 0.18,
        y: centerPosition.y + centerPosition.y * 0.5 * 0.18,
      };

      threshold = {
        x: centerPosition.x,
        y: centerPosition.y * 0.5,
      };
      break;
    case 'earth':
      newCenterPosition = {
        x: centerPosition.x,
        y: centerPosition.y + centerPosition.y * 0.18,
      };

      threshold = {x: 0, y: centerPosition.y};
      break;
    case 'gold':
      newCenterPosition = {
        x: centerPosition.x + -(centerPosition.x * 0.18),
        y: centerPosition.y + centerPosition.y * 0.5 * 0.18,
      };

      threshold = {x: -centerPosition.x, y: centerPosition.y * 0.5};
      break;
    case 'water':
      newCenterPosition = {
        x: centerPosition.x + -(centerPosition.x * 0.18),
        y: centerPosition.y + -(centerPosition.y * 0.5 * 0.18),
      };

      threshold = {x: -centerPosition.x, y: -centerPosition.y * 0.5};
      break;
    case 'people':
      newCenterPosition = {
        x: centerPosition.x,
        y: centerPosition.y + -(centerPosition.y * 0.18),
      };

      threshold = {x: 0, y: -centerPosition.y};
      break;
    default:
      return toString(thresholdAxis);
  }

  const newPercentage = (80 * percentage) / 100;

  thresholdAxis = {
    x: threshold.x * newPercentage + newCenterPosition.x,
    y: threshold.y * newPercentage + newCenterPosition.y,
  };

  return toString(thresholdAxis);
};

const StatUnits = ({
  centerPosition,
  onPressStat,
}: {
  centerPosition: Axis;
  onPressStat: (type: StatType) => void;
}): ReactElement => {
  return (
    <>
      <TouchableOpacity
        onPress={() => onPressStat('people')}
        style={{
          position: 'absolute',
          top: 2,
          padding: 4,
        }}
      >
        <SvgStatsPerson />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onPressStat('tree')}
        style={{
          position: 'absolute',
          top: centerPosition.y * 0.7 - 4,
          right: 2,
          padding: 4,
        }}
      >
        <SvgStatsTree />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onPressStat('fire')}
        style={{
          position: 'absolute',
          bottom: centerPosition.y * 0.7 - 4,
          right: 2,
          padding: 4,
        }}
      >
        <SvgStatsFire />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onPressStat('earth')}
        style={{
          position: 'absolute',
          bottom: 2,
          padding: 4,
        }}
      >
        <SvgStatsEarth />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onPressStat('gold')}
        style={{
          position: 'absolute',
          bottom: centerPosition.y * 0.7 - 4,
          left: 2,
          padding: 4,
        }}
      >
        <SvgStatsGold />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onPressStat('water')}
        style={{
          position: 'absolute',
          top: centerPosition.y * 0.7 - 4,
          left: 2,
          padding: 4,
        }}
      >
        <SvgStatsWater />
      </TouchableOpacity>
    </>
  );
};

export type StatsScore = {
  tree: number;
  fire: number;
  earth: number;
  gold: number;
  water: number;
  people: number;
};

export type StatsChartType = {
  selectedStat?: StatType | null;
  statsScore: StatsScore;
  width?: number;
  centerPosition?: Axis;
  onPressStat: (type: StatType) => void;
};

const AnimatedSvg =
  Platform.OS === 'web' ? Svg : Animated.createAnimatedComponent(Svg);

const StatsChart = ({
  selectedStat,
  statsScore: {tree, fire, earth, gold, water, people},
  width = 262,
  centerPosition = {x: width / 2, y: (width * 1.155) / 2},
  onPressStat,
}: StatsChartType): ReactElement => {
  const {theme, themeType} = useDooboo();
  const height = width * 1.155;

  const posFire = convertPosition(centerPosition, fire, 'fire');
  const posEarth = convertPosition(centerPosition, earth, 'earth');
  const posGold = convertPosition(centerPosition, gold, 'gold');
  const posWater = convertPosition(centerPosition, water, 'water');
  const posPerson = convertPosition(centerPosition, people, 'people');
  const posTree = convertPosition(centerPosition, tree, 'tree');
  const containerWidth = width + 72;

  return (
    <Container width={containerWidth}>
      <StatUnits centerPosition={centerPosition} onPressStat={onPressStat} />
      <StatsContainer>
        <Image
          style={css`
            position: absolute;
            width: ${width + 'px'};
            height: ${height + 'px'};
          `}
          source={
            themeType === 'dark' ? IMG_SPIDER_WEB_DARK : IMG_SPIDER_WEB_LIGHT
          }
        />
        <AnimatedSvg height={height} width={width} entering={BounceIn}>
          <Polygon
            strokeWidth={2}
            stroke={theme.text.basic}
            fill="url(#gradient)"
            fillOpacity={0.7}
            points={`${posFire} ${posEarth} ${posGold} ${posWater} ${posPerson} ${posTree}`}
          />
          <Defs>
            {/* @ts-ignore - This will be fixed in react-native-svg@13+*/}
            <LinearGradient
              id={'gradient'}
              x1={'0'}
              y1={'0%'}
              x2={'100%'}
              y2={'100%'}
            >
              <Stop offset={'0%'} stopColor={'rgb(209, 114, 255)'} />
              <Stop offset={'50%'} stopColor={'rgb(89, 151, 235)'} />
              <Stop offset={'100%'} stopColor={'rgb(77, 255, 255)'} />
            </LinearGradient>
          </Defs>
        </AnimatedSvg>
      </StatsContainer>
    </Container>
  );
};

export default StatsChart;
