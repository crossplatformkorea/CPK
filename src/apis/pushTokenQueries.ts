import {Platform} from 'react-native';
import {SupabaseClient} from '../hooks/useSupabase';

export async function fetchAddPushToken({
  authId,
  expoPushToken,
  supabase,
}: {
  authId: string;
  expoPushToken: string;
  supabase: SupabaseClient;
}) {
  const {data: existingToken} = await supabase
    .from('push_tokens')
    .select('*')
    .eq('user_id', authId)
    .eq('token', expoPushToken)
    .single();

  if (existingToken) {
    return existingToken;
  }

  const {data: newToken, error: insertError} = await supabase
    .from('push_tokens')
    .upsert({
      token: expoPushToken,
      user_id: authId,
      platform: Platform.OS,
    });

  if (insertError) {
    if (__DEV__) {
      console.error(insertError);
    }
  }

  return newToken;
}

export async function fetchDeletePushToken({
  authId,
  expoPushToken,
  supabase,
}: {
  authId: string;
  expoPushToken: string;
  supabase: SupabaseClient;
}) {
  const {data: deletedToken, error: deleteError} = await supabase
    .from('push_tokens')
    .delete()
    .eq('user_id', authId)
    .eq('token', expoPushToken)
    .single();

  if (deleteError) {
    if (__DEV__) {
      console.error(deleteError);
    }
  }

  return deletedToken;
}

export async function fetchPushTokens({
  userId,
  supabase,
}: {
  userId: string;
  supabase: SupabaseClient;
}) {
  const {data: tokens, error} = await supabase
    .from('push_tokens')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    if (__DEV__) {
      console.error(error);
    }
    return [];
  }

  return tokens;
}
