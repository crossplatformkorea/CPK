import {supabase} from '../supabase';
import {ImageInsertArgs, ReplyInsertArgs, ReplyWithJoins} from '../types';
import {PAGE_SIZE} from '../utils/constants';

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
}: {
  cursor: string | undefined;
  limit?: number;
  postId: string;
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

export const fetchReplyById = async (
  id: string,
): Promise<ReplyWithJoins | null> => {
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
}: {
  reply: ReplyInsertArgs;
  images?: ImageInsertArgs[];
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

  if (imagesArg && imagesArg.length > 0) {
    const imageInsertPromises = imagesArg.map((image) =>
      supabase.from('images').insert({
        ...image,
        reply_id: reply.id,
      }),
    );

    await Promise.all(imageInsertPromises);
  }

  return filterDeletedImageInReply(reply as unknown as ReplyWithJoins);
};
