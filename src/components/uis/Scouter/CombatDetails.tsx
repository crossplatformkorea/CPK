import styled from '@emotion/native';
import {Typography, useDooboo} from 'dooboo-ui';
import {type ReactElement} from 'react';
import {
  Linking,
  Platform,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import {
  ContentDetailDescProps,
  DoobooGithubStats,
  PluginStats,
  Stats,
  StatsDetail,
  StatsElement,
  StatType,
} from '../../../types/github-stats';
import {t} from '../../../STRINGS';
import SvgStatsDooboo from '../../svgs/SvgStatsDooboo';
import SvgStatsTree from '../../svgs/SvgStatsTree';
import SvgStatsEarth from '../../svgs/SvgStatsEarth';
import SvgStatsFire from '../../svgs/SvgStatsFire';
import SvgStatsGold from '../../svgs/SvgStatsGold';
import SvgStatsWater from '../../svgs/SvgStatsWater';
import SvgStatsPerson from '../../svgs/SvgStatsPerson';

const Container = styled.View`
  width: ${Platform.OS === 'web' ? 'calc(100vw - 56px)' : undefined};
  min-width: 300px;
  border-radius: 4px;
  border-width: 1px;
  border-color: ${({theme}) => theme.role.border};
  align-self: stretch;
  justify-content: center;
  overflow: hidden;

  flex-direction: column;
  align-items: center;
`;

const Details = styled.View`
  width: 100%;
  padding: 20px;
`;

const DetailHead = styled.View`
  margin-bottom: 12px;

  flex-direction: row;
  align-items: center;
`;

const DetailBody = styled.View`
  width: 100%;

  flex-direction: column;
`;

const StatIcons = ({
  selectedStats,
  onPressStat,
}: {
  selectedStats: StatType | null;
  onPressStat: (stat: StatType | null) => void;
}): ReactElement => {
  const {theme} = useDooboo();

  const style: ViewStyle = {
    width: 24,
    height: 24,
  };

  return (
    <View
      style={{
        height: 56,
        width: '100%',
        alignSelf: 'stretch',
        borderBottomWidth: 1,
        borderColor: theme.role.border,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
      }}
    >
      <TouchableOpacity
        onPress={() => onPressStat(null)}
        style={[style, {padding: 2}]}
      >
        <SvgStatsDooboo />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onPressStat('tree')}
        style={[style, {padding: 2}]}
      >
        <SvgStatsTree />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onPressStat('fire')}
        style={[style, {padding: 2}]}
      >
        <SvgStatsFire />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onPressStat('earth')}
        style={[style, {padding: 2}]}
      >
        <SvgStatsEarth />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onPressStat('gold')}
        style={[style, {padding: 2}]}
      >
        <SvgStatsGold />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onPressStat('water')}
        style={[style, {padding: 2}]}
      >
        <SvgStatsWater />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onPressStat('people')}
        style={[style, {padding: 2}]}
      >
        <SvgStatsPerson />
      </TouchableOpacity>
    </View>
  );
};

