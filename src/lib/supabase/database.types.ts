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
      passkey_challenges: {
        Row: {
          id: string;
          admin_user_id: string;
          challenge: string;
          type: 'registration' | 'authentication';
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_user_id: string;
          challenge: string;
          type: 'registration' | 'authentication';
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_user_id?: string;
          challenge?: string;
          type?: 'registration' | 'authentication';
          created_at?: string;
        };
        Relationships: [];
      };
      passkey_credentials: {
        Row: {
          credential_id: string;
          admin_user_id: string;
          credential_public_key: string;
          counter: number;
          transports: string[];
          created_at: string;
        };
        Insert: {
          credential_id: string;
          admin_user_id: string;
          credential_public_key: string;
          counter?: number;
          transports?: string[];
          created_at?: string;
        };
        Update: {
          credential_id?: string;
          admin_user_id?: string;
          credential_public_key?: string;
          counter?: number;
          transports?: string[];
          created_at?: string;
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
          role: 'user' | 'admin' | null;
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
          role?: 'user' | 'admin' | null;
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
          role?: 'user' | 'admin' | null;
          location?: Json | null;
          details?: Json | null;
          media?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      system_logs: {
        Row: {
          id: string;
          user_id: string | null;
          event_type: string;
          description: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          event_type: string;
          description?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          event_type?: string;
          description?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      admin_otps: {
        Row: {
          id: string;
          admin_id: string;
          code: string;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_id: string;
          code: string;
          expires_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_id?: string;
          code?: string;
          expires_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      invite_status: 'pending' | 'accepted' | 'declined' | 'cancelled';
      user_role: 'user' | 'admin';
    };
    CompositeTypes: Record<string, never>;
  };
};
