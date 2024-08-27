import {create} from 'zustand';
import {PostWithJoins} from '../types';
import {immer} from 'zustand/middleware/immer';
import { Dispatch, SetStateAction } from 'react';

/*
 * All Posts
 */
export const addPostsIfNotExists = (
  posts: PostWithJoins[],
  newPosts: PostWithJoins[],
) => {
  const existingPostIds = posts.map((post) => post.id);

  const uniqueNewPosts = newPosts.filter(
    (newPost) => !existingPostIds.includes(newPost.id),
  );

  return [...uniqueNewPosts, ...posts];
};

export const usePostsStore = create<{
  posts: PostWithJoins[];
  setPosts: Dispatch<SetStateAction<PostWithJoins[]>>;
  addPosts: (newPosts: PostWithJoins[]) => void;
}>()(
  immer((set) => ({
    posts: [],
    setPosts: (posts) =>
      set((state) => {
        state = {
          ...state,
          ...posts,
        };
      }),
    addPosts: (newPosts) =>
      set((state) => {
        state.posts = addPostsIfNotExists(state.posts, newPosts);
      }),
  })),
);
