import { supabase } from '@/lib/supabase'
import { resolveArea } from '@/lib/area-utils'

export interface DashboardStats {
  total: number
  male: number
  female: number
  todayCount: number
  thisMonthCount: number
  topArea: string
  topAreaCount: number
}

export interface MonthlyDataPoint {
  month: string
  year: number
  total: number
  male: number
  female: number
}

export interface AreaDataPoint {
  area: string
  count: number
  male: number
  female: number
}

export interface BirthYearDataPoint {
  range: string
  count: number
}

// ─── Dashboard stats ─────────────────────────────────────────────────────────
// All counts come from the view — no direct members table queries needed here,
// which avoids any RLS / column issues on unauthenticated reads.

export async function getDashboardStats(): Promise<DashboardStats> {
  const [statsRes, topAreaRes] = await Promise.all([
    supabase.from('member_statistics_view').select('*').single(),
    supabase
      .from('area_statistics_view')
      .select('area, total_members')
      .order('total_members', { ascending: false })
      .limit(1),
  ])

  if (statsRes.error) throw new Error(statsRes.error.message)

  const s = statsRes.data
  let topArea    = topAreaRes.data?.[0]?.area         ?? ''
  let topAreaCnt = topAreaRes.data?.[0]?.total_members ?? 0

  // If area view is empty (pre-migration), derive from address
  if (!topArea) {
    const areas = await getAreaDistribution()
    topArea    = areas[0]?.area  ?? 'N/A'
    topAreaCnt = areas[0]?.count ?? 0
  }

  return {
    total:          s.total_members               ?? 0,
    male:           s.male_members                ?? 0,
    female:         s.female_members              ?? 0,
    todayCount:     s.today_registrations         ?? 0,
    thisMonthCount: s.current_month_registrations ?? 0,
    topArea,
    topAreaCount:   topAreaCnt,
  }
}

// ─── Monthly trend ───────────────────────────────────────────────────────────
// Tries registration_date (historical dates) first; falls back to created_at
// if the column is unavailable so the chart never hard-errors.

export async function getMonthlyTrend(months = 12): Promise<MonthlyDataPoint[]> {
  const now = new Date()
  const cutoff = new Date(now.getFullYear(), now.getMonth() - months + 1, 1)
  const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  // Pre-fill empty buckets for every month in the window
  const buckets: Record<string, { year: number; month: string; total: number; male: number; female: number }> = {}
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    buckets[key] = { year: d.getFullYear(), month: MONTH_NAMES[d.getMonth()], total: 0, male: 0, female: 0 }
  }

  // Try registration_date (historical lawyer registration dates)
  let rows: { date: string; gender: string | null }[] = []

  const regRes = await supabase
    .from('members')
    .select('registration_date, gender')
    .gte('registration_date', cutoff.toISOString().slice(0, 10))
    .order('registration_date', { ascending: true })

  if (!regRes.error && regRes.data) {
    rows = regRes.data.map((r) => ({ date: r.registration_date ?? '', gender: r.gender ?? null }))
  } else {
    // Fallback: use created_at (record-insertion timestamp)
    const createdRes = await supabase
      .from('members')
      .select('created_at, gender')
      .gte('created_at', cutoff.toISOString())
      .order('created_at', { ascending: true })
    if (createdRes.error) throw new Error(createdRes.error.message)
    rows = (createdRes.data ?? []).map((r) => ({
      date:   r.created_at?.slice(0, 10) ?? '',
      gender: r.gender ?? null,
    }))
  }

  rows.forEach(({ date, gender }) => {
    const key = date?.slice(0, 7)
    if (key && buckets[key]) {
      buckets[key].total++
      if (gender === 'Male')   buckets[key].male++
      else if (gender === 'Female') buckets[key].female++
    }
  })

  return Object.values(buckets)
}

// ─── Area distribution ───────────────────────────────────────────────────────
// Tries the materialised view first (fast, used after migration 005).
// Falls back to client-side extraction from the `address` column when
// the view is empty (i.e. all `area` values are NULL — pre-migration state).

