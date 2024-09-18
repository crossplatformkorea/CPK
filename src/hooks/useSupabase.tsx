import {useSession} from '@clerk/clerk-expo';
import {createClient} from '@supabase/supabase-js';
import {useEffect, useState} from 'react';
import {Database} from '../types/supabase';
import {supabaseAnonKey, supabaseUrl} from '../../config';
import {ActiveSessionResource} from '@clerk/types';
import {useSetRecoilState} from 'recoil';
import {authRecoilState} from '../recoil/atoms';

export type SupabaseClient = ReturnType<typeof createClient<Database>>;

function createClerkSupabaseClient(
  session?: ActiveSessionResource | null,
): SupabaseClient | null {
  if (!session) return null;

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      // Get the custom Supabase token from Clerk
      fetch: async (url, options = {}) => {
        const clerkToken = await session?.getToken({
          template: 'supabase',
        });

        // Insert the Clerk Supabase token into the headers
        const headers = new Headers(options?.headers);
        headers.set('Authorization', `Bearer ${clerkToken}`);

        return fetch(url, {
          ...options,
          headers,
        });
      },
    },
  });
}

export default function useSupabase(): {supabase: SupabaseClient | null} {
  const {session} = useSession();
  const setAuth = useSetRecoilState(authRecoilState);

  const [supabase, setSupabase] = useState(() =>
    createClerkSupabaseClient(session),
  );

  useEffect(() => {
    if (!session) {
      setAuth({
        authId: null,
        user: null,
        blockedUserIds: [],
        pushToken: null,
        tags: [],
      });
    }

    setSupabase(createClerkSupabaseClient(session));
  }, [session, setAuth]);

  return {supabase};
}
