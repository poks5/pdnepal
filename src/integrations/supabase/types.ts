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
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      caregiver_patient_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          caregiver_id: string
          id: string
          patient_id: string
          relationship: string | null
          status: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          caregiver_id: string
          id?: string
          patient_id: string
          relationship?: string | null
          status?: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          caregiver_id?: string
          id?: string
          patient_id?: string
          relationship?: string | null
          status?: string
        }
        Relationships: []
      }
      centers: {
        Row: {
          address: string | null
          code: string
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          code: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          code?: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      clinical_alerts: {
        Row: {
          acknowledged: boolean
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: string
          created_at: string
          details: string | null
          doctor_id: string | null
          expires_at: string | null
          id: string
          message: string
          patient_id: string
          related_record_id: string | null
          severity: string
          title: string
        }
        Insert: {
          acknowledged?: boolean
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type: string
          created_at?: string
          details?: string | null
          doctor_id?: string | null
          expires_at?: string | null
          id?: string
          message: string
          patient_id: string
          related_record_id?: string | null
          severity?: string
          title: string
        }
        Update: {
          acknowledged?: boolean
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string
          created_at?: string
          details?: string | null
          doctor_id?: string | null
          expires_at?: string | null
          id?: string
          message?: string
          patient_id?: string
          related_record_id?: string | null
          severity?: string
          title?: string
        }
        Relationships: []
      }
      dietician_patient_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          dietician_id: string
          id: string
          patient_id: string
          request_reason: string | null
          requested_by: string | null
          status: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          dietician_id: string
          id?: string
          patient_id: string
          request_reason?: string | null
          requested_by?: string | null
          status?: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          dietician_id?: string
          id?: string
          patient_id?: string
          request_reason?: string | null
          requested_by?: string | null
          status?: string
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
      drug_catalog: {
        Row: {
          category: string
          common_doses: string[] | null
          created_at: string
          drug_name: string
          id: string
          is_active: boolean
          route_options: string[] | null
        }
        Insert: {
          category?: string
          common_doses?: string[] | null
          created_at?: string
          drug_name: string
          id?: string
          is_active?: boolean
          route_options?: string[] | null
        }
        Update: {
          category?: string
          common_doses?: string[] | null
          created_at?: string
          drug_name?: string
          id?: string
          is_active?: boolean
          route_options?: string[] | null
        }
        Relationships: []
      }
      exchange_additives: {
        Row: {
          additive_type: string
          created_at: string
          dose: string | null
          drug_name: string | null
          exchange_log_id: string
          id: string
          patient_id: string
          reason: string | null
          route: string | null
        }
        Insert: {
          additive_type?: string
          created_at?: string
          dose?: string | null
          drug_name?: string | null
          exchange_log_id: string
          id?: string
          patient_id: string
          reason?: string | null
          route?: string | null
        }
        Update: {
          additive_type?: string
          created_at?: string
          dose?: string | null
          drug_name?: string | null
          exchange_log_id?: string
          id?: string
          patient_id?: string
          reason?: string | null
          route?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exchange_additives_exchange_log_id_fkey"
            columns: ["exchange_log_id"]
            isOneToOne: false
            referencedRelation: "exchange_logs"
            referencedColumns: ["id"]
          },
        ]
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
          fbs: number | null
          glucose: number | null
          hba1c: number | null
          hemoglobin: number | null
          id: string
          ipth: number | null
          kt_v: number | null
          lymphocyte: number | null
          neutrophil: number | null
          notes: string | null
          patient_id: string
          peritoneal_fluid_report_url: string | null
          pet_result: string | null
          pet_test_report_url: string | null
          phosphorus: number | null
          platelets: number | null
          potassium: number | null
          pp: number | null
          rbs: number | null
          sodium: number | null
          tc: number | null
          test_date: string
          test_type: string
          updated_at: string
          uric_acid: number | null
          verified_by: string | null
        }
        Insert: {
          albumin?: number | null
          bun?: number | null
          calcium?: number | null
          created_at?: string
          creatinine?: number | null
          entered_by: string
          fbs?: number | null
          glucose?: number | null
          hba1c?: number | null
          hemoglobin?: number | null
          id?: string
          ipth?: number | null
          kt_v?: number | null
          lymphocyte?: number | null
          neutrophil?: number | null
          notes?: string | null
          patient_id: string
          peritoneal_fluid_report_url?: string | null
          pet_result?: string | null
          pet_test_report_url?: string | null
          phosphorus?: number | null
          platelets?: number | null
          potassium?: number | null
          pp?: number | null
          rbs?: number | null
          sodium?: number | null
          tc?: number | null
          test_date: string
          test_type: string
          updated_at?: string
          uric_acid?: number | null
          verified_by?: string | null
        }
        Update: {
          albumin?: number | null
          bun?: number | null
          calcium?: number | null
          created_at?: string
          creatinine?: number | null
          entered_by?: string
          fbs?: number | null
          glucose?: number | null
          hba1c?: number | null
          hemoglobin?: number | null
          id?: string
          ipth?: number | null
          kt_v?: number | null
          lymphocyte?: number | null
          neutrophil?: number | null
          notes?: string | null
          patient_id?: string
          peritoneal_fluid_report_url?: string | null
          pet_result?: string | null
          pet_test_report_url?: string | null
          phosphorus?: number | null
          platelets?: number | null
          potassium?: number | null
          pp?: number | null
          rbs?: number | null
          sodium?: number | null
          tc?: number | null
          test_date?: string
          test_type?: string
          updated_at?: string
          uric_acid?: number | null
          verified_by?: string | null
        }
        Relationships: []
      }
      learning_assignments: {
        Row: {
          assigned_at: string
          doctor_id: string
          id: string
          module_id: string
          notes: string | null
          patient_id: string
        }
        Insert: {
          assigned_at?: string
          doctor_id: string
          id?: string
          module_id: string
          notes?: string | null
          patient_id: string
        }
        Update: {
          assigned_at?: string
          doctor_id?: string
          id?: string
          module_id?: string
          notes?: string | null
          patient_id?: string
        }
        Relationships: []
      }
      learning_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string
          id: string
          module_id: string
          quiz_score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          module_id: string
          quiz_score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          module_id?: string
          quiz_score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      medication_logs: {
        Row: {
          created_at: string
          dose: string | null
          drug_name: string
          id: string
          patient_id: string
          peritonitis_episode_id: string | null
          reason: string | null
          route: string
          taken_at: string
        }
        Insert: {
          created_at?: string
          dose?: string | null
          drug_name: string
          id?: string
          patient_id: string
          peritonitis_episode_id?: string | null
          reason?: string | null
          route?: string
          taken_at?: string
        }
        Update: {
          created_at?: string
          dose?: string | null
          drug_name?: string
          id?: string
          patient_id?: string
          peritonitis_episode_id?: string | null
          reason?: string | null
          route?: string
          taken_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medication_logs_peritonitis_episode_id_fkey"
            columns: ["peritonitis_episode_id"]
            isOneToOne: false
            referencedRelation: "peritonitis_episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachment_type: string | null
          attachment_url: string | null
          content: string
          conversation_id: string | null
          conversation_type: string
          created_at: string
          id: string
          is_read: boolean
          message_type: string
          patient_id: string
          read_at: string | null
          recipient_id: string
          sender_id: string
          tag: string | null
          updated_at: string
        }
        Insert: {
          attachment_type?: string | null
          attachment_url?: string | null
          content: string
          conversation_id?: string | null
          conversation_type?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message_type?: string
          patient_id: string
          read_at?: string | null
          recipient_id: string
          sender_id: string
          tag?: string | null
          updated_at?: string
        }
        Update: {
          attachment_type?: string | null
          attachment_url?: string | null
          content?: string
          conversation_id?: string | null
          conversation_type?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message_type?: string
          patient_id?: string
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
          tag?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      patient_achievements: {
        Row: {
          achievement_type: string
          created_at: string
          description: string | null
          earned_at: string
          icon: string | null
          id: string
          metadata: Json | null
          patient_id: string
          title: string
        }
        Insert: {
          achievement_type?: string
          created_at?: string
          description?: string | null
          earned_at?: string
          icon?: string | null
          id?: string
          metadata?: Json | null
          patient_id: string
          title: string
        }
        Update: {
          achievement_type?: string
          created_at?: string
          description?: string | null
          earned_at?: string
          icon?: string | null
          id?: string
          metadata?: Json | null
          patient_id?: string
          title?: string
        }
        Relationships: []
      }
      pd_catheters: {
        Row: {
          catheter_brand: string | null
          catheter_type: string | null
          created_at: string
          created_by: string
          exit_site_orientation: string | null
          first_use_date: string | null
          id: string
          insertion_date: string
          insertion_technique: string | null
          is_current: boolean | null
          notes: string | null
          omentopexy: boolean | null
          patient_id: string
          reason_for_removal: string | null
          removal_date: string | null
          surgeon: string | null
          updated_at: string
        }
        Insert: {
          catheter_brand?: string | null
          catheter_type?: string | null
          created_at?: string
          created_by: string
          exit_site_orientation?: string | null
          first_use_date?: string | null
          id?: string
          insertion_date: string
          insertion_technique?: string | null
          is_current?: boolean | null
          notes?: string | null
          omentopexy?: boolean | null
          patient_id: string
          reason_for_removal?: string | null
          removal_date?: string | null
          surgeon?: string | null
          updated_at?: string
        }
        Update: {
          catheter_brand?: string | null
          catheter_type?: string | null
          created_at?: string
          created_by?: string
          exit_site_orientation?: string | null
          first_use_date?: string | null
          id?: string
          insertion_date?: string
          insertion_technique?: string | null
          is_current?: boolean | null
          notes?: string | null
          omentopexy?: boolean | null
          patient_id?: string
          reason_for_removal?: string | null
          removal_date?: string | null
          surgeon?: string | null
          updated_at?: string
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
      pd_fluid_usage: {
        Row: {
          created_at: string
          created_by: string
          end_date: string | null
          exchanges_per_day: number | null
          fluid_type: string
          glucose_strength: string | null
          id: string
          is_current: boolean | null
          notes: string | null
          patient_id: string
          start_date: string
          updated_at: string
          volume_ml: number | null
        }
        Insert: {
          created_at?: string
          created_by: string
          end_date?: string | null
          exchanges_per_day?: number | null
          fluid_type: string
          glucose_strength?: string | null
          id?: string
          is_current?: boolean | null
          notes?: string | null
          patient_id: string
          start_date: string
          updated_at?: string
          volume_ml?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string
          end_date?: string | null
          exchanges_per_day?: number | null
          fluid_type?: string
          glucose_strength?: string | null
          id?: string
          is_current?: boolean | null
          notes?: string | null
          patient_id?: string
          start_date?: string
          updated_at?: string
          volume_ml?: number | null
        }
        Relationships: []
      }
      pd_prescriptions: {
        Row: {
          active_from: string
          active_to: string | null
          created_at: string
          created_by: string
          daily_exchanges: number
          dialysate_type: string | null
          dwell_time_hours: number | null
          fill_volume_ml: number
          glucose_concentration: string | null
          id: string
          notes: string | null
          patient_id: string
          updated_at: string
        }
        Insert: {
          active_from?: string
          active_to?: string | null
          created_at?: string
          created_by: string
          daily_exchanges?: number
          dialysate_type?: string | null
          dwell_time_hours?: number | null
          fill_volume_ml?: number
          glucose_concentration?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          updated_at?: string
        }
        Update: {
          active_from?: string
          active_to?: string | null
          created_at?: string
          created_by?: string
          daily_exchanges?: number
          dialysate_type?: string | null
          dwell_time_hours?: number | null
          fill_volume_ml?: number
          glucose_concentration?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      pd_settings: {
        Row: {
          batch_number: string | null
          brand: string | null
          catheter_cuff_type: string | null
          catheter_insertion_date: string | null
          catheter_length_cm: string | null
          catheter_model: string | null
          catheter_size_fr: string | null
          catheter_tip_type: string | null
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
          catheter_cuff_type?: string | null
          catheter_insertion_date?: string | null
          catheter_length_cm?: string | null
          catheter_model?: string | null
          catheter_size_fr?: string | null
          catheter_tip_type?: string | null
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
          catheter_cuff_type?: string | null
          catheter_insertion_date?: string | null
          catheter_length_cm?: string | null
          catheter_model?: string | null
          catheter_size_fr?: string | null
          catheter_tip_type?: string | null
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
          photo_urls: string[] | null
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
          photo_urls?: string[] | null
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
          photo_urls?: string[] | null
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
          center_id: string | null
          created_at: string
          date_of_birth: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          full_name: string
          hospital: string | null
          id: string
          language: string
          nagrita_district: string | null
          nagrita_number: string | null
          phone: string | null
          specialization: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          center_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name: string
          hospital?: string | null
          id?: string
          language?: string
          nagrita_district?: string | null
          nagrita_number?: string | null
          phone?: string | null
          specialization?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          center_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string
          hospital?: string | null
          id?: string
          language?: string
          nagrita_district?: string | null
          nagrita_number?: string | null
          phone?: string | null
          specialization?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
        ]
      }
      record_locks: {
        Row: {
          id: string
          lock_reason: string | null
          locked_at: string
          locked_by: string
          record_id: string
          table_name: string
        }
        Insert: {
          id?: string
          lock_reason?: string | null
          locked_at?: string
          locked_by: string
          record_id: string
          table_name: string
        }
        Update: {
          id?: string
          lock_reason?: string | null
          locked_at?: string
          locked_by?: string
          record_id?: string
          table_name?: string
        }
        Relationships: []
      }
      record_versions: {
        Row: {
          change_reason: string | null
          changed_at: string
          changed_by: string
          id: string
          new_data: Json | null
          old_data: Json | null
          record_id: string
          table_name: string
          version_number: number
        }
        Insert: {
          change_reason?: string | null
          changed_at?: string
          changed_by: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id: string
          table_name: string
          version_number?: number
        }
        Update: {
          change_reason?: string | null
          changed_at?: string
          changed_by?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string
          table_name?: string
          version_number?: number
        }
        Relationships: []
      }
      reminder_settings: {
        Row: {
          created_at: string
          days_of_week: string[]
          enabled: boolean
          id: string
          is_auto_generated: boolean
          patient_id: string
          reminder_time: string
          reminder_type: string
          sound_enabled: boolean
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          days_of_week?: string[]
          enabled?: boolean
          id?: string
          is_auto_generated?: boolean
          patient_id: string
          reminder_time: string
          reminder_type?: string
          sound_enabled?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          days_of_week?: string[]
          enabled?: boolean
          id?: string
          is_auto_generated?: boolean
          patient_id?: string
          reminder_time?: string
          reminder_type?: string
          sound_enabled?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      symptom_reports: {
        Row: {
          created_at: string
          id: string
          linked_episode_id: string | null
          notes: string | null
          patient_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          severity: string
          status: string
          symptoms: string[]
        }
        Insert: {
          created_at?: string
          id?: string
          linked_episode_id?: string | null
          notes?: string | null
          patient_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity?: string
          status?: string
          symptoms?: string[]
        }
        Update: {
          created_at?: string
          id?: string
          linked_episode_id?: string | null
          notes?: string | null
          patient_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity?: string
          status?: string
          symptoms?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "symptom_reports_linked_episode_id_fkey"
            columns: ["linked_episode_id"]
            isOneToOne: false
            referencedRelation: "peritonitis_episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      system_config: {
        Row: {
          category: string
          config_key: string
          config_value: Json
          created_at: string
          description: string | null
          id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          category?: string
          config_key: string
          config_value?: Json
          created_at?: string
          description?: string | null
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          category?: string
          config_key?: string
          config_value?: Json
          created_at?: string
          description?: string | null
          id?: string
          updated_at?: string
          updated_by?: string | null
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
      app_role:
        | "patient"
        | "doctor"
        | "caregiver"
        | "admin"
        | "coordinator"
        | "nurse"
        | "dietician"
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
      app_role: [
        "patient",
        "doctor",
        "caregiver",
        "admin",
        "coordinator",
        "nurse",
        "dietician",
      ],
    },
  },
} as const
