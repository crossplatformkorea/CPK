// import {Platform} from 'react-native';
// import * as Sentry from 'sentry-expo';

type ErrorWithMessage = {
  message: string;
};

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) {
    return maybeError;
  }

  try {
    return new Error(JSON.stringify(maybeError));
  } catch {
    // fallback in case there's an error
    // like with circular references for example.
    return new Error(String(maybeError));
  }
}

export const handleErrorConsole = (
  error: unknown,
  // componentStack?: string,
): string => {
  const errorMessage = toErrorWithMessage(error).message;

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.error(errorMessage);
  }

  // if (Platform.OS === 'web') {
  //   Sentry.Browser.captureException(error, {});
  // } else {
  //   Sentry.Native.captureException(error, {});
  // }

  return errorMessage;
};
