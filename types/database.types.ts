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
      documents: {
        Row: {
          id: string
          user_id: string
          file_path: string
          original_filename: string
          extracted_text: string | null
          uploaded_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          file_path: string
          original_filename: string
          extracted_text?: string | null
          uploaded_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          file_path?: string
          original_filename?: string
          extracted_text?: string | null
          uploaded_at?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

