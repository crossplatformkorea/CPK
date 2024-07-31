import {supabase} from '../supabase';
import {ImageInsertArgs, PostInsertArgs, PostWithJoins} from '../types';

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

  return data as unknown as PostWithJoins;
};

export const fetchPostPagination = async (
  page: number,
  pageSize: number,
): Promise<PostWithJoins[]> => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

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
    .order('created_at', {ascending: false})
    .filter('deleted_at', 'is', null)
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return data as unknown as PostWithJoins[];
};

export const fetchUpdatePost = async (
  postId: string,
  title: string,
  content: string,
  url: string | null,
): Promise<number> => {
  const {error, count} = await supabase
    .from('posts')
    .update({title, content, url})
    .eq('id', postId);

  if (error) {
    throw new Error(error.message);
  }

  return count || 0;
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
    .select()
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

  return data;
};
