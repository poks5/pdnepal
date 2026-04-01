

# World-Class PD App — Improvement Plan

## Current State Assessment

PDsathi already has a solid foundation: multi-role auth, exchange logging with clinical alerts, prescription-driven defaults, doctor-patient assignments, lab tracking, peritonitis/exit-site registries, messaging, bilingual support (EN/NE), offline queue, CSV export, and learning modules. It covers ~85% of what a clinical PD app needs.

The gaps below represent what separates a "good clinical tool" from a **world-class PD management platform**.

---

## Phase 1: Patient Experience & Engagement

### 1.1 Smart Exchange Reminders (Push Notifications)
- Replace the current in-memory `ReminderSystem` with prescription-driven reminders
- Auto-schedule reminders based on `pd_prescriptions.daily_exchanges` (e.g., 4 exchanges → notifications at 6am, 11am, 4pm, 9pm)
- Use browser Notification API with service worker for background delivery
- Store reminder preferences in a new `reminder_settings` table

### 1.2 Gamification & Streaks
- Add a visible "streak counter" (consecutive days with all exchanges completed) — already partially computed in `DashboardOverview` but not prominently displayed
- Weekly/monthly achievement badges (e.g., "7-Day Perfect Adherence", "30 Days Strong")
- Store achievements in a `patient_achievements` table
- Show motivational messages tied to streaks

### 1.3 Patient-Facing AI Summary
- Use Lovable AI (Gemini Flash) to generate a plain-language weekly summary: "Your UF averaged 850ml this week, up from 720ml. Your adherence was 100%. Keep it up!"
- Surface in the Overview tab as a collapsible card
- Bilingual output (EN/NE)

---

## Phase 2: Clinical Intelligence

### 2.1 PET Test & Kt/V Calculator
- Add structured PET (Peritoneal Equilibration Test) data entry with D/P creatinine ratio calculation
- Auto-classify membrane transport type (High, High-Average, Low-Average, Low)
- Kt/V calculator using Watson formula for total body water estimation
- Store results in `pet_results` and `adequacy_calculations` tables
- Display trends over time for longitudinal adequacy monitoring

### 2.2 Enhanced Clinical Decision Support
- Expand the alert engine beyond current 3-tier model:
  - **Fluid overload risk**: weight gain + low UF + high-concentration solution already in use
  - **Technique failure prediction**: declining UF trend over 2+ weeks
  - **Nutrition alert**: integrate with lab data (albumin < 3.5 g/dL)
  - **Anemia management**: Hb trending down with suggested EPO adjustment
- Automated "clinical summary" PDF for doctor visits

### 2.3 AI-Powered Exit Site Photo Analysis
- The edge function `analyze-exit-site-photo` already exists
- Wire it into the patient-facing `ClinicalPhotoUpload` component for real-time feedback
- Show severity scoring (Twardowski classification) with visual reference guide

---

## Phase 3: Communication & Care Coordination

### 3.1 Structured Clinical Handoff
- Add a "shift handoff" feature for nurses managing multiple patients
- Auto-generate a summary of today's exchanges, pending alerts, and upcoming actions per patient
- Printable/exportable format

### 3.2 Appointment Scheduling
- Create `appointments` table (patient_id, doctor_id, datetime, type, status, notes)
- Patient can request; doctor can confirm/reschedule
- Show upcoming appointments on both dashboards
- Pre-visit summary auto-generation (last 30 days of data)

### 3.3 Family/Caregiver Portal Enhancements
- Read-only view of patient's daily progress for family members
- Simplified interface showing: "Did they complete exchanges today? Any alerts?"
- Push notification to caregiver if patient misses 2+ exchanges

---

## Phase 4: Data & Research

### 4.1 PDF Clinical Report Generator
- Generate professional PDF reports (using edge function + Lovable AI):
  - **Patient Summary**: demographics, prescription, 90-day trends, lab results
  - **Peritonitis Report**: ISPD-format episode summary
  - **Transfer Letter**: structured data for hospital transfers
- Downloadable from both patient and doctor dashboards

### 4.2 ISPD Registry Export
- Standardized export format compatible with ISPD reporting requirements
- Annual program summary: peritonitis rates (episodes/patient-year), technique survival, patient demographics
- Already partially built in `CenterAnalytics` — needs formalization

### 4.3 Multi-Center Dashboard
- Enhance the existing `centers` table infrastructure
- Admin can view cross-center comparisons: infection rates, adherence, outcomes
- Benchmarking against ISPD targets

---

## Phase 5: Platform Reliability

### 5.1 Full PWA with Service Worker
- Add proper service worker with Workbox for asset caching and offline page shell
- Manifest.json with proper icons for installability
- Background sync for queued exchanges (upgrade current localStorage approach)

### 5.2 Real-time Sync
- Enable Supabase Realtime on `exchange_logs`, `clinical_alerts`, `messages`
- Doctor dashboard auto-updates when patients log exchanges
- Already partially used for learning assignments — extend pattern

### 5.3 Accessibility & Internationalization
- WCAG 2.1 AA compliance audit and fixes
- Add screen reader announcements for clinical alerts
- RTL-ready layout structure for future language expansion
- Improve contrast ratios in clinical data displays

---

## Phase 6: Security & Compliance

### 6.1 Session Management
- Auto-logout after 30 min inactivity (configurable in `APP_CONFIG`)
- Session activity indicator
- Concurrent session detection

### 6.2 Audit Trail Enhancement
- Ensure all clinical data modifications are captured in `audit_log`
- Add "who viewed what" tracking for compliance
- Data retention policy configuration

---

## Recommended Implementation Order

| Priority | Phase | Effort | Impact |
|----------|-------|--------|--------|
| 1 | 1.1 Smart Reminders | Medium | High — drives adherence |
| 2 | 2.1 PET/Kt/V Calculator | Medium | High — clinical differentiation |
| 3 | 4.1 PDF Reports | Medium | High — doctor workflow |
| 4 | 3.2 Appointments | Medium | High — care coordination |
| 5 | 1.3 AI Weekly Summary | Low | Medium — engagement |
| 6 | 5.1 Full PWA | Medium | High — reliability |
| 7 | 1.2 Gamification | Low | Medium — retention |
| 8 | 2.2 Decision Support | High | High — clinical safety |
| 9 | 5.2 Realtime Sync | Low | Medium — UX |
| 10 | 6.1 Session Management | Low | Medium — security |

---

## Technical Approach

All changes follow the **Refinement-First** philosophy — extending existing tables, components, and role-based patterns rather than rebuilding. New tables use RLS with the existing `has_role()` function and doctor-patient assignment checks. AI features use Lovable AI (no API key needed). PDF generation via edge functions. All clinical calculations reference ISPD 2023 guidelines.

