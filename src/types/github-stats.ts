export type StatsDetail =
  | {
      type: 'repository';
      name: string;
      url: string;
    }
  | {
      type: 'language';
      name: string;
      count: number;
    }
  | {
      type: 'commit';
      name: string;
      message: string;
      comment_count: number;
      sha: string;
      score: number;
      author: string;
      url: string;
    };

export type StatsElement = {
  key: string;
  name: string;
  description: string;
  totalCount: number;
  details?: string;
};

export type Stats = {
  description: string;
  icon: string;
  id: string;
  name: string;
  score: number;
  statElements: StatsElement[];
};

export type Plugin = {
  name: string;
  apiURL: string;
  description?: string;
  json?: any[];
};

export type TierType = {
  tier: string;
  score: number;
};

export type PluginStats = {
  earth: Stats;
  fire: Stats;
  gold: Stats;
  people: Stats;
  tree: Stats;
  water: Stats;
  dooboo: Stats;
};

export type DoobooGithubStats = {
  json: {
    login: string;
    avatarUrl?: string;
    bio?: string;
    score?: number;
    languages?: {name: string; color: string; size: number}[];
  };
  plugin: Plugin;
  pluginStats: PluginStats;
};

export type StatType = 'tree' | 'fire' | 'earth' | 'gold' | 'water' | 'people';

export type StatsElementType = {
  key: string;
  name: string;
  description: string;
  totalCount: number;
  details: string;
};

export type StatsElements = {
  tree: StatsElementType[];
  fire: StatsElementType[];
  earth: StatsElementType[];
  gold: StatsElementType[];
  water: StatsElementType[];
  people: StatsElementType[];
};

export type ContentDetailDescProps = {
  json: DoobooGithubStats['json'];
  stats: Stats;
  selectedStats: StatType | null;
};
