import {SupabaseClient} from '../hooks/useSupabase';
import {ImageInsertArgs, PostInsertArgs, PostWithJoins} from '../types';
import {PAGE_SIZE} from '../utils/constants';
import {sendNotificationsToAllUsers} from './notifications';

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

export const fetchPostById = async ({
  id,
  supabase,
}: {
  id: string;
  supabase: SupabaseClient;
}): Promise<PostWithJoins | null> => {
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
        id,
        deleted_at
      ),
      likes (*)
    `,
    )
    .eq('id', id)
    .filter('replies.deleted_at', 'is', null)
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
  supabase,
}: {
  cursor: string | undefined;
  blockedUserIds?: string[];
  limit?: number;
  supabase: SupabaseClient;
}): Promise<PostWithJoins[]> => {
  const {data, error} = await supabase
    .from('posts')
    .select(
      `
        *,
        user:user_id (*),
        images (*),
        replies (
          id,
          deleted_at
        ),
        likes (*)
      `,
    )
    .is('deleted_at', null)
    .filter('replies.deleted_at', 'is', null)
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
  supabase,
}: {
  postId: string;
  title: string;
  content: string;
  url: string | null;
  images: ImageInsertArgs[];
  imageUrlsToDelete: string[];
  supabase: SupabaseClient;
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
      replies (
        id,
        deleted_at
      ),
      likes (*)
    `,
    )
    .single();

  if (updateError) {
    throw new Error(updateError.message);
  }

  if (imageUrlsToDelete.length > 0) {
    const {error: deleteError} = await supabase
      .from('images')
      .update({deleted_at: new Date().toISOString()})
      .in('image_url', imageUrlsToDelete);

    if (deleteError) {
      throw new Error(deleteError.message);
    }
  }

  if (images && images.length > 0) {
    const imageInsertPromises = images.map((image) =>
      supabase.from('images').insert({
        ...image,
        post_id: postId,
      }),
    );

    const imageInsertResults = await Promise.all(imageInsertPromises);

    imageInsertResults.forEach(({error}) => {
      if (error) {
        throw new Error(error.message);
      }
    });
  }

  const {data: updatedImages, error: fetchImagesError} = await supabase
    .from('images')
    .select('*')
    .eq('post_id', postId)
    .is('deleted_at', null);

  if (fetchImagesError) {
    throw new Error(fetchImagesError.message);
  }

  const postWithImages = {
    ...post,
    images: updatedImages,
  };

  return postWithImages as unknown as PostWithJoins;
};

export const fetchDeletePost = async ({
  id,
  softDelete = true,
  supabase,
}: {
  id: string;
  softDelete?: boolean;
  supabase: SupabaseClient;
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

export const fetchCreatePost = async ({
  post,
  supabase,
}: {
  post: PostInsertArgs & {images?: ImageInsertArgs[]};
  supabase: SupabaseClient;
}) => {
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
      replies (
        id,
        deleted_at
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

  const {data: images, error: imagesError} = await supabase
    .from('images')
    .select('*')
    .eq('post_id', data.id);

  if (imagesError) {
    throw new Error(imagesError.message);
  }

  const postWithImages = {
    ...data,
    images,
  };

  sendNotificationsToAllUsers({
    title: post.title,
    body: post.content,
    supabase,
  });

  return postWithImages as unknown as PostWithJoins;
};

/*
CREATE OR REPLACE FUNCTION increment_view_count(post_id uuid)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE posts SET view_count = view_count + 1 WHERE id = post_id;
END;
*/
export const incrementViewCount = async ({
  postId,
  supabase,
}: {
  postId: string;
  supabase: SupabaseClient;
}) => {
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
