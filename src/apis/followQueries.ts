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

        await supabase
          .from('notifications')
          .delete()
          .eq('src_user_id', authId)
          .eq('user_id', followingId)
          .eq('type', 'UserFollowYou');

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

        const {error: notificationError} = await supabase
          .from('notifications')
          .insert({
            src_user_id: authId,
            user_id: followingId,
            type: 'UserFollowYou',
          });

        if (notificationError) {
          throw new Error(notificationError.message);
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

export async function fetchIsAFollowing({
  authId,
  followingId,
}: {
  authId: string;
  followingId: string;
}) {
  if (!authId) {
    throw new Error('ERR_NOT_AUTHORIZED');
  }

  if (authId === followingId) {
    return false;
  }

  try {
    const {data: followRecord, error: followError} = await supabase
      .from('follows')
      .select('id')
      .eq('user_id', authId)
      .eq('following_id', followingId)
      .single();

    if (followError && followError.code !== 'PGRST116') {
      if (__DEV__) {
        console.error(followError.message);
      }
      throw new Error(followError.message);
    }

    return followRecord !== null;
  } catch (err) {
    if (__DEV__) {
      console.error(err);
    }
    return false;
  }
}

export async function fetchFollowers({
  userId,
  cursor,
  limit = 10,
}: {
  userId: string;
  cursor?: string;
  limit?: number;
}) {
  if (!userId) {
    throw new Error('ERR_NOT_AUTHORIZED');
  }

  try {
    let query = supabase
      .from('follows')
      .select('user_id, created_at, user!inner(*)')
      .eq('following_id', userId)
      .order('created_at', {ascending: false})
      .limit(limit);

    if (cursor) {
      query = query.gt('created_at', cursor);
    }

    const {data: followers, error: followersError} = await query;

    if (followersError) {
      if (__DEV__) {
        console.error(followersError.message);
      }
      throw new Error(followersError.message);
    }

    const nextCursor =
      followers.length > 0 ? followers[followers.length - 1].created_at : null;

    return {followers: followers.map((f) => f.user), nextCursor};
  } catch (err) {
    if (__DEV__) {
      console.error(err);
    }
    return false;
  }
}

export async function fetchFollowings({
  userId,
  cursor,
  limit = 10,
}: {
  userId: string;
  cursor?: string;
  limit?: number;
}) {
  if (!userId) {
    throw new Error('ERR_NOT_AUTHORIZED');
  }

  try {
    let query = supabase
      .from('follows')
      .select('following_id, created_at, following!inner(*)')
      .eq('user_id', userId)
      .order('created_at', {ascending: false})
      .limit(limit);

    if (cursor) {
      query = query.gt('created_at', cursor);
    }

    const {data: followings, error: followingsError} = await query;

    if (followingsError) {
      if (__DEV__) {
        console.error(followingsError.message);
      }
      throw new Error(followingsError.message);
    }

    const nextCursor =
      followings.length > 0
        ? followings[followings.length - 1].created_at
        : null;

    return {followings: followings.map((f) => f.following), nextCursor};
  } catch (err) {
    if (__DEV__) {
      console.error(err);
    }
    return false;
  }
}

export async function fetchFollowCounts(
  userId: string,
): Promise<{followingCount: number; followerCount: number}> {
  if (!userId) {
    throw new Error('ERR_NOT_AUTHORIZED');
  }

  try {
    // Following count (user is following others)
    const {count: followingCount, error: followingError} = await supabase
      .from('follows')
      .select('id', {count: 'exact'})
      .eq('user_id', userId);

    if (followingError) {
      if (__DEV__) {
        console.error(followingError.message);
      }
      throw new Error(followingError.message);
    }

    // Follower count (others are following user)
    const {count: followerCount, error: followerError} = await supabase
      .from('follows')
      .select('id', {count: 'exact'})
      .eq('following_id', userId);

    if (followerError) {
      if (__DEV__) {
        console.error(followerError.message);
      }
      throw new Error(followerError.message);
    }

    return {
      followingCount: followingCount || 0,
      followerCount: followerCount || 0,
    };
  } catch (err: any) {
    if (__DEV__) {
      console.error(err);
    }
    return {
      followingCount: 0,
      followerCount: 0,
    };
  }
}
