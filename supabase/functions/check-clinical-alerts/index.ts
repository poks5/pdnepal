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

    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    })
    const { data: { user }, error: authErr } = await userClient.auth.getUser()
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }

    const admin = createClient(supabaseUrl, serviceKey)

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
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)

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

      // No improvement after 5 days
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

    // 3. Antibiotic overdue
    const { data: antibiotics } = await admin
      .from('peritonitis_antibiotics')
      .select('id, episode_id, drug_name, start_date, stop_date, dose, frequency')
      .is('stop_date', null)

    for (const abx of antibiotics || []) {
      const ep = (episodes || []).find(e => e.id === abx.episode_id)
      if (!ep || !patientIds.includes(ep.patient_id)) continue

      const startDate = new Date(abx.start_date)
      const daysSinceStart = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)

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

    // 4. UF Failure Trend (3-day declining/low UF)
    for (const pid of patientIds) {
      const { data: recentLogs } = await admin
        .from('exchange_logs')
        .select('created_at, ultrafiltration_ml, weight_after_kg')
        .eq('patient_id', pid)
        .gte('created_at', threeDaysAgo.toISOString())
        .order('created_at', { ascending: true })

      if (!recentLogs?.length) continue

      const dailyUF = new Map<string, number>()
      const dailyWeights = new Map<string, number[]>()
      for (const l of recentLogs) {
        const d = new Date(l.created_at).toLocaleDateString('en-CA')
        dailyUF.set(d, (dailyUF.get(d) || 0) + (l.ultrafiltration_ml || 0))
        if (l.weight_after_kg != null) {
          if (!dailyWeights.has(d)) dailyWeights.set(d, [])
          dailyWeights.get(d)!.push(Number(l.weight_after_kg))
        }
      }

      const ufDays = Array.from(dailyUF.entries()).sort((a, b) => a[0].localeCompare(b[0]))

      if (ufDays.length >= 3) {
        const lowUFDays = ufDays.filter(([_, uf]) => uf < 300)
        if (lowUFDays.length >= 3) {
          const { data: existing } = await admin
            .from('clinical_alerts')
            .select('id')
            .eq('patient_id', pid)
            .eq('alert_type', 'uf_failure_trend')
            .eq('acknowledged', false)
            .gte('created_at', threeDaysAgo.toISOString())
            .limit(1)

          if (!existing?.length) {
            const avgUF = Math.round(ufDays.reduce((s, [_, v]) => s + v, 0) / ufDays.length)
            newAlerts.push({
              patient_id: pid,
              doctor_id: user.id,
              alert_type: 'uf_failure_trend',
              severity: avgUF < 100 ? 'critical' : 'high',
              title: `UF Failure Trend - ${nameMap[pid] || 'Patient'}`,
              message: `Daily UF below 300ml for ${lowUFDays.length} consecutive days (avg: ${avgUF}ml).`,
              details: `Possible UF failure. Consider PET test, review dwell times, or switch to higher glucose concentration.`,
            })
          }
        }
      }

      // 5. Fluid overload risk (weight gain >2kg over 3 days)
      const weightDays = Array.from(dailyWeights.entries()).sort((a, b) => a[0].localeCompare(b[0]))
      if (weightDays.length >= 2) {
        const firstW = weightDays[0][1].reduce((a, b) => a + b, 0) / weightDays[0][1].length
        const lastW = weightDays[weightDays.length - 1][1].reduce((a, b) => a + b, 0) / weightDays[weightDays.length - 1][1].length
        const gain = lastW - firstW

        if (gain > 2) {
          const { data: existing } = await admin
            .from('clinical_alerts')
            .select('id')
            .eq('patient_id', pid)
            .eq('alert_type', 'fluid_overload_risk')
            .eq('acknowledged', false)
            .gte('created_at', threeDaysAgo.toISOString())
            .limit(1)

          if (!existing?.length) {
            newAlerts.push({
              patient_id: pid,
              doctor_id: user.id,
              alert_type: 'fluid_overload_risk',
              severity: gain > 3 ? 'critical' : 'high',
              title: `Fluid Overload Risk - ${nameMap[pid] || 'Patient'}`,
              message: `Weight gain of ${gain.toFixed(1)}kg over ${weightDays.length} days detected.`,
              details: `Weight: ${firstW.toFixed(1)}kg → ${lastW.toFixed(1)}kg. Assess fluid intake, UF adequacy, and consider diuretic adjustment.`,
            })
          }
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
    console.error('check-clinical-alerts error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
