import styled, {css} from '@emotion/native';
import {useEffect, useState} from 'react';
import {DoobooGithubStats} from '../../types/github-stats';
import {updateDoobooGithub} from '../../apis/githubStatsQueries';
import Scouter from '../uis/Scouter';
import {User} from '../../types';
import CustomLoadingIndicator from '../uis/CustomLoadingIndicator';

const Container = styled.View``;

type Props = {
  user: User | null;
};

export default function DoobooStats({user}: Props): JSX.Element | null {
  const [doobooStats, setDoobooStats] = useState<DoobooGithubStats | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGithubStats = async () => {
      try {
        if (!user?.github_id) {
          return;
        }
        const result = await updateDoobooGithub(user!.github_id!);

        if (!!result?.stats) {
          setDoobooStats(result.stats);
        }
      } catch (e: any) {
        setError(e.message);
      }
    };

    if (!!user?.github_id) {
      fetchGithubStats();
    }
  }, [user, user?.github_id]);

  if (error) {
    return null;
  }

  return (
    <Container>
      {doobooStats ? (
        <Scouter doobooStats={doobooStats} githubLogin={user?.github_id} />
      ) : (
        <CustomLoadingIndicator
          style={css`
            padding: 48px;
            background-color: transparent;
          `}
        />
      )}
    </Container>
  );
}
