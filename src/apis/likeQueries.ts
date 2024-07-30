import {supabase} from '../supabase';

export async function toggleLike({
  userId,
  replyId,
  postId,
}: {
  userId: string;
  replyId?: string;
  postId?: string;
}) {
  if (!replyId && !postId) {
    throw new Error('Either replyId or postId must be provided');
  }

  const likeType = replyId ? {reply_id: replyId} : {post_id: postId!};

  const {data: existingLike, error: fetchError} = await supabase
    .from('likes')
    .select('liked')
    .eq('user_id', userId)
    .eq(replyId ? 'reply_id' : 'post_id', replyId ? replyId : postId!)
    .single();

  if (fetchError && !fetchError.details.includes('0 rows')) {
    throw new Error(fetchError.message);
  }

  if (existingLike) {
    const {error: deleteError} = await supabase
      .from('likes')
      .delete()
      .eq('user_id', userId)
      .eq(replyId ? 'reply_id' : 'post_id', replyId ? replyId : postId!);

    if (deleteError) {
      throw new Error(deleteError.message);
    }
  } else {
    const {error: insertError} = await supabase.from('likes').insert({
      user_id: userId,
      liked: true,
      ...likeType,
    });

    if (insertError) {
      throw new Error(insertError.message);
    }
  }
}
