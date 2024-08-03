import {Database} from './supabase';

export type User = Database['public']['Tables']['users']['Row'];
export type OmitDeveloper = Database['public']['Tables']['developers']['Row'];
export type Post = Database['public']['Tables']['posts']['Row'];
export type Reply = Database['public']['Tables']['replies']['Row'];
export type Image = Database['public']['Tables']['images']['Row'];
export type FileType = Database['public']['Enums']['FileType'];
export type Like = Database['public']['Tables']['likes']['Row'];

export type PostWithJoins = Post & {
  user: User;
  images: Image[];
  likes: Like[];
  replies: {id: string}[];
};

export type ReplyWithJoins = Reply & {
  user: User;
  images?: Image[];
  likes: Like[];
};

// Args
export type UserInsertArgs = Database['public']['Tables']['users']['Insert'];
export type UserUpdateArgs = Database['public']['Tables']['users']['Update'];
export type DeveloperInsertArgs =
  Database['public']['Tables']['developers']['Insert'];
export type DeveloperUpdateArgs =
  Database['public']['Tables']['developers']['Update'];
export type PostInsertArgs = Database['public']['Tables']['posts']['Insert'];
export type PostUpdateArgs = Database['public']['Tables']['posts']['Update'];
export type ReplyInsertArgs = Database['public']['Tables']['replies']['Insert'];
export type ReplyUpdateArgs = Database['public']['Tables']['replies']['Update'];
export type ImageInsertArgs = Database['public']['Tables']['images']['Insert'];
export type ImageUpdateArgs = Database['public']['Tables']['images']['Update'];
export type ReportInsertArgs = Database['public']['Tables']['reports']['Insert'];