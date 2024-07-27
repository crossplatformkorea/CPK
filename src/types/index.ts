import { Database } from "./supabase";

export type User = Database['public']['Tables']['users']['Row'];
export type Developer = Database['public']['Tables']['developers']['Row'];
export type Post = Database['public']['Tables']['posts']['Row'];
export type Reply = Database['public']['Tables']['replies']['Row'];
export type Image = Database['public']['Tables']['images']['Row'];