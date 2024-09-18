import {SupabaseClient} from '../hooks/useSupabase';
import {t} from '../STRINGS';
import {
  ImageInsertArgs,
  NotificationInsertArgs,
  NotificationType,
  ReplyInsertArgs,
  ReplyWithJoins,
} from '../types';
import {PAGE_SIZE} from '../utils/constants';
import {sendNotificationsToPostUsers} from './notifications';

const filterDeletedImageInReply = (reply: ReplyWithJoins): ReplyWithJoins => {
  return {
    ...reply,
    images: reply.images?.filter((image) => !image.deleted_at),
  };
};

const filterDeletedImagesInReplies = (
  replies: ReplyWithJoins[],
): ReplyWithJoins[] => {
  return replies.map((reply) => {
    return filterDeletedImageInReply(reply);
  });
};

export const fetchReplyPagination = async ({
  cursor = new Date().toISOString(),
  limit = PAGE_SIZE,
  postId,
  supabase,
}: {
  cursor: string | undefined;
  limit?: number;
  postId: string;
  supabase: SupabaseClient;
}): Promise<ReplyWithJoins[]> => {
  const {data, error} = await supabase
    .from('replies')
    .select(
      `
      *,
      user:user_id (*),
      images (*),
      likes (*)
    `,
    )
    .eq('post_id', postId)
    .is('deleted_at', null)
    .order('created_at', {ascending: false})
    .limit(limit)
    .lt('created_at', cursor);

  if (error) {
    throw new Error(error.message);
  }

  return filterDeletedImagesInReplies(data as unknown as ReplyWithJoins[]);
};

export const fetchReplyById = async ({
  id,
  supabase,
}: {
  id: string;
  supabase: SupabaseClient;
}): Promise<ReplyWithJoins | null> => {
  const {data, error} = await supabase
    .from('replies')
    .select(
      `
      *,
      user:user_id (*),
      images (*),
      likes (*)
    `,
    )
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching reply by ID:', error);
    return null;
  }

  return filterDeletedImageInReply(data as unknown as ReplyWithJoins);
};

export const fetchCreateReply = async ({
  reply: replyArg,
  images: imagesArg = [],
  supabase,
}: {
  reply: ReplyInsertArgs;
  images?: ImageInsertArgs[];
  supabase: SupabaseClient;
}): Promise<ReplyWithJoins> => {
  const {message, user_id, post_id, reply_id} = replyArg;

  const {data: reply, error: replyError} = await supabase
    .from('replies')
    .insert({
      message,
      user_id,
      post_id,
      reply_id,
    })
    .select(
      `
      *,
      user:user_id (*),
      images (*),
      likes (*)
    `,
    )
    .single();

  if (replyError) {
    throw new Error(replyError.message);
  }

  // If images are provided, insert them
  if (imagesArg && imagesArg.length > 0) {
    const imageInsertPromises = imagesArg.map((image) =>
      supabase.from('images').insert({
        ...image,
        reply_id: reply.id,
      }),
    );

    await Promise.all(imageInsertPromises);
  }

  // If post_id exists, fetch the post information and send notifications
  if (post_id) {
    const {data: post, error: postError} = await supabase
      .from('posts')
      .select('title, user_id') // Fetch the title and post owner ID
      .eq('id', post_id)
      .single();

    if (postError) {
      if (__DEV__) console.error('Error fetching post:', postError);
    }

    const title = post?.title || '';

    // Send notifications to other users following the post
    const userIds = await sendNotificationsToPostUsers({
      supabase,
      postId: post_id,
      body: message,
      title: title && t('common.newReplyOnTitle', {title}),
      data: {replyId: reply.id, postId: post_id},
    });

    if (userIds && userIds.length > 0) {
      // Prepare the data for batch insert
      const notificationsData = userIds
        .filter((userId) => userId !== user_id) // Exclude the user who created the reply
        .map(
          (userId) =>
            ({
              src_user_id: user_id, // ID of the user who created the reply
              user_id: userId, // ID of the user who will receive the notification
              type: 'NewCommentInPost' as NotificationType,
              post_id: post_id,
              link: `/posts/${post_id}`,
            }) as NotificationInsertArgs,
        );

      // Perform the batch insert
      try {
        await supabase.from('notifications').insert(notificationsData);
      } catch (e) {
        if (__DEV__) console.error('Error inserting notifications:', e);
      }
    }
  }

  return filterDeletedImageInReply(reply as unknown as ReplyWithJoins);
};
