import type {Dispatch, SetStateAction} from 'react';
import {useState} from 'react';
import {css} from '@emotion/native';
import {useActionSheet} from '@expo/react-native-action-sheet';
import {useRecoilValue, useSetRecoilState} from 'recoil';

import {authRecoilState, reportModalRecoilState} from '../recoil/atoms';
import {t} from '../STRINGS';
import {fetchBlockUser} from '../apis/blockQueries';
import {fetchCreateReport} from '../apis/reportQueries';
import useSupabase from '../hooks/useSupabase';
import {Button, useCPK} from 'cpk-ui';
import createCtx from '../utils/createCtx';

type PeerContentActionProps = {
  userId: string;
  onCompleted?: (type: 'block' | 'report') => void;
};

type UserContentActionProps = {
  onDelete?: () => void;
  onUpdate?: () => void;
};

interface Context {
  handlePeerContentAction: ({onCompleted}: PeerContentActionProps) => void;
  handleUserContentAction: ({
    onDelete,
    onUpdate,
  }: UserContentActionProps) => void;
  setServerVersion: Dispatch<SetStateAction<string>>;
  serverVersion: string;
}

const [useCtx, Provider] = createCtx<Context>();

interface Props {
  children?: JSX.Element;
}

function AppLogicProvider({children}: Props): JSX.Element {
  const {authId} = useRecoilValue(authRecoilState);
  const {showActionSheetWithOptions} = useActionSheet();
  const {alertDialog, snackbar} = useCPK();
  const setReportModalState = useSetRecoilState(reportModalRecoilState);
  const setAuthState = useSetRecoilState(authRecoilState);
  const [isCreateReportInFlight, setIsCreateReportInFlight] = useState(false);
  const {supabase} = useSupabase();

  const handlePeerContentAction = async ({
    userId,
    onCompleted,
  }: PeerContentActionProps): Promise<void> => {
    const destructiveButtonIndex = 0;
    const cancelButtonIndex = 2;

    const handleBlockUser = async () => {
      if (!userId || !authId || !supabase) {
        return;
      }

      setIsCreateReportInFlight(true);

      try {
        await fetchBlockUser({authId, userId, supabase});
        snackbar.open({text: t('common.blockUserSuccess')});

        setAuthState((prev) => ({
          ...prev,
          blockedUserIds: [...prev.blockedUserIds, userId],
        }));

        onCompleted?.('block');
      } catch (err) {
        snackbar.open({text: t('error.default')});

        if (__DEV__) {
          console.error(err);
        }
      } finally {
        setIsCreateReportInFlight(false);
      }
    };

    const handleReport = async (content: string): Promise<void> => {
      if (!content || !userId || !authId || !supabase) {
        return;
      }

      await fetchCreateReport({
        supabase,
        report: {
          content,
          src_user_id: authId,
          title: t('common.reportSubject', {subject: t('common.user')}),
          user_id: userId,
        },
      });

      snackbar.open({
        text: t('common.reportSuccess'),
      });

      onCompleted?.('report');
    };

    showActionSheetWithOptions(
      {
        options: [t('common.report'), t('common.block'), t('common.cancel')],
        cancelButtonIndex,
        destructiveButtonIndex,
      },
      async (selectedIndex?: number) => {
        switch (selectedIndex) {
          case 1:
            alertDialog.open({
              title: t('common.blockUser', {
                user: t('common.user'),
              }),
              body: t('common.blockUserDesc'),
              closeOnTouchOutside: false,
              actions: [
                <Button
                  color="light"
                  key="button-light"
                  onPress={() => alertDialog.close()}
                  styles={{
                    container: css`
                      height: 48px;
                    `,
                  }}
                  text={t('common.cancel')}
                />,
                <Button
                  color="danger"
                  key="button-danger"
                  onPress={() => {
                    alertDialog.close();
                    handleBlockUser();
                  }}
                  styles={{
                    container: css`
                      height: 48px;
                    `,
                  }}
                  text={t('common.block')}
                />,
              ],
            });
            break;

          case destructiveButtonIndex:
            setReportModalState({
              visible: true,
              subject: t('common.user'),
              loading: isCreateReportInFlight,
              onReport: (content) => handleReport(content),
            });
            break;
        }
      },
    );
  };

  const handleUserContentAction = ({
    onUpdate,
    onDelete,
  }: UserContentActionProps): void => {
    const options = [];
    const indices = {update: -1, delete: -1, cancel: -1};

    if (onUpdate) {
      indices.update = options.length;
      options.push(t('common.update'));
    }
    if (onDelete) {
      indices.delete = options.length;
      options.push(t('common.delete'));
    }

    indices.cancel = options.length;
    options.push(t('common.cancel'));

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex: indices.cancel,
        destructiveButtonIndex:
          indices.delete !== -1 ? indices.delete : undefined,
      },
      async (selectedIndex?: number) => {
        switch (selectedIndex) {
          case indices.update:
            onUpdate?.();
            break;
          case indices.delete:
            onDelete?.();
            break;
        }
      },
    );
  };

  const [serverVersion, setServerVersion] = useState<string>('');

  return (
    <Provider
      value={{
        handlePeerContentAction,
        handleUserContentAction,
        serverVersion,
        setServerVersion,
      }}
    >
      {children}
    </Provider>
  );
}

export {useCtx as useAppLogic, AppLogicProvider};
