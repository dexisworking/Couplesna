export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      couples: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          next_meet_date: string | null;
          distance_apart_km: number | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          next_meet_date?: string | null;
          distance_apart_km?: number | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          next_meet_date?: string | null;
          distance_apart_km?: number | null;
        };
        Relationships: [];
      };
      couple_invites: {
        Row: {
          id: string;
          sender_profile_id: string;
          receiver_profile_id: string;
          status: 'pending' | 'accepted' | 'declined' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          sender_profile_id: string;
          receiver_profile_id: string;
          status?: 'pending' | 'accepted' | 'declined' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          sender_profile_id?: string;
          receiver_profile_id?: string;
          status?: 'pending' | 'accepted' | 'declined' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      couple_members: {
        Row: {
          id: string;
          couple_id: string;
          profile_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          couple_id: string;
          profile_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          couple_id?: string;
          profile_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      couple_notes: {
        Row: {
          id: string;
          couple_id: string;
          profile_id: string;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          couple_id: string;
          profile_id: string;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          couple_id?: string;
          profile_id?: string;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      gallery_albums: {
        Row: {
          id: string;
          couple_id: string;
          slug: string;
          title: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          couple_id: string;
          slug: string;
          title: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          couple_id?: string;
          slug?: string;
          title?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      gallery_images: {
        Row: {
          id: string;
          album_id: string;
          couple_id: string;
          storage_path: string;
          caption_hint: string | null;
          created_by_profile_id: string;
          created_at: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          album_id: string;
          couple_id: string;
          storage_path: string;
          caption_hint?: string | null;
          created_by_profile_id: string;
          created_at?: string;
          sort_order?: number;
        };
        Update: {
          id?: string;
          album_id?: string;
          couple_id?: string;
          storage_path?: string;
          caption_hint?: string | null;
          created_by_profile_id?: string;
          created_at?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          username: string | null;
          avatar_url: string | null;
          location: Json | null;
          details: Json | null;
          media: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          username?: string | null;
          avatar_url?: string | null;
          location?: Json | null;
          details?: Json | null;
          media?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          username?: string | null;
          avatar_url?: string | null;
          location?: Json | null;
          details?: Json | null;
          media?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      invite_status: 'pending' | 'accepted' | 'declined' | 'cancelled';
    };
    CompositeTypes: Record<string, never>;
  };
};
