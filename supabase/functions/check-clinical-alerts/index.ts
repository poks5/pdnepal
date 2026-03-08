import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No auth' }), { status: 401, headers: corsHeaders })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // User client for auth check
    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    })
    const { data: { user }, error: authErr } = await userClient.auth.getUser()
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }

    // Service client for querying across patients
    const admin = createClient(supabaseUrl, serviceKey)

    // Get doctor's assigned patients
    const { data: assignments } = await admin
      .from('doctor_patient_assignments')
      .select('patient_id')
      .eq('doctor_id', user.id)
      .eq('status', 'active')

    if (!assignments?.length) {
      return new Response(JSON.stringify({ alerts: [], generated: 0 }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const patientIds = assignments.map(a => a.patient_id)
    const newAlerts: any[] = []
    const now = new Date()
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // Get patient names
    const { data: profiles } = await admin
      .from('profiles')
      .select('user_id, full_name')
      .in('user_id', patientIds)
    const nameMap = Object.fromEntries((profiles || []).map(p => [p.user_id, p.full_name]))

    // 1. Effluent WBC > 100
    const { data: episodes } = await admin
      .from('peritonitis_episodes')
      .select('id, patient_id, effluent_wbc, date_onset, episode_number, clinical_response, created_at')
      .in('patient_id', patientIds)
      .not('effluent_wbc', 'is', null)

    for (const ep of episodes || []) {
      if (ep.effluent_wbc > 100) {
        // Check if alert already exists for this record
        const { data: existing } = await admin
          .from('clinical_alerts')
          .select('id')
          .eq('related_record_id', ep.id)
          .eq('alert_type', 'high_wbc')
          .eq('acknowledged', false)
          .limit(1)

        if (!existing?.length) {
          newAlerts.push({
            patient_id: ep.patient_id,
            doctor_id: user.id,
            alert_type: 'high_wbc',
            severity: ep.effluent_wbc > 500 ? 'critical' : 'high',
            title: `High Effluent WBC - ${nameMap[ep.patient_id] || 'Patient'}`,
            message: `WBC count ${ep.effluent_wbc}/µL in Episode #${ep.episode_number}. Threshold: >100/µL.`,
            details: `Onset: ${ep.date_onset}. Immediate clinical evaluation recommended.`,
            related_record_id: ep.id,
          })
        }
      }

      // 4. No improvement after 5 days
      if (ep.clinical_response !== 'good' && ep.date_onset) {
        const onset = new Date(ep.date_onset)
        const daysSinceOnset = (now.getTime() - onset.getTime()) / (1000 * 60 * 60 * 24)
        if (daysSinceOnset >= 5 && daysSinceOnset <= 30) {
          const { data: existing } = await admin
            .from('clinical_alerts')
            .select('id')
            .eq('related_record_id', ep.id)
            .eq('alert_type', 'no_improvement')
            .eq('acknowledged', false)
            .limit(1)

          if (!existing?.length) {
            newAlerts.push({
              patient_id: ep.patient_id,
              doctor_id: user.id,
              alert_type: 'no_improvement',
              severity: daysSinceOnset >= 10 ? 'critical' : 'high',
              title: `No Improvement - ${nameMap[ep.patient_id] || 'Patient'}`,
              message: `Episode #${ep.episode_number}: ${Math.floor(daysSinceOnset)} days since onset with no documented good response.`,
              details: `Current response: ${ep.clinical_response || 'not assessed'}. Consider catheter removal or regimen change per ISPD guidelines.`,
              related_record_id: ep.id,
            })
          }
        }
      }
    }

    // 2. New culture results (uploaded in last 24h)
    const { data: cultures } = await admin
      .from('peritonitis_cultures')
      .select('id, episode_id, culture_date, organism, gram_type, created_at')
      .gte('created_at', oneDayAgo.toISOString())

    for (const culture of cultures || []) {
      // Find episode to get patient_id
      const ep = (episodes || []).find(e => e.id === culture.episode_id)
      if (!ep || !patientIds.includes(ep.patient_id)) continue

      const { data: existing } = await admin
        .from('clinical_alerts')
        .select('id')
        .eq('related_record_id', culture.id)
        .eq('alert_type', 'culture_result')
        .limit(1)

      if (!existing?.length) {
        newAlerts.push({
          patient_id: ep.patient_id,
          doctor_id: user.id,
          alert_type: 'culture_result',
          severity: culture.organism ? 'high' : 'medium',
          title: `Culture Result - ${nameMap[ep.patient_id] || 'Patient'}`,
          message: culture.organism
            ? `${culture.gram_type || ''} organism identified: ${culture.organism}`
            : `Culture result available (no organism identified)`,
          details: `Culture date: ${culture.culture_date}. Episode #${ep.episode_number}. Review sensitivity data and adjust antibiotics.`,
          related_record_id: culture.id,
        })
      }
    }

    // 3. Antibiotic overdue (started but no stop date, > expected duration)
    const { data: antibiotics } = await admin
      .from('peritonitis_antibiotics')
      .select('id, episode_id, drug_name, start_date, stop_date, dose, frequency')
      .is('stop_date', null)

    for (const abx of antibiotics || []) {
      const ep = (episodes || []).find(e => e.id === abx.episode_id)
      if (!ep || !patientIds.includes(ep.patient_id)) continue

      const startDate = new Date(abx.start_date)
      const daysSinceStart = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)

      // Standard peritonitis antibiotic course is 14-21 days; alert if > 21
      if (daysSinceStart > 21) {
        const { data: existing } = await admin
          .from('clinical_alerts')
          .select('id')
          .eq('related_record_id', abx.id)
          .eq('alert_type', 'antibiotic_overdue')
          .eq('acknowledged', false)
          .limit(1)

        if (!existing?.length) {
          newAlerts.push({
            patient_id: ep.patient_id,
            doctor_id: user.id,
            alert_type: 'antibiotic_overdue',
            severity: daysSinceStart > 28 ? 'critical' : 'high',
            title: `Antibiotic Overdue - ${nameMap[ep.patient_id] || 'Patient'}`,
            message: `${abx.drug_name} started ${Math.floor(daysSinceStart)} days ago with no stop date recorded.`,
            details: `Started: ${abx.start_date}. Standard course: 14-21 days. Review and update or discontinue.`,
            related_record_id: abx.id,
          })
        }
      }
    }

    // Insert all new alerts
    if (newAlerts.length > 0) {
      await admin.from('clinical_alerts').insert(newAlerts)
    }

    // Return all active alerts for this doctor
    const { data: allAlerts } = await admin
      .from('clinical_alerts')
      .select('*')
      .in('patient_id', patientIds)
      .order('created_at', { ascending: false })

    return new Response(
      JSON.stringify({ alerts: allAlerts || [], generated: newAlerts.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
