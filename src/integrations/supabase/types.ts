export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      challenge_participants: {
        Row: {
          challenge_id: string
          contribution: number
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          contribution?: number
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          contribution?: number
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participants_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "clan_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      clan_challenges: {
        Row: {
          challenge_type: string
          clan_id: string
          created_at: string
          current_value: number
          description: string | null
          ends_at: string
          id: string
          is_completed: boolean
          reward_description: string | null
          reward_xp: number
          starts_at: string
          target_value: number
          title: string
        }
        Insert: {
          challenge_type?: string
          clan_id: string
          created_at?: string
          current_value?: number
          description?: string | null
          ends_at: string
          id?: string
          is_completed?: boolean
          reward_description?: string | null
          reward_xp?: number
          starts_at?: string
          target_value: number
          title: string
        }
        Update: {
          challenge_type?: string
          clan_id?: string
          created_at?: string
          current_value?: number
          description?: string | null
          ends_at?: string
          id?: string
          is_completed?: boolean
          reward_description?: string | null
          reward_xp?: number
          starts_at?: string
          target_value?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "clan_challenges_clan_id_fkey"
            columns: ["clan_id"]
            isOneToOne: false
            referencedRelation: "clans"
            referencedColumns: ["id"]
          },
        ]
      }
      clan_members: {
        Row: {
          clan_id: string | null
          id: string
          joined_at: string | null
          user_id: string | null
        }
        Insert: {
          clan_id?: string | null
          id?: string
          joined_at?: string | null
          user_id?: string | null
        }
        Update: {
          clan_id?: string | null
          id?: string
          joined_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clan_members_clan_id_fkey"
            columns: ["clan_id"]
            isOneToOne: false
            referencedRelation: "clans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clan_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clan_messages: {
        Row: {
          clan_id: string
          content: string
          created_at: string
          id: string
          message_type: string
          user_id: string | null
        }
        Insert: {
          clan_id: string
          content: string
          created_at?: string
          id?: string
          message_type?: string
          user_id?: string | null
        }
        Update: {
          clan_id?: string
          content?: string
          created_at?: string
          id?: string
          message_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clan_messages_clan_id_fkey"
            columns: ["clan_id"]
            isOneToOne: false
            referencedRelation: "clans"
            referencedColumns: ["id"]
          },
        ]
      }
      clans: {
        Row: {
          banner_url: string | null
          clan_level: number
          clan_streak: number
          clan_xp: number
          created_at: string | null
          created_by: string | null
          daily_goal_minutes: number
          description: string | null
          focus_tag: string | null
          icon_emoji: string | null
          id: string
          is_public: boolean
          name: string
        }
        Insert: {
          banner_url?: string | null
          clan_level?: number
          clan_streak?: number
          clan_xp?: number
          created_at?: string | null
          created_by?: string | null
          daily_goal_minutes?: number
          description?: string | null
          focus_tag?: string | null
          icon_emoji?: string | null
          id?: string
          is_public?: boolean
          name: string
        }
        Update: {
          banner_url?: string | null
          clan_level?: number
          clan_streak?: number
          clan_xp?: number
          created_at?: string | null
          created_by?: string | null
          daily_goal_minutes?: number
          description?: string | null
          focus_tag?: string | null
          icon_emoji?: string | null
          id?: string
          is_public?: boolean
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "clans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          icon: string | null
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_energy: string
          avatar_level: number
          avatar_type: string
          avatar_xp: number
          baseline_minutes: number
          best_streak: number
          created_at: string | null
          current_streak: number
          id: string
          last_sync_at: string | null
          total_reduction: number
          username: string
          weekly_average: number
        }
        Insert: {
          avatar_energy?: string
          avatar_level?: number
          avatar_type: string
          avatar_xp?: number
          baseline_minutes?: number
          best_streak?: number
          created_at?: string | null
          current_streak?: number
          id: string
          last_sync_at?: string | null
          total_reduction?: number
          username: string
          weekly_average?: number
        }
        Update: {
          avatar_energy?: string
          avatar_level?: number
          avatar_type?: string
          avatar_xp?: number
          baseline_minutes?: number
          best_streak?: number
          created_at?: string | null
          current_streak?: number
          id?: string
          last_sync_at?: string | null
          total_reduction?: number
          username?: string
          weekly_average?: number
        }
        Relationships: []
      }
      purchased_avatars: {
        Row: {
          avatar_type: string
          id: string
          purchased_at: string
          user_id: string
        }
        Insert: {
          avatar_type: string
          id?: string
          purchased_at?: string
          user_id: string
        }
        Update: {
          avatar_type?: string
          id?: string
          purchased_at?: string
          user_id?: string
        }
        Relationships: []
      }
      screen_time_entries: {
        Row: {
          actual_minutes: number | null
          better_buddy_minutes: number | null
          created_at: string | null
          date: string
          id: string
          music_minutes: number | null
          total_minutes: number
          user_id: string | null
        }
        Insert: {
          actual_minutes?: number | null
          better_buddy_minutes?: number | null
          created_at?: string | null
          date: string
          id?: string
          music_minutes?: number | null
          total_minutes: number
          user_id?: string | null
        }
        Update: {
          actual_minutes?: number | null
          better_buddy_minutes?: number | null
          created_at?: string | null
          date?: string
          id?: string
          music_minutes?: number | null
          total_minutes?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "screen_time_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_reduction: {
        Args: { actual: number; baseline: number }
        Returns: number
      }
      get_user_stats: {
        Args: { p_user_id: string }
        Returns: {
          best_streak: number
          current_streak: number
          total_reduction: number
          weekly_average: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
