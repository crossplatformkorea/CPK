import {supabase} from '../supabase';

export async function fetchBlockUser({
  authId,
  userId,
}: {
  authId: string;
  userId: string;
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

export async function fetchUnblockUser(userId: string, blockUserId: string) {
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

export const fetchBlockUsersPagination = async (
  userId: string,
  page: number,
  pageSize: number,
) => {
  if (!userId) {
    return [];
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const {data, error} = await supabase
    .from('blocks')
    .select(
      `
      block_user: block_user_id (*)
    `,
    )
    .eq('user_id', userId)
    .order('created_at', {ascending: false})
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return data.map((block) => block.block_user);
};

export const fetchBlockUserIds = async (userId: string): Promise<string[]> => {
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

  return blockedUsersData.map((block) => block.block_user_id);
};
