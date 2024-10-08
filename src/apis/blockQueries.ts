import {SupabaseClient} from '../hooks/useSupabase';
import {User} from '../types';

export async function fetchBlockUser({
  authId,
  userId,
  supabase,
}: {
  authId: string;
  userId: string;
  supabase: SupabaseClient;
}) {
  const {data: existingBlock} = await supabase
    .from('blocks')
    .select('*')
    .eq('user_id', authId)
    .eq('block_user_id', userId)
    .single();

  if (existingBlock) {
    return existingBlock;
  }

  const {data: newBlock, error: insertError} = await supabase
    .from('blocks')
    .insert([
      {
        user_id: authId,
        block_user_id: userId,
      },
    ])
    .single();

  if (insertError) {
    throw new Error(insertError.message);
  }

  return newBlock;
}

export async function fetchUnblockUser({
  userId,
  blockUserId,
  supabase,
}: {
  userId: string;
  blockUserId: string;
  supabase: SupabaseClient;
}) {
  if (!userId) {
    throw new Error('ERR_NOT_AUTHORIZED');
  }

  const {data: deletedBlock, error: deleteError} = await supabase
    .from('blocks')
    .delete()
    .eq('user_id', userId)
    .eq('block_user_id', blockUserId)
    .single();

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  return deletedBlock;
}

export const fetchBlockUsersPagination = async ({
  userId,
  limit,
  cursor = new Date().toISOString(),
  supabase,
}: {
  userId: string;
  cursor?: string;
  limit: number;
  supabase: SupabaseClient;
}) => {
  if (!userId) {
    return [];
  }

  const {data, error} = await supabase
    .from('blocks')
    .select(
      `
      block_user: block_user_id (*)
    `,
    )
    .eq('user_id', userId)
    .order('created_at', {ascending: false})
    .limit(limit)
    .lt('created_at', cursor);

  if (error) {
    throw new Error(error.message);
  }

  return data.map((block) => block.block_user) as unknown as User[];
};

export const fetchBlockUserIds = async ({
  userId,
  supabase,
}: {
  userId: string;
  supabase: SupabaseClient;
}): Promise<string[]> => {
  const {data: blockedUsersData, error: blockedUsersError} = await supabase
    .from('blocks')
    .select('block_user_id')
    .eq('user_id', userId);

  if (blockedUsersError) {
    if (__DEV__) {
      console.error(blockedUsersError);
    }
    return [];
  }

  return blockedUsersData.map((block) => block.block_user_id as string);
};
