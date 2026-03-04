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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          created_at: string
          id: string
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      doctor_patient_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          doctor_id: string
          id: string
          patient_id: string
          status: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          doctor_id: string
          id?: string
          patient_id: string
          status?: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          doctor_id?: string
          id?: string
          patient_id?: string
          status?: string
        }
        Relationships: []
      }
      exchange_logs: {
        Row: {
          blood_pressure_diastolic: number | null
          blood_pressure_systolic: number | null
          created_at: string
          drain_color: string | null
          drain_volume_ml: number | null
          dwell_end: string | null
          dwell_start: string
          exchange_type: string
          fill_volume_ml: number
          id: string
          notes: string | null
          pain_level: number | null
          patient_id: string
          recorded_by: string
          solution_type: string
          temperature: number | null
          ultrafiltration_ml: number | null
          updated_at: string
          weight_after_kg: number | null
          weight_before_kg: number | null
        }
        Insert: {
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          created_at?: string
          drain_color?: string | null
          drain_volume_ml?: number | null
          dwell_end?: string | null
          dwell_start: string
          exchange_type: string
          fill_volume_ml: number
          id?: string
          notes?: string | null
          pain_level?: number | null
          patient_id: string
          recorded_by: string
          solution_type: string
          temperature?: number | null
          ultrafiltration_ml?: number | null
          updated_at?: string
          weight_after_kg?: number | null
          weight_before_kg?: number | null
        }
        Update: {
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          created_at?: string
          drain_color?: string | null
          drain_volume_ml?: number | null
          dwell_end?: string | null
          dwell_start?: string
          exchange_type?: string
          fill_volume_ml?: number
          id?: string
          notes?: string | null
          pain_level?: number | null
          patient_id?: string
          recorded_by?: string
          solution_type?: string
          temperature?: number | null
          ultrafiltration_ml?: number | null
          updated_at?: string
          weight_after_kg?: number | null
          weight_before_kg?: number | null
        }
        Relationships: []
      }
      exchange_plans: {
        Row: {
          created_at: string
          effective_from: string
          effective_until: string | null
          exchanges: Json
          id: string
          is_active: boolean | null
          notes: string | null
          patient_id: string
          plan_name: string
          prescribed_by: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          effective_from?: string
          effective_until?: string | null
          exchanges?: Json
          id?: string
          is_active?: boolean | null
          notes?: string | null
          patient_id: string
          plan_name: string
          prescribed_by: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          effective_from?: string
          effective_until?: string | null
          exchanges?: Json
          id?: string
          is_active?: boolean | null
          notes?: string | null
          patient_id?: string
          plan_name?: string
          prescribed_by?: string
          updated_at?: string
        }
        Relationships: []
      }
      lab_results: {
        Row: {
          albumin: number | null
          bun: number | null
          calcium: number | null
          created_at: string
          creatinine: number | null
          entered_by: string
          glucose: number | null
          hemoglobin: number | null
          id: string
          kt_v: number | null
          notes: string | null
          patient_id: string
          pet_result: string | null
          phosphorus: number | null
          potassium: number | null
          sodium: number | null
          test_date: string
          test_type: string
          updated_at: string
          verified_by: string | null
        }
        Insert: {
          albumin?: number | null
          bun?: number | null
          calcium?: number | null
          created_at?: string
          creatinine?: number | null
          entered_by: string
          glucose?: number | null
          hemoglobin?: number | null
          id?: string
          kt_v?: number | null
          notes?: string | null
          patient_id: string
          pet_result?: string | null
          phosphorus?: number | null
          potassium?: number | null
          sodium?: number | null
          test_date: string
          test_type: string
          updated_at?: string
          verified_by?: string | null
        }
        Update: {
          albumin?: number | null
          bun?: number | null
          calcium?: number | null
          created_at?: string
          creatinine?: number | null
          entered_by?: string
          glucose?: number | null
          hemoglobin?: number | null
          id?: string
          kt_v?: number | null
          notes?: string | null
          patient_id?: string
          pet_result?: string | null
          phosphorus?: number | null
          potassium?: number | null
          sodium?: number | null
          test_date?: string
          test_type?: string
          updated_at?: string
          verified_by?: string | null
        }
        Relationships: []
      }
      pd_settings: {
        Row: {
          catheter_insertion_date: string | null
          catheter_type: string | null
          created_at: string
          daily_exchanges: number | null
          dwell_time_hours: number | null
          fill_volume_ml: number | null
          id: string
          modality: string | null
          patient_id: string
          solution_type: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          catheter_insertion_date?: string | null
          catheter_type?: string | null
          created_at?: string
          daily_exchanges?: number | null
          dwell_time_hours?: number | null
          fill_volume_ml?: number | null
          id?: string
          modality?: string | null
          patient_id: string
          solution_type?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          catheter_insertion_date?: string | null
          catheter_type?: string | null
          created_at?: string
          daily_exchanges?: number | null
          dwell_time_hours?: number | null
          fill_volume_ml?: number | null
          id?: string
          modality?: string | null
          patient_id?: string
          solution_type?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string
          date_of_birth: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          full_name: string
          hospital: string | null
          id: string
          language: string
          phone: string | null
          specialization: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name: string
          hospital?: string | null
          id?: string
          language?: string
          phone?: string | null
          specialization?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string
          hospital?: string | null
          id?: string
          language?: string
          phone?: string | null
          specialization?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "patient" | "doctor" | "caregiver" | "admin" | "coordinator"
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
    Enums: {
      app_role: ["patient", "doctor", "caregiver", "admin", "coordinator"],
    },
  },
} as const