export async function getAreaDistribution(): Promise<AreaDataPoint[]> {
  const { data: viewData, error: viewErr } = await supabase
    .from('area_statistics_view')
    .select('*')
    .order('total_members', { ascending: false })
    .limit(10)

  if (!viewErr && viewData && viewData.length > 0) {
    return viewData.map((row) => ({
      area:   row.area ?? 'Unknown',
      count:  row.total_members ?? 0,
      male:   row.male_count ?? 0,
      female: row.female_count ?? 0,
    }))
  }

  // Fallback: derive area from address client-side
  const { data, error } = await supabase
    .from('members')
    .select('area, address, gender')

  if (error) throw new Error(error.message)

  const buckets: Record<string, { count: number; male: number; female: number }> = {}
  ;(data ?? []).forEach((m) => {
    const area = resolveArea(m.area, m.address)
    if (!buckets[area]) buckets[area] = { count: 0, male: 0, female: 0 }
    buckets[area].count++
    if (m.gender === 'Male')        buckets[area].male++
    else if (m.gender === 'Female') buckets[area].female++
  })

  return Object.entries(buckets)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([area, counts]) => ({ area, ...counts }))
}

// ─── Gender distribution ─────────────────────────────────────────────────────

export async function getGenderDistribution(): Promise<{ name: string; value: number; color: string }[]> {
  const { data, error } = await supabase
    .from('member_statistics_view')
    .select('male_members, female_members')
    .single()

  if (error) throw new Error(error.message)

  const male   = data?.male_members   ?? 0
  const female = data?.female_members ?? 0
  const other  = Math.max(0, (data as { total_members?: number })?.total_members ?? 0) - male - female

  const dist = [
    { name: 'Male',   value: male,   color: '#3B82F6' },
    { name: 'Female', value: female, color: '#EC4899' },
  ]
  if (other > 0) dist.push({ name: 'Other', value: other, color: '#94A3B8' })
  return dist
}

// ─── Birth year distribution ──────────────────────────────────────────────────

export async function getBirthYearDistribution(): Promise<BirthYearDataPoint[]> {
  const { data, error } = await supabase
    .from('members')
    .select('birth_year')
    .not('birth_year', 'is', null)

  if (error) throw new Error(error.message)

  const buckets: Record<number, number> = {}
  ;(data ?? []).forEach(({ birth_year }) => {
    if (birth_year) {
      const decade = Math.floor(birth_year / 10) * 10
      buckets[decade] = (buckets[decade] ?? 0) + 1
    }
  })

  return Object.entries(buckets)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([decade, count]) => ({ range: `${decade}s`, count }))
}

// ─── Interest status distribution ────────────────────────────────────────────

export interface InterestDistribution {
  interested:    number
  notInterested: number
  pending:       number
  total:         number
}

export async function getInterestStatusDistribution(): Promise<InterestDistribution> {
  const { data, error } = await supabase
    .from('members')
    .select('interest_status')

  if (error) throw new Error(error.message)

  const counts = { interested: 0, notInterested: 0, pending: 0 }
  ;(data ?? []).forEach((row) => {
    const s = (row as { interest_status?: string }).interest_status ?? 'Pending'
    if (s === 'Interested')    counts.interested++
    else if (s === 'Not Interested') counts.notInterested++
    else counts.pending++
  })

  return { ...counts, total: (data ?? []).length }
}

// ─── Weekly trend ────────────────────────────────────────────────────────────

export async function getWeeklyTrend(): Promise<{ day: string; male: number; female: number; total: number }[]> {
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const now = new Date()
  const dates: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    dates.push(d.toISOString().slice(0, 10))
  }

  // Try registration_date first
  let rows: { date: string; gender: string | null }[] = []

  const regRes = await supabase
    .from('members')
    .select('registration_date, gender')
    .gte('registration_date', dates[0])
    .lte('registration_date', dates[6])

  if (!regRes.error && regRes.data) {
    rows = regRes.data.map((r) => ({ date: r.registration_date ?? '', gender: r.gender ?? null }))
  } else {
    const createdRes = await supabase
      .from('members')
      .select('created_at, gender')
      .gte('created_at', dates[0] + 'T00:00:00')
      .lte('created_at', dates[6] + 'T23:59:59')
    if (createdRes.error) throw new Error(createdRes.error.message)
    rows = (createdRes.data ?? []).map((r) => ({
      date:   r.created_at?.slice(0, 10) ?? '',
      gender: r.gender ?? null,
    }))
  }

  return dates.map((dateStr) => {
    const dayRows = rows.filter((r) => r.date === dateStr)
    return {
      day:    DAYS[new Date(dateStr + 'T12:00:00').getDay()],
      male:   dayRows.filter((r) => r.gender === 'Male').length,
      female: dayRows.filter((r) => r.gender === 'Female').length,
      total:  dayRows.length,
    }
  })
}
