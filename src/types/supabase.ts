export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      _DeveloperToTag: {
        Row: {
          A: string
          B: string
        }
        Insert: {
          A: string
          B: string
        }
        Update: {
          A?: string
          B?: string
        }
        Relationships: [
          {
            foreignKeyName: "_DeveloperToTag_A_fkey"
            columns: ["A"]
            isOneToOne: false
            referencedRelation: "developers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "_DeveloperToTag_B_fkey"
            columns: ["B"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      _PostToTag: {
        Row: {
          A: string
          B: string
        }
        Insert: {
          A: string
          B: string
        }
        Update: {
          A?: string
          B?: string
        }
        Relationships: [
          {
            foreignKeyName: "_PostToTag_A_fkey"
            columns: ["A"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "_PostToTag_B_fkey"
            columns: ["B"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      _prisma_migrations: {
        Row: {
          applied_steps_count: number
          checksum: string
          finished_at: string | null
          id: string
          logs: string | null
          migration_name: string
          rolled_back_at: string | null
          started_at: string
        }
        Insert: {
          applied_steps_count?: number
          checksum: string
          finished_at?: string | null
          id: string
          logs?: string | null
          migration_name: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Update: {
          applied_steps_count?: number
          checksum?: string
          finished_at?: string | null
          id?: string
          logs?: string | null
          migration_name?: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Relationships: []
      }
      developers: {
        Row: {
          bio: string | null
          created_at: string | null
          deleted_at: string | null
          desired_connection: string | null
          email: string | null
          future_expectations: string | null
          github_id: string | null
          id: string
          meetup_id: string | null
          motivation_for_event_participation: string | null
          nationality: string | null
          organization: string | null
          threads_id: string | null
          twitter_id: string | null
          user_id: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          deleted_at?: string | null
          desired_connection?: string | null
          email?: string | null
          future_expectations?: string | null
          github_id?: string | null
          id?: string
          meetup_id?: string | null
          motivation_for_event_participation?: string | null
          nationality?: string | null
          organization?: string | null
          threads_id?: string | null
          twitter_id?: string | null
          user_id?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          deleted_at?: string | null
          desired_connection?: string | null
          email?: string | null
          future_expectations?: string | null
          github_id?: string | null
          id?: string
          meetup_id?: string | null
          motivation_for_event_participation?: string | null
          nationality?: string | null
          organization?: string | null
          threads_id?: string | null
          twitter_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "developers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      images: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          duration: number | null
          encoding: string | null
          exif: string | null
          height: number | null
          id: string
          image_url: string | null
          mime_type: string | null
          name: string | null
          post_id: string | null
          reply_id: string | null
          size: number | null
          thumb_url: string | null
          type: Database["public"]["Enums"]["FileType"] | null
          updated_at: string | null
          url: string | null
          width: number | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          duration?: number | null
          encoding?: string | null
          exif?: string | null
          height?: number | null
          id?: string
          image_url?: string | null
          mime_type?: string | null
          name?: string | null
          post_id?: string | null
          reply_id?: string | null
          size?: number | null
          thumb_url?: string | null
          type?: Database["public"]["Enums"]["FileType"] | null
          updated_at?: string | null
          url?: string | null
          width?: number | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          duration?: number | null
          encoding?: string | null
          exif?: string | null
          height?: number | null
          id?: string
          image_url?: string | null
          mime_type?: string | null
          name?: string | null
          post_id?: string | null
          reply_id?: string | null
          size?: number | null
          thumb_url?: string | null
          type?: Database["public"]["Enums"]["FileType"] | null
          updated_at?: string | null
          url?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "images_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "images_reply_id_fkey"
            columns: ["reply_id"]
            isOneToOne: false
            referencedRelation: "replies"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          id: string
          liked: boolean
          post_id: string | null
          reply_id: string | null
          user_id: string
        }
        Insert: {
          id?: string
          liked: boolean
          post_id?: string | null
          reply_id?: string | null
          user_id: string
        }
        Update: {
          id?: string
          liked?: boolean
          post_id?: string | null
          reply_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_reply_id_fkey"
            columns: ["reply_id"]
            isOneToOne: false
            referencedRelation: "replies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          link: string | null
          post_id: string | null
          replyId: string | null
          src_user_id: string
          type: Database["public"]["Enums"]["activity_type"]
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          link?: string | null
          post_id?: string | null
          replyId?: string | null
          src_user_id: string
          type: Database["public"]["Enums"]["activity_type"]
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          link?: string | null
          post_id?: string | null
          replyId?: string | null
          src_user_id?: string
          type?: Database["public"]["Enums"]["activity_type"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_replyId_fkey"
            columns: ["replyId"]
            isOneToOne: false
            referencedRelation: "replies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_src_user_id_fkey"
            columns: ["src_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string
          created_at: string | null
          deleted_at: string | null
          id: string
          title: string
          updated_at: string | null
          url: string | null
          user_id: string
          view_count: number | null
        }
        Insert: {
          content: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          title: string
          updated_at?: string | null
          url?: string | null
          user_id: string
          view_count?: number | null
        }
        Update: {
          content?: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          title?: string
          updated_at?: string | null
          url?: string | null
          user_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      replies: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string
          message: string
          post_id: string | null
          reply_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          message: string
          post_id?: string | null
          reply_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          message?: string
          post_id?: string | null
          reply_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "replies_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "replies_reply_id_fkey"
            columns: ["reply_id"]
            isOneToOne: false
            referencedRelation: "replies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "replies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          content: string
          created_at: string | null
          id: string
          post_id: string | null
          reply_id: string | null
          src_user_id: string
          title: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          post_id?: string | null
          reply_id?: string | null
          src_user_id: string
          title: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string | null
          reply_id?: string | null
          src_user_id?: string
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reply_id_fkey"
            columns: ["reply_id"]
            isOneToOne: false
            referencedRelation: "replies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_src_user_id_fkey"
            columns: ["src_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          id: string
          tag: string
        }
        Insert: {
          id?: string
          tag: string
        }
        Update: {
          id?: string
          tag?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          birthday: string | null
          confirmed_at: string | null
          created_at: string | null
          deleted_at: string | null
          description: string | null
          email: string | null
          email_confirmed_at: string | null
          full_name: string | null
          gender: Database["public"]["Enums"]["Gender"] | null
          id: string
          last_sign_in_at: string | null
          locale: string | null
          name: string | null
          phone: string | null
          phone_verified: boolean | null
          provider: Database["public"]["Enums"]["AuthType"]
          provider_id: string | null
          sub: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          birthday?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          email?: string | null
          email_confirmed_at?: string | null
          full_name?: string | null
          gender?: Database["public"]["Enums"]["Gender"] | null
          id?: string
          last_sign_in_at?: string | null
          locale?: string | null
          name?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          provider?: Database["public"]["Enums"]["AuthType"]
          provider_id?: string | null
          sub?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          birthday?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          email?: string | null
          email_confirmed_at?: string | null
          full_name?: string | null
          gender?: Database["public"]["Enums"]["Gender"] | null
          id?: string
          last_sign_in_at?: string | null
          locale?: string | null
          name?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          provider?: Database["public"]["Enums"]["AuthType"]
          provider_id?: string | null
          sub?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      activity_type:
        | "Like"
        | "UserFollowYou"
        | "FollowingFollowUser"
        | "FollowingCreatePost"
        | "NewReplyInComment"
        | "NewCommentInPost"
      AuthType: "email" | "google" | "apple"
      FileType: "Audio" | "Video" | "Document" | "Image"
      Gender: "male" | "female" | "intersex"
      Nationality: "SouthKorea" | "UnitedStates" | "Unknown"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
