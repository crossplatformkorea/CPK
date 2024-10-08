import {useEffect} from 'react';
import type {AppStateStatus} from 'react-native';
import {AppState} from 'react-native';

type AppStateChangeHandler = (state: AppStateStatus) => void;

/**
 * Custom hook for adding app state change event handler.
 * @param handler Callback function to handle app state change.
 */
export default function useAppState(handler: AppStateChangeHandler): void {
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handler);

    return (): void => {
      subscription.remove();
    };
  }, [handler]);
}