function ContentStatsDetails({
  statsElement,
  details,
}: {
  statsElement: StatsElement;
  details: StatsDetail[];
}): ReactElement {
  const {theme} = useDooboo();

  const renderCommonDetail = ({
    statsDetails,
  }: {
    statsDetails?: ReactElement;
  }): ReactElement => {
    return (
      <View key={statsElement.name}>
        <View
          style={{
            marginBottom: 8,
            alignSelf: 'stretch',

            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <View>
            <Typography.Body1
              key={statsElement.name}
              style={{minHeight: 24, fontWeight: 'bold'}}
            >
              {statsElement.key}
              {/* {getString(statsElement.key as any)} */}
            </Typography.Body1>
          </View>
          <View>
            <Typography.Body1
              style={{
                minHeight: 24,
                marginBottom: 12,
                color: theme.role.accent,
              }}
            >
              {statsElement.totalCount?.toLocaleString() || ''}
            </Typography.Body1>
          </View>
        </View>
        {statsDetails}
      </View>
    );
  };

  return (() => {
    switch (details.length) {
      case 0:
        return renderCommonDetail({});
      case 1:
        return renderCommonDetail({
          statsDetails: (
            <View
              style={{
                marginTop: 4,
                marginBottom: 40,
              }}
            >
              {details.map((detail: StatsDetail, i) => {
                switch (detail.type) {
                  case 'repository':
                    return (
                      <View
                        style={{
                          marginRight: 8,
                          flexDirection: 'row',
                          marginBottom: 5,
                        }}
                      >
                        <Text
                          style={{color: theme.role.accent}}
                          onPress={() => Linking.openURL(detail.url)}
                        >
                          {detail.name}
                        </Text>
                        {i < details.length - 1 ? <Text>,</Text> : null}
                      </View>
                    );
                  case 'commit':
                    return (
                      <View
                        style={{
                          marginRight: 8,
                          marginBottom: 8,

                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}
                      >
                        <View>
                          <Text
                            style={{color: theme.role.primary}}
                            onPress={() =>
                              Linking.openURL(
                                `https://github.com/${detail.name}`,
                              )
                            }
                          >
                            {detail.name}
                          </Text>
                        </View>
                        <View>
                          <Text
                            style={{color: theme.role.accent}}
                            onPress={() =>
                              Linking.openURL(
                                `https://github.com/${detail.name}/commit/${detail.sha}`,
                              )
                            }
                          >
                            {`${detail.message}`}
                          </Text>
                        </View>
                      </View>
                    );
                  case 'language':
                    return (
                      <View
                        style={{
                          marginRight: 8,
                          marginBottom: 5,

                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}
                      >
                        <View>
                          <Text style={{color: theme.text.basic}}>
                            {detail.name}
                          </Text>
                        </View>
                        <View>
                          <Text style={{color: theme.text.basic}}>
                            {detail.count.toLocaleString()}
                          </Text>
                        </View>
                      </View>
                    );
                }
              })}
            </View>
          ),
        });
      default: // Multiple details in one attr
        return renderCommonDetail({
          statsDetails: (
            <View
              style={{
                marginTop: 4,
                marginBottom: 40,
              }}
            >
              {details.map((detail: StatsDetail, i) => {
                switch (detail.type) {
                  case 'repository':
                    return (
                      <View
                        style={{
                          marginRight: 8,
                          flexDirection: 'row',
                          marginBottom: 5,
                        }}
                      >
                        <Text
                          style={{color: theme.role.accent}}
                          onPress={() => Linking.openURL(detail.url)}
                        >
                          {detail.name}
                        </Text>
                        {i < details.length - 1 ? <Text>,</Text> : null}
                      </View>
                    );
                  case 'commit':
                    return (
                      <View
                        style={{
                          marginRight: 8,
                          marginBottom: 8,

                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}
                      >
                        <View style={{marginTop: 8}}>
                          <Text
                            style={{color: theme.role.primary}}
                            onPress={() =>
                              Linking.openURL(
                                `https://github.com/${detail.name}`,
                              )
                            }
                          >
                            {detail.name}
                          </Text>
                          <Text
                            style={{color: theme.role.accent, marginTop: 8}}
                            onPress={() =>
                              Linking.openURL(
                                `https://github.com/${detail.name}/commit/${detail.sha}`,
                              )
                            }
                          >
                            {`${detail.message}`}
                          </Text>
                        </View>
                      </View>
                    );
                  case 'language':
                    return (
                      <View
                        style={{
                          marginRight: 8,
                          marginBottom: 5,

                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}
                      >
                        <View>
                          <Text style={{color: theme.text.basic}}>
                            {detail.name}
                          </Text>
                        </View>
                        <View>
                          <Text style={{color: theme.text.basic}}>
                            {detail.count.toLocaleString()}
                          </Text>
                        </View>
                      </View>
                    );
                }
              })}
            </View>
          ),
        });
    }
  })();
}

const ContentDetailDescription = ({
  json,
  stats,
  selectedStats,
}: ContentDetailDescProps): ReactElement | null => {
  const {theme} = useDooboo();

  if (!stats) {
    return null;
  }

  const {name, description, statsElements, score} = stats;

  if (!selectedStats) {
    return (
      <View style={{flex: 1}}>
        <DetailHead>
          <Typography.Heading1
            style={{fontWeight: 'bold', fontSize: 22, marginBottom: 8}}
          >
            {t('common.bio')}
          </Typography.Heading1>
        </DetailHead>
        <DetailBody>
          <View style={{flex: 1, flexDirection: 'column'}}>
            <Typography.Body1>{json.bio}</Typography.Body1>
          </View>
        </DetailBody>
      </View>
    );
  }

  return (
    <View style={{flex: 1}}>
      <DetailHead>
        <Typography.Heading1
          style={{fontWeight: 'bold', fontSize: 22, marginBottom: 8}}
        >
          {name}{' '}
          <Typography.Body1 style={{color: theme.role.info}}>
            ({t('common.score')}: {Math.round(score * 100)})
          </Typography.Body1>
        </Typography.Heading1>
      </DetailHead>
      {description ? (
        <Typography.Body2 style={{marginBottom: 24, fontSize: 14}}>
          {description}
        </Typography.Body2>
      ) : null}
      <DetailBody>
        {statsElements?.map((el: StatsElement) => {
          if (!el.name) {
            return null;
          }

          const details: StatsDetail[] = el.details
            ? JSON.parse(el.details)
            : [];

          return ContentStatsDetails({
            details,
            statsElement: el,
          });
        })}
      </DetailBody>
    </View>
  );
};

export type Props = {
  json: DoobooGithubStats['json'];
  pluginStats: PluginStats;
  selectedStat?: StatType | null;
  onPressStat: (type: StatType | null) => void;
};

const CombatDetails = ({
  selectedStat = 'tree',
  pluginStats,
  onPressStat,
  json,
}: Props): ReactElement => {
  const stats: Stats =
    selectedStat === 'tree'
      ? pluginStats.tree
      : selectedStat === 'fire'
        ? pluginStats.fire
        : selectedStat === 'earth'
          ? pluginStats.earth
          : selectedStat === 'gold'
            ? pluginStats.gold
            : selectedStat === 'water'
              ? pluginStats.water
              : pluginStats.people;

  return (
    <Container>
      <StatIcons selectedStats={selectedStat} onPressStat={onPressStat} />
      <Details>
        <ContentDetailDescription
          stats={stats}
          selectedStats={selectedStat}
          json={json}
        />
      </Details>
    </Container>
  );
};

export default CombatDetails;
