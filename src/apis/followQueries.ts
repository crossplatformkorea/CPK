import {supabase} from '../supabase';

export async function fetchFollowUser({
  authId,
  followingId,
  follow,
}: {
  authId: string;
  followingId: string;
  follow: boolean;
}) {
  if (!authId) {
    throw new Error('ERR_NOT_AUTHORIZED');
  }

  if (authId === followingId) {
    return null;
  }

  try {
    const {data: prevFollow, error: prevFollowError} = await supabase
      .from('follows')
      .select('id')
      .eq('user_id', authId)
      .eq('following_id', followingId)
      .single();

    if (prevFollowError && prevFollowError.code !== 'PGRST116') {
      if (__DEV__) {
        console.error(prevFollowError.message);
      }
    }

    if (prevFollow) {
      if (follow) {
        const {data: updatedFollow, error: updateError} = await supabase
          .from('follows')
          .update({
            user_id: authId,
            following_id: followingId,
          })
          .eq('id', prevFollow.id)
          .select('*')
          .single();

        if (updateError) {
          throw new Error(updateError.message);
        }

        return updatedFollow;
      } else {
        const {data: deletedFollow, error: deleteError} = await supabase
          .from('follows')
          .delete()
          .eq('id', prevFollow.id)
          .select('*')
          .single();

        if (deleteError) {
          throw new Error(deleteError.message);
        }

        return deletedFollow;
      }
    } else {
      if (follow) {
        const {data: newFollow, error: createError} = await supabase
          .from('follows')
          .insert({
            user_id: authId,
            following_id: followingId,
          })
          .select('*')
          .single();

        if (createError) {
          throw new Error(createError.message);
        }

        return newFollow;
      }
    }
  } catch (err) {
    if (__DEV__) {
      console.error(err);
    }

    return false;
  }
}
