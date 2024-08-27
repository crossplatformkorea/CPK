import {Dispatch, SetStateAction} from 'react';
import {create} from 'zustand';
import {immer} from 'zustand/middleware/immer';
import {ReportModalProps} from '../components/modals/ReportModal';

type ReportModalAction = {
  setVisible: Dispatch<SetStateAction<boolean>>;
  setState: Dispatch<SetStateAction<ReportModalProps>>;
};

export type ReportModalStoreType = ReportModalProps & ReportModalAction;

const initialState: ReportModalProps = {
  visible: false,
  setVisible: () => {},
};

export const useReportModal = create<ReportModalStoreType>()(
  immer((set) => ({
    ...initialState,
    setVisible: (visible) =>
      set((state) => {
        state.setVisible = visible;
      }),
    setState: (input) =>
      set((prev) => {
        prev = {
          ...prev,
          ...input,
        };
      }),
  })),
);
