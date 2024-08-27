import type {Dispatch, SetStateAction} from 'react';
import InputModal from './common/InputModal';
import {t} from '../../STRINGS';

type ReportCommon = {
  visible: boolean;
  setVisible?: Dispatch<SetStateAction<boolean>>;
  loading?: boolean;
  onReport?: (content: string) => void;
};

export type ReportModalProps = ReportCommon &
  (
    | {
        visible: true;
        subject: string;
      }
    | {
        visible: false;
      }
  );

export default function ReportModal(props: ReportModalProps): JSX.Element {
  const {visible, setVisible, loading, onReport} = props;

  return (
    <InputModal
      loading={loading}
      maxLength={200}
      numberOfLines={6}
      onCancel={() => setVisible?.(false)}
      onConfirm={(message) => {
        setVisible?.(false);
        onReport?.(message);
      }}
      setOpened={setVisible}
      textInputProps={{textAlignVertical: 'top'}}
      // eslint-disable-next-line react/destructuring-assignment
      title={t('common.reportSubject', {subject: visible ? props.subject : ''})}
      visible={visible}
    />
  );
}
