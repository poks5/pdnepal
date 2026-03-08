
export interface PDEvent {
  id: string;
  patient_id: string;
  event_type: 'catheter_insertion' | 'pd_start' | 'peritonitis' | 'exit_site_infection' |
    'tunnel_infection' | 'catheter_revision' | 'catheter_removal' |
    'transfer_to_hd' | 'transplant' | 'pd_restart' | 'death';
  event_date: string;
  related_record_id?: string;
  notes?: string;
  created_by: string;
  created_at: string;
}

export interface PeritonitisEpisode {
  id: string;
  patient_id: string;
  episode_number: number;
  date_onset: string;
  presenting_symptoms: string[];
  effluent_wbc?: number;
  neutrophil_percent?: number;
  eosinophil_percent?: number;
  gram_stain_result?: string;
  culture_result?: string;
  organism?: string;
  classification?: 'culture_negative' | 'fungal' | 'polymicrobial' | 'refractory' | 'relapsing' | 'recurrent' | 'repeat' | 'standard';
  empiric_antibiotic_start_date?: string;
  empiric_regimen?: string;
  definitive_antibiotic?: string;
  route?: 'IP' | 'IV' | 'oral' | 'combined';
  duration_days?: number;
  effluent_clearance_date?: string;
  clearance_wbc_below_100?: boolean;
  symptoms_resolved?: boolean;
  culture_negative_on_clearance?: boolean;
  clinical_response?: 'good' | 'partial' | 'none';
  catheter_removed?: boolean;
  removal_date?: string;
  switch_to_hd?: boolean;
  death?: boolean;
  notes?: string;
  created_by: string;
  created_at: string;
  // joined
  antibiotics?: PeritonitisAntibiotic[];
  cultures?: PeritonitisClulture[];
}

export interface PeritonitisAntibiotic {
  id: string;
  episode_id: string;
  drug_name: string;
  route: 'IP' | 'IV' | 'oral';
  start_date: string;
  stop_date?: string;
  dose?: string;
  frequency?: string;
  reason_for_change?: string;
}

export interface PeritonitisClulture {
  id: string;
  episode_id: string;
  culture_date: string;
  sample_type: string;
  organism?: string;
  colony_count?: string;
  gram_type?: 'positive' | 'negative' | 'fungal' | 'mycobacterial';
  sensitivity?: Array<{ antibiotic: string; result: 'sensitive' | 'resistant' | 'intermediate' }>;
  notes?: string;
}

export interface ExitSiteInfection {
  id: string;
  patient_id: string;
  date_onset: string;
  symptoms: string[];
  organism?: string;
  culture_date?: string;
  antibiotic?: string;
  route?: 'topical' | 'oral' | 'IV';
  duration_days?: number;
  resolved?: boolean;
  resolution_date?: string;
  progressed_to_peritonitis?: boolean;
  related_peritonitis_id?: string;
  photo_urls: string[];
  notes?: string;
  created_by: string;
  created_at: string;
}
