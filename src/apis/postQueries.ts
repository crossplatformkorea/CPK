import {supabase} from '../supabase';
import {ImageInsertArgs, PostInsertArgs, PostWithJoins} from '../types';
import {PAGE_SIZE} from '../utils/constants';

const filterDeletedImageInPost = (post: PostWithJoins): PostWithJoins => {
  return {
    ...post,
    images: post.images.filter((image) => !image.deleted_at),
  };
};

const filterDeletedImagesInPosts = (
  posts: PostWithJoins[],
): PostWithJoins[] => {
  return posts.map((post) => {
    return filterDeletedImageInPost(post);
  });
};

export const fetchPostById = async (
  id: string,
): Promise<PostWithJoins | null> => {
  const {data, error} = await supabase
    .from('posts')
    .select(
      `
      *,
      user:user_id (
        *
      ),
      images (*),
      replies (
        id
      ),
      likes (*)
    `,
    )
    .eq('id', id)
    .single();

  if (error) {
    if (__DEV__) console.error('Error fetching post by ID:', error);
    return null;
  }

  return filterDeletedImageInPost(data as unknown as PostWithJoins);
};

export const fetchPostPagination = async ({
  cursor = new Date().toISOString(),
  limit = PAGE_SIZE,
  blockedUserIds = [],
}: {
  cursor: string | undefined;
  blockedUserIds?: string[];
  limit?: number;
}): Promise<PostWithJoins[]> => {
  const {data, error} = await supabase
    .from('posts')
    .select(
      `
        *,
        user:user_id (*),
        images (*),
        replies (
          id
        ),
        likes (*)
      `,
    )
    .is('deleted_at', null)
    .order('created_at', {ascending: false})
    .limit(limit)
    .lt('created_at', cursor);

  if (error) {
    if (__DEV__) {
      console.error(error.message);
    }

    return [];
  }

  const filteredPosts = data.filter(
    (post) => !blockedUserIds.includes(post.user_id),
  );

  return filterDeletedImagesInPosts(
    filteredPosts as unknown as PostWithJoins[],
  );
};

export const fetchUpdatePost = async ({
  postId,
  title,
  content,
  url,
  images,
  imageUrlsToDelete,
}: {
  postId: string;
  title: string;
  content: string;
  url: string | null;
  images: ImageInsertArgs[];
  imageUrlsToDelete: string[];
}): Promise<PostWithJoins> => {
  const {data: post, error: updateError} = await supabase
    .from('posts')
    .update({title, content, url})
    .eq('id', postId)
    .select(
      `
      *,
      user:user_id (
        *
      ),
      images (*),
      replies (
        id
      ),
      likes (*)
    `,
    )
    .single();

  if (updateError) {
    throw new Error(updateError.message);
  }

  if (imageUrlsToDelete.length > 0) {
    await supabase
      .from('images')
      .update({deleted_at: new Date().toISOString()})
      .in('image_url', imageUrlsToDelete);
  }

  if (images && images.length > 0) {
    const imageInsertPromises = images.map((image) =>
      supabase.from('images').insert({
        ...image,
        post_id: post.id,
      }),
    );

    await Promise.all(imageInsertPromises);
  }

  return post as unknown as PostWithJoins;
};

export const fetchDeletePost = async ({
  id,
  softDelete = true,
}: {
  id: string;
  softDelete?: boolean;
}): Promise<boolean> => {
  if (softDelete) {
    const {error} = await supabase
      .from('posts')
      .update({deleted_at: new Date().toISOString()})
      .eq('id', id);

    if (error) {
      if (__DEV__) console.error('Error deleting post:', error);
      throw new Error(error.message);
    }

    const {error: imageError} = await supabase
      .from('images')
      .update({deleted_at: new Date().toISOString()})
      .eq('post_id', id);

    if (imageError) {
      if (__DEV__) console.error('Error deleting images:', imageError);
      throw new Error(imageError.message);
    }

    return true;
  }

  const {error} = await supabase.from('posts').delete().eq('id', id);

  if (error) {
    if (__DEV__) console.error('Error deleting post:', error);
    throw new Error(error.message);
  }

  return true;
};

export const fetchCreatePost = async (
  post: PostInsertArgs & {images?: ImageInsertArgs[]},
) => {
  const {data, error} = await supabase
    .from('posts')
    .insert({
      title: post.title,
      content: post.content,
      url: post.url,
      user_id: post.user_id,
    })
    .select(
      `
      *,
      user:user_id (
        *
      ),
      images (*),
      replies (
        id
      ),
      likes (*)
    `,
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (post.images && post.images.length > 0) {
    const imageInsertPromises = post.images.map((image) =>
      supabase.from('images').insert({
        ...image,
        post_id: data.id,
      }),
    );

    await Promise.all(imageInsertPromises);
  }

  return data as unknown as PostWithJoins;
};

/*
CREATE OR REPLACE FUNCTION increment_view_count(post_id uuid)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE posts SET view_count = view_count + 1 WHERE id = post_id;
END;
*/
export const incrementViewCount = async (postId: string) => {
  //@ts-ignore
  const {data, error} = await supabase.rpc('increment_view_count', {
    post_id: postId,
  });

  if (error) {
    console.error('Error incrementing view count:', error);
    return null;
  }

  return data;
};
