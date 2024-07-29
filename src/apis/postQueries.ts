import {supabase} from '../supabase';
import {PostWithUser} from '../types';

export const fetchPostById = async (
  id: string,
): Promise<PostWithUser | null> => {
  const {data, error} = await supabase
    .from('posts')
    .select(
      `
      *,
      user:user_id (
        *
      )
    `,
    )
    .eq('id', id)
    .single();

  if (error) {
    if (__DEV__) console.error('Error fetching post by ID:', error);
    return null;
  }

  return data as unknown as PostWithUser;
};

export const fetchPostPagination = async (
  page: number,
  pageSize: number,
): Promise<PostWithUser[]> => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const {data, error} = await supabase
    .from('posts')
    .select(
      `
      *,
      user:user_id (
        *
      )
    `,
    )
    .order('created_at', {ascending: false})
    .filter('deleted_at', 'is', null)
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return data as unknown as PostWithUser[];
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
