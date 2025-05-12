export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          created_at: string
          email: string
          name: string | null
          subscription_status: string | null
          subscription_end_date: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          email: string
          name?: string | null
          subscription_status?: string | null
          subscription_end_date?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          name?: string | null
          subscription_status?: string | null
          subscription_end_date?: string | null
        }
      }
      testimonials: {
        Row: {
          id: string
          created_at: string
          user_id: string
          content: string
          school: string | null
          region: string | null
          is_anonymous: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          content: string
          school?: string | null
          region?: string | null
          is_anonymous?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          content?: string
          school?: string | null
          region?: string | null
          is_anonymous?: boolean
        }
      }
    }
  }
} 