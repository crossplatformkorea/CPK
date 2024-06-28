import {ROOT_URL} from '../../config';

export const sample = async (
  body: Record<string, unknown>,
  signal?: AbortController['signal'],
): Promise<Response> => {
  const fetchOption: RequestInit = {
    signal,
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };

  try {
    const res: Response = await fetch(`${ROOT_URL}/sample`, fetchOption);

    return res;
  } catch (err: any) {
    throw new Error(err);
  }
};
