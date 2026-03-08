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
          request_reason: string | null
          requested_by: string | null
          status: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          doctor_id: string
          id?: string
          patient_id: string
          request_reason?: string | null
          requested_by?: string | null
          status?: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          doctor_id?: string
          id?: string
          patient_id?: string
          request_reason?: string | null
          requested_by?: string | null
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
          symptoms: string[] | null
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
          symptoms?: string[] | null
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
          symptoms?: string[] | null
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
      exit_site_infections: {
        Row: {
          antibiotic: string | null
          created_at: string
          created_by: string
          culture_date: string | null
          date_onset: string
          duration_days: number | null
          id: string
          notes: string | null
          organism: string | null
          patient_id: string
          photo_urls: string[] | null
          progressed_to_peritonitis: boolean | null
          related_peritonitis_id: string | null
          resolution_date: string | null
          resolved: boolean | null
          route: string | null
          symptoms: string[] | null
          updated_at: string
        }
        Insert: {
          antibiotic?: string | null
          created_at?: string
          created_by: string
          culture_date?: string | null
          date_onset: string
          duration_days?: number | null
          id?: string
          notes?: string | null
          organism?: string | null
          patient_id: string
          photo_urls?: string[] | null
          progressed_to_peritonitis?: boolean | null
          related_peritonitis_id?: string | null
          resolution_date?: string | null
          resolved?: boolean | null
          route?: string | null
          symptoms?: string[] | null
          updated_at?: string
        }
        Update: {
          antibiotic?: string | null
          created_at?: string
          created_by?: string
          culture_date?: string | null
          date_onset?: string
          duration_days?: number | null
          id?: string
          notes?: string | null
          organism?: string | null
          patient_id?: string
          photo_urls?: string[] | null
          progressed_to_peritonitis?: boolean | null
          related_peritonitis_id?: string | null
          resolution_date?: string | null
          resolved?: boolean | null
          route?: string | null
          symptoms?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exit_site_infections_related_peritonitis_id_fkey"
            columns: ["related_peritonitis_id"]
            isOneToOne: false
            referencedRelation: "peritonitis_episodes"
            referencedColumns: ["id"]
          },
        ]
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
      pd_events: {
        Row: {
          created_at: string
          created_by: string
          event_date: string
          event_type: string
          id: string
          notes: string | null
          patient_id: string
          related_record_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          event_date: string
          event_type: string
          id?: string
          notes?: string | null
          patient_id: string
          related_record_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          event_date?: string
          event_type?: string
          id?: string
          notes?: string | null
          patient_id?: string
          related_record_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pd_settings: {
        Row: {
          batch_number: string | null
          brand: string | null
          catheter_insertion_date: string | null
          catheter_type: string | null
          created_at: string
          daily_exchanges: number | null
          dwell_time_hours: number | null
          fill_volume_ml: number | null
          hospital: string | null
          id: string
          modality: string | null
          patient_id: string
          placement_method: string | null
          solution_type: string | null
          surgeon_nephrologist: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          batch_number?: string | null
          brand?: string | null
          catheter_insertion_date?: string | null
          catheter_type?: string | null
          created_at?: string
          daily_exchanges?: number | null
          dwell_time_hours?: number | null
          fill_volume_ml?: number | null
          hospital?: string | null
          id?: string
          modality?: string | null
          patient_id: string
          placement_method?: string | null
          solution_type?: string | null
          surgeon_nephrologist?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          batch_number?: string | null
          brand?: string | null
          catheter_insertion_date?: string | null
          catheter_type?: string | null
          created_at?: string
          daily_exchanges?: number | null
          dwell_time_hours?: number | null
          fill_volume_ml?: number | null
          hospital?: string | null
          id?: string
          modality?: string | null
          patient_id?: string
          placement_method?: string | null
          solution_type?: string | null
          surgeon_nephrologist?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      peritonitis_antibiotics: {
        Row: {
          created_at: string
          dose: string | null
          drug_name: string
          episode_id: string
          frequency: string | null
          id: string
          reason_for_change: string | null
          route: string
          start_date: string
          stop_date: string | null
        }
        Insert: {
          created_at?: string
          dose?: string | null
          drug_name: string
          episode_id: string
          frequency?: string | null
          id?: string
          reason_for_change?: string | null
          route: string
          start_date: string
          stop_date?: string | null
        }
        Update: {
          created_at?: string
          dose?: string | null
          drug_name?: string
          episode_id?: string
          frequency?: string | null
          id?: string
          reason_for_change?: string | null
          route?: string
          start_date?: string
          stop_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "peritonitis_antibiotics_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "peritonitis_episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      peritonitis_cultures: {
        Row: {
          colony_count: string | null
          created_at: string
          culture_date: string
          episode_id: string
          gram_type: string | null
          id: string
          notes: string | null
          organism: string | null
          sample_type: string | null
          sensitivity: Json | null
        }
        Insert: {
          colony_count?: string | null
          created_at?: string
          culture_date: string
          episode_id: string
          gram_type?: string | null
          id?: string
          notes?: string | null
          organism?: string | null
          sample_type?: string | null
          sensitivity?: Json | null
        }
        Update: {
          colony_count?: string | null
          created_at?: string
          culture_date?: string
          episode_id?: string
          gram_type?: string | null
          id?: string
          notes?: string | null
          organism?: string | null
          sample_type?: string | null
          sensitivity?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "peritonitis_cultures_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "peritonitis_episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      peritonitis_episodes: {
        Row: {
          catheter_removed: boolean | null
          classification: string | null
          clearance_wbc_below_100: boolean | null
          clinical_response: string | null
          created_at: string
          created_by: string
          culture_negative_on_clearance: boolean | null
          culture_result: string | null
          date_onset: string
          death: boolean | null
          definitive_antibiotic: string | null
          duration_days: number | null
          effluent_clearance_date: string | null
          effluent_wbc: number | null
          empiric_antibiotic_start_date: string | null
          empiric_regimen: string | null
          eosinophil_percent: number | null
          episode_number: number
          gram_stain_result: string | null
          id: string
          neutrophil_percent: number | null
          notes: string | null
          organism: string | null
          patient_id: string
          presenting_symptoms: string[] | null
          removal_date: string | null
          route: string | null
          switch_to_hd: boolean | null
          symptoms_resolved: boolean | null
          updated_at: string
        }
        Insert: {
          catheter_removed?: boolean | null
          classification?: string | null
          clearance_wbc_below_100?: boolean | null
          clinical_response?: string | null
          created_at?: string
          created_by: string
          culture_negative_on_clearance?: boolean | null
          culture_result?: string | null
          date_onset: string
          death?: boolean | null
          definitive_antibiotic?: string | null
          duration_days?: number | null
          effluent_clearance_date?: string | null
          effluent_wbc?: number | null
          empiric_antibiotic_start_date?: string | null
          empiric_regimen?: string | null
          eosinophil_percent?: number | null
          episode_number?: number
          gram_stain_result?: string | null
          id?: string
          neutrophil_percent?: number | null
          notes?: string | null
          organism?: string | null
          patient_id: string
          presenting_symptoms?: string[] | null
          removal_date?: string | null
          route?: string | null
          switch_to_hd?: boolean | null
          symptoms_resolved?: boolean | null
          updated_at?: string
        }
        Update: {
          catheter_removed?: boolean | null
          classification?: string | null
          clearance_wbc_below_100?: boolean | null
          clinical_response?: string | null
          created_at?: string
          created_by?: string
          culture_negative_on_clearance?: boolean | null
          culture_result?: string | null
          date_onset?: string
          death?: boolean | null
          definitive_antibiotic?: string | null
          duration_days?: number | null
          effluent_clearance_date?: string | null
          effluent_wbc?: number | null
          empiric_antibiotic_start_date?: string | null
          empiric_regimen?: string | null
          eosinophil_percent?: number | null
          episode_number?: number
          gram_stain_result?: string | null
          id?: string
          neutrophil_percent?: number | null
          notes?: string | null
          organism?: string | null
          patient_id?: string
          presenting_symptoms?: string[] | null
          removal_date?: string | null
          route?: string | null
          switch_to_hd?: boolean | null
          symptoms_resolved?: boolean | null
          updated_at?: string
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
