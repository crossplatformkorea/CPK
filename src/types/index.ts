import {Database} from './supabase';

export type User = Database['public']['Tables']['users']['Row'];
export type Post = Database['public']['Tables']['posts']['Row'];
export type Reply = Database['public']['Tables']['replies']['Row'];
export type Image = Database['public']['Tables']['images']['Row'];
export type FileType = Database['public']['Enums']['FileType'];
export type Like = Database['public']['Tables']['likes']['Row'];
export type Tag = Database['public']['Tables']['tags']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
export type NotificationType = Database['public']['Enums']['activity_type'];

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
export type PostInsertArgs = Database['public']['Tables']['posts']['Insert'];
export type PostUpdateArgs = Database['public']['Tables']['posts']['Update'];
export type ReplyInsertArgs = Database['public']['Tables']['replies']['Insert'];
export type ReplyUpdateArgs = Database['public']['Tables']['replies']['Update'];
export type ImageInsertArgs = Database['public']['Tables']['images']['Insert'];
export type ImageUpdateArgs = Database['public']['Tables']['images']['Update'];
export type ReportInsertArgs =
  Database['public']['Tables']['reports']['Insert'];
export type TagInsertArgs = Database['public']['Tables']['tags']['Insert'];
export type NotificationInsertArgs =
  Database['public']['Tables']['notifications']['Insert'];

export type TokenCache = {
  getToken: (key: string) => Promise<string | undefined | null>;
  saveToken: (key: string, token: string) => Promise<void>;
  clearToken?: (key: string) => void;
};
