import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Search, Briefcase, Rocket, CheckCircle } from 'lucide-react'
import { ExpertCard, type ExpertSearchCardData } from '@/components/cards/ExpertCard'
import { ExpertUserDetailDialog } from '@/components/expert/ExpertUserDetailDialog'
import { FilterTabGroup } from '@/components/filters/FilterTabGroup'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useHrEvents, useInviteExpertToEvent } from '@/hooks/useHrEvents'
import { cn } from '@/lib/utils'
import { PEER_SKILL_MAX_TOTAL_STARS } from '@/lib/peerSkillStars'
import { api } from '@/lib/api'
import { toast } from 'sonner'

interface ExpertApiItem {
  id: number
  fullName: string
  department: string
  newcomer?: boolean
  activityScore?: number
  selectedSkillStars?: number
  skills?: string[]
  topSkills?: Array<{
    name: string
    userSkillId?: number
    stars?: number
    category?: string
    viewerPeerStarGiven?: boolean
  }>
  events?: string[]
  readiness?: string[]
}

interface FilterItem {
  id: string
  label: string
}

export interface ExpertSearchViewProps {
  /** Только для HR: кнопка «Пригласить» на карточках экспертов */
  isHrMode?: boolean
  onOpenEvents?: () => void
}

type ActiveTab = 'hard' | 'readiness' | 'expert' | null
type SortMode = 'RECOMMEND_NEWCOMERS' | 'SELECTED_STARS_DESC' | 'SELECTED_STARS_ASC'

const DEFAULT_SORT_MODE: SortMode = 'RECOMMEND_NEWCOMERS'

const SORT_MODE_LABELS: Record<SortMode, string> = {
  RECOMMEND_NEWCOMERS: 'Рекомендовать новичков',
  SELECTED_STARS_DESC: 'Наибольшее количество звезд',
  SELECTED_STARS_ASC: 'Наименьшее количество звезд',
}

/**
 * Стабильные синтетические userSkillId для локальной кнопки «+★» у демо-карточек (isDemoMock).
 */
function mockSkillNames(names: string[], expertId: number): ExpertSearchCardData['skills'] {
  return names.map((name, index) => ({
    userSkillId: expertId * 1000 - index,
    name,
    stars: Math.floor(Math.random() * 16),
    viewerPeerStarGiven: false,
  }))
}

/** userId = users.id из V4__seed_employees.sql (employee43…employee50), чтобы HR-приглашения находили пользователя в БД */
const MOCK_EXPERTS: ExpertSearchCardData[] = [
  {
    id: 43,
    isDemoMock: true,
    fullName: 'Белкин Егор',
    department: 'Quality Assurance',
    skills: mockSkillNames(['Testing', 'Selenium', 'Postman'], 43),
    events: ['QA Fest 2024'],
    readiness: ['MENTORSHIP', 'JURY_WORK'],
  },
  {
    id: 44,
    isDemoMock: true,
    fullName: 'Осипова Галина',
    department: 'Business Analysis',
    skills: mockSkillNames(['Business Analysis', 'BPMN', 'SQL'], 44),
    events: ['BA Conference', 'Юг-Урал 2024'],
    readiness: ['WORKSHOP_FACILITATION', 'PUBLIC_SPEAKING'],
  },
  {
    id: 45,
    isDemoMock: true,
    fullName: 'Калинин Вадим',
    department: 'Data Engineering',
    skills: mockSkillNames(['Python', 'Spark', 'Airflow'], 45),
    events: ['Data Summit', 'Наумен Хакатон'],
    readiness: ['JURY_WORK', 'WORKSHOP_FACILITATION'],
  },
  {
    id: 46,
    isDemoMock: true,
    fullName: 'Уварова Алена',
    department: 'Customer Success',
    skills: mockSkillNames(['Onboarding', 'CRM', 'Presentations'], 46),
    events: ['Customer Day 2024'],
    readiness: ['PUBLIC_SPEAKING', 'MENTORSHIP'],
  },
  {
    id: 47,
    isDemoMock: true,
    fullName: 'Грачев Олег',
    department: 'DevOps',
    skills: mockSkillNames(['Kubernetes', 'Docker', 'CI/CD'], 47),
    events: ['DevOps Days', 'Хакатон ИТы герой'],
    readiness: ['HACKATHON_PARTICIPATION'],
  },
  {
    id: 48,
    isDemoMock: true,
    fullName: 'Кудрявцева София',
    department: 'Product Management',
    skills: mockSkillNames(['Agile', 'Roadmapping', 'Stakeholder management'], 48),
    events: ['Product Day 2024', 'Юг-Урал 2024'],
    readiness: ['PUBLIC_SPEAKING', 'MENTORSHIP'],
  },
  {
    id: 49,
    isDemoMock: true,
    fullName: 'Воронов Константин',
    department: 'Backend Platform',
    skills: mockSkillNames(['Java', 'Spring Boot', 'PostgreSQL'], 49),
    events: ['Юг-Урал 2024', 'Хакатон ИТы герой'],
    readiness: ['MENTORSHIP', 'PUBLIC_SPEAKING'],
  },
  {
    id: 50,
    isDemoMock: true,
    fullName: 'Филатова Жанна',
    department: 'Frontend Engineering',
    skills: mockSkillNames(['React', 'TypeScript', 'Tailwind CSS'], 50),
    events: ['Frontend Conf 2024'],
    readiness: ['LECTURE_DELIVERY'],
  },
]

const FALLBACK_HARD: FilterItem[] = [
  { id: '1', label: 'Java' }, { id: '2', label: 'Spring Boot' }, { id: '3', label: 'SQL' },
  { id: '4', label: 'PostgreSQL' }, { id: '5', label: 'React' }, { id: '6', label: 'TypeScript' },
  { id: '7', label: 'Python' }, { id: '8', label: 'ML' }, { id: '9', label: 'Tech-Lead' },
  { id: '10', label: 'Agile' }, { id: '11', label: 'C++' }, { id: '12', label: 'JavaScript' },
  { id: '13', label: 'A/B тестирование' },
]

const FALLBACK_EXPERT: FilterItem[] = [
  { id: '21', label: 'Публичные выступления' }, { id: '22', label: 'Менторинг' },
  { id: '23', label: 'Фасилитация' }, { id: '24', label: 'Жюри' }, { id: '25', label: 'Лекции' },
]

const FALLBACK_READINESS: FilterItem[] = [
  { id: 'MENTORSHIP', label: 'Менторство' },
  { id: 'PUBLIC_SPEAKING', label: 'Публичные выступления' },
  { id: 'JURY_WORK', label: 'Работа в жюри' },
  { id: 'WORKSHOP_FACILITATION', label: 'Воркшопы' },
  { id: 'LECTURE_DELIVERY', label: 'Лекции' },
  { id: 'HACKATHON_PARTICIPATION', label: 'Хакатоны' },
  { id: 'EVENT_ORGANIZATION', label: 'Организация' },
]

function includesIgnoreCase(source: string, query: string): boolean {
  return source.toLowerCase().includes(query.toLowerCase())
}

function extractApiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response
    const message = response?.data?.message
    if (typeof message === 'string' && message.trim()) return message
  }
  return fallback
}

function buildSearchParams(
  searchQuery: string,
  selectedHardSkills: string[],
  selectedExpertSkills: string[],
  selectedReadiness: string[],
  sortMode: SortMode
): URLSearchParams {
  const params = new URLSearchParams()
  if (searchQuery) params.set('query', searchQuery)
  selectedHardSkills.forEach((id) => params.append('hardSkillIds', id))
  selectedExpertSkills.forEach((id) => params.append('expertSkillIds', id))
  selectedReadiness.forEach((status) => params.append('readinessStatuses', status))
  params.set('sortMode', sortMode)
  return params
}

function mapApiExpert(item: ExpertApiItem): ExpertSearchCardData {
  const fromTop = (item.topSkills ?? [])
    .filter((s) => s && typeof s.name === 'string')
    .map((s) => {
      const rawId = s.userSkillId
      const userSkillId =
        typeof rawId === 'number' && rawId > 0
          ? rawId
          : typeof rawId === 'string' && Number(rawId) > 0
            ? Number(rawId)
            : 0
      return {
        userSkillId,
        name: s.name,
        stars: typeof s.stars === 'number' ? s.stars : 0,
        category: s.category,
        viewerPeerStarGiven: Boolean(s.viewerPeerStarGiven),
      }
    })

  const activityScore =
    typeof item.activityScore === 'number' && Number.isFinite(item.activityScore)
      ? item.activityScore
      : undefined
  const selectedSkillStars =
    typeof item.selectedSkillStars === 'number' && Number.isFinite(item.selectedSkillStars)
      ? item.selectedSkillStars
      : undefined
  const newcomer = Boolean(item.newcomer)

  if (fromTop.length > 0) {
    return {
      id: item.id,
      fullName: item.fullName ?? '',
      department: item.department ?? '',
      skills: fromTop,
      events: Array.isArray(item.events) ? item.events : [],
      readiness: Array.isArray(item.readiness) ? item.readiness : [],
      activityScore,
      selectedSkillStars,
      newcomer,
    }
  }

  const legacy = Array.isArray(item.skills) ? item.skills : []
  return {
    id: item.id,
    fullName: item.fullName ?? '',
    department: item.department ?? '',
    skills: legacy.map((name) => ({ userSkillId: 0, name, stars: 0 })),
    events: Array.isArray(item.events) ? item.events : [],
    readiness: Array.isArray(item.readiness) ? item.readiness : [],
    activityScore,
    selectedSkillStars,
    newcomer,
  }
}

type MockPeerStarOutcome = 'ok' | 'max' | 'missing' | 'already'

function tryBumpMockPeerStar(
  prev: ExpertSearchCardData[],
  expertId: number,
  userSkillId: number
): { next: ExpertSearchCardData[]; outcome: MockPeerStarOutcome } {
  const expert = prev.find((e) => e.id === expertId)
  const skill = expert?.skills.find((s) => s.userSkillId === userSkillId)
  if (!expert || !skill) {
    return { next: prev, outcome: 'missing' }
  }
  if (skill.viewerPeerStarGiven) {
    return { next: prev, outcome: 'already' }
  }
  if (skill.stars >= PEER_SKILL_MAX_TOTAL_STARS) {
    return { next: prev, outcome: 'max' }
  }
  const next = prev.map((e) =>
    e.id !== expertId
      ? e
      : {
          ...e,
          skills: e.skills.map((s) =>
            s.userSkillId === userSkillId
              ? { ...s, stars: s.stars + 1, viewerPeerStarGiven: true }
              : s
          ),
        }
  )
  return { next, outcome: 'ok' }
}

function getSelectedLabels(items: FilterItem[], selectedIds: string[]): string[] {
  return items
    .filter((item) => selectedIds.includes(item.id))
    .map((item) => item.label.toLowerCase())
}

function matchesExpertFilters(
  expert: ExpertSearchCardData,
  queryLower: string,
  selectedHardLabels: string[],
  selectedExpertLabels: string[],
  selectedReadiness: string[]
): boolean {
  const queryMatch =
    queryLower.length === 0 ||
    includesIgnoreCase(expert.fullName, queryLower) ||
    includesIgnoreCase(expert.department, queryLower) ||
    expert.skills.some((skill) => includesIgnoreCase(skill.name, queryLower)) ||
    expert.events.some((event) => includesIgnoreCase(event, queryLower))

  const hardMatch =
    selectedHardLabels.length === 0 ||
    expert.skills.some((skill) =>
      selectedHardLabels.some((label) => includesIgnoreCase(skill.name, label))
    )

  const expertMatch =
    selectedExpertLabels.length === 0 ||
    expert.skills.some((skill) =>
      selectedExpertLabels.some((label) => includesIgnoreCase(skill.name, label))
    )

  const readinessMatch =
    selectedReadiness.length === 0 ||
    expert.readiness.some((status) => selectedReadiness.includes(status))

  return queryMatch && hardMatch && expertMatch && readinessMatch
}

function filterMockExperts(
  searchQuery: string,
  selectedHardLabels: string[],
  selectedExpertLabels: string[],
  selectedReadiness: string[]
): ExpertSearchCardData[] {
  const queryLower = searchQuery.trim().toLowerCase()
  return MOCK_EXPERTS.filter((expert) =>
    matchesExpertFilters(
      expert,
      queryLower,
      selectedHardLabels,
      selectedExpertLabels,
      selectedReadiness
    )
  )
}

function matchesSelectedSkillByLabels(
  skill: ExpertSearchCardData['skills'][number],
  selectedHardLabels: string[],
  selectedExpertLabels: string[]
): boolean {
  const normalizedName = skill.name.toLowerCase()
  if (skill.category === 'HARD') {
    return selectedHardLabels.some((label) => includesIgnoreCase(normalizedName, label))
  }
  if (skill.category === 'EXPERT') {
    return selectedExpertLabels.some((label) => includesIgnoreCase(normalizedName, label))
  }
  return (
    selectedHardLabels.some((label) => includesIgnoreCase(normalizedName, label)) ||
    selectedExpertLabels.some((label) => includesIgnoreCase(normalizedName, label))
  )
}

function getVisibleSelectedSkillStars(
  expert: ExpertSearchCardData,
  selectedHardLabels: string[],
  selectedExpertLabels: string[]
): number {
  if (selectedHardLabels.length === 0 && selectedExpertLabels.length === 0) {
    return 0
  }
  return expert.skills.reduce((sum, skill) => {
    if (!matchesSelectedSkillByLabels(skill, selectedHardLabels, selectedExpertLabels)) {
      return sum
    }
    return sum + skill.stars
  }, 0)
}

function getEffectiveSelectedSkillStars(
  expert: ExpertSearchCardData,
  selectedHardLabels: string[],
  selectedExpertLabels: string[]
): number {
  if (expert.isDemoMock || typeof expert.selectedSkillStars !== 'number') {
    return getVisibleSelectedSkillStars(expert, selectedHardLabels, selectedExpertLabels)
  }
  return expert.selectedSkillStars
}

function applySortMode(
  experts: ExpertSearchCardData[],
  sortMode: SortMode,
  selectedHardLabels: string[],
  selectedExpertLabels: string[]
): ExpertSearchCardData[] {
  if (sortMode === DEFAULT_SORT_MODE) {
    return orderExpertsWithNewcomerFlags(experts)
  }

  const newcomersApplied = orderExpertsWithNewcomerFlags(experts)
  return [...newcomersApplied].sort((a, b) => {
    const aStars = getEffectiveSelectedSkillStars(a, selectedHardLabels, selectedExpertLabels)
    const bStars = getEffectiveSelectedSkillStars(b, selectedHardLabels, selectedExpertLabels)
    const starsDiff =
      sortMode === 'SELECTED_STARS_DESC' ? bStars - aStars : aStars - bStars

    if (starsDiff !== 0) return starsDiff
    if (a.newcomer !== b.newcomer) return a.newcomer ? -1 : 1
    const byName = (a.fullName ?? '').localeCompare(b.fullName ?? '', 'ru', { sensitivity: 'base' })
    if (byName !== 0) return byName
    return a.id - b.id
  })
}

const NEWCOMER_FRACTION = 0.3

function expertActivity(expert: ExpertSearchCardData): number {
  if (typeof expert.activityScore === 'number') return expert.activityScore
  return expert.skills.length + expert.events.length
}

/** Новички — нижние ~30% по (число навыков + число мероприятий); в начале списка, с флагом newcomer */
function orderExpertsWithNewcomerFlags(experts: ExpertSearchCardData[]): ExpertSearchCardData[] {
  if (experts.length === 0) return []

  const n = experts.length
  let newbieSlots = Math.ceil(n * NEWCOMER_FRACTION)
  newbieSlots = Math.min(Math.max(newbieSlots, 1), n)

  const scored = experts
    .map((e) => ({ expert: e, activity: expertActivity(e) }))
    .sort((a, b) => a.activity - b.activity || a.expert.id - b.expert.id)

  const newcomerIds = new Set(scored.slice(0, newbieSlots).map((s) => s.expert.id))

  const newcomersOrdered = scored.slice(0, newbieSlots).map((s) => s.expert)
  const othersOrdered = experts
    .filter((e) => !newcomerIds.has(e.id))
    .sort((a, b) =>
      (a.fullName ?? '').localeCompare(b.fullName ?? '', 'ru', { sensitivity: 'base' })
    )

  const ordered = [...newcomersOrdered, ...othersOrdered]
  return ordered.map((e) => ({ ...e, newcomer: newcomerIds.has(e.id) }))
}

export function ExpertSearchView({
  isHrMode = false,
  onOpenEvents,
}: ExpertSearchViewProps) {
  const debugLogEndpoint = import.meta.env.VITE_DEBUG_LOG_ENDPOINT as string | undefined
  const debugSessionId = import.meta.env.VITE_DEBUG_SESSION_ID as string | undefined
  const isDebugLogEnabled =
    import.meta.env.DEV && Boolean(debugLogEndpoint && debugSessionId)

  const [hardSkillItems, setHardSkillItems] = useState<FilterItem[]>([])
  const [expertSkillItems, setExpertSkillItems] = useState<FilterItem[]>([])
  const [readinessItems, setReadinessItems] = useState<FilterItem[]>([])

  const [selectedHardSkills, setSelectedHardSkills] = useState<string[]>([])
  const [selectedExpertSkills, setSelectedExpertSkills] = useState<string[]>([])
  const [selectedReadiness, setSelectedReadiness] = useState<string[]>([])
  const [sortMode, setSortMode] = useState<SortMode>(DEFAULT_SORT_MODE)

  const [activeTab, setActiveTab] = useState<ActiveTab>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [experts, setExperts] = useState<ExpertSearchCardData[]>(() =>
    orderExpertsWithNewcomerFlags(MOCK_EXPERTS)
  )
  const [loading, setLoading] = useState(false)
  const [invitingExpertId, setInvitingExpertId] = useState<number | null>(null)
  const [peerStarLoadingKey, setPeerStarLoadingKey] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailUserId, setDetailUserId] = useState<number | null>(null)
  const [detailMockExpert, setDetailMockExpert] = useState<ExpertSearchCardData | null>(null)

  const viewerUserId = useMemo(() => {
    try {
      const raw = localStorage.getItem('user')
      if (!raw) return null
      const u = JSON.parse(raw) as { userId?: number }
      return typeof u.userId === 'number' ? u.userId : null
    } catch {
      return null
    }
  }, [])

  /** Защита от двойного инкремента звёзд у моков (Strict Mode / двойной клик). */
  const mockPeerStarLastAtRef = useRef<Record<string, number>>({})

  const [inviteTarget, setInviteTarget] = useState<ExpertSearchCardData | null>(null)
  const [selectedInviteEventId, setSelectedInviteEventId] = useState('')
  const inviteSubmitLock = useRef(false)
  const hrEventsQuery = useHrEvents(isHrMode)
  const inviteMutation = useInviteExpertToEvent()
  const availableEvents = hrEventsQuery.data ?? []
  const selectedInviteEvent =
    availableEvents.find((event) => String(event.id) === selectedInviteEventId) ?? null
  const selectedHardLabels = useMemo(
    () => getSelectedLabels(hardSkillItems, selectedHardSkills),
    [hardSkillItems, selectedHardSkills]
  )
  const selectedExpertLabels = useMemo(
    () => getSelectedLabels(expertSkillItems, selectedExpertSkills),
    [expertSkillItems, selectedExpertSkills]
  )
  const hasSelectedDisciplines = selectedHardSkills.length > 0 || selectedExpertSkills.length > 0
  const applyCurrentSortMode = useCallback(
    (items: ExpertSearchCardData[]) =>
      applySortMode(items, sortMode, selectedHardLabels, selectedExpertLabels),
    [sortMode, selectedHardLabels, selectedExpertLabels]
  )

  const sendDebugLog = useCallback((payload: {
    runId: string
    hypothesisId: string
    location: string
    message: string
    data: Record<string, unknown>
  }) => {
    if (!isDebugLogEnabled || !debugLogEndpoint || !debugSessionId) {
      return
    }

    // #region agent log
    fetch(debugLogEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': debugSessionId,
      },
      body: JSON.stringify({
        sessionId: debugSessionId,
        ...payload,
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion
  }, [isDebugLogEnabled, debugLogEndpoint, debugSessionId])

  useEffect(() => {
    async function loadDictionaries() {
      try {
        const [hardRes, expertRes, readinessRes] = await Promise.all([
          api.get<{ id: number; name: string }[]>('/dictionaries/hard-skills'),
          api.get<{ id: number; name: string }[]>('/dictionaries/expert-skills'),
          api.get<{ key: string; label: string }[]>('/dictionaries/readiness-statuses'),
        ])
        setHardSkillItems(hardRes.data.map((s) => ({ id: String(s.id), label: s.name })))
        setExpertSkillItems(expertRes.data.map((s) => ({ id: String(s.id), label: s.name })))
        setReadinessItems(readinessRes.data.map((s) => ({ id: s.key, label: s.label })))
        // #region agent log
        sendDebugLog({
          runId: `dict-${Date.now()}`,
          hypothesisId: 'H1',
          location: 'ExpertSearchView.tsx:109',
          message: 'Dictionaries loaded',
          data: {
            hardCount: hardRes.data.length,
            expertCount: expertRes.data.length,
            readinessCount: readinessRes.data.length,
            sampleHard: hardRes.data[0]?.name ?? null,
            sampleExpert: expertRes.data[0]?.name ?? null,
          },
        })
        // #endregion
      } catch {
        setHardSkillItems(FALLBACK_HARD)
        setExpertSkillItems(FALLBACK_EXPERT)
        setReadinessItems(FALLBACK_READINESS)
        // #region agent log
        sendDebugLog({
          runId: `dict-fallback-${Date.now()}`,
          hypothesisId: 'H4',
          location: 'ExpertSearchView.tsx:124',
          message: 'Dictionaries fallback used',
          data: {
            hardCount: FALLBACK_HARD.length,
            expertCount: FALLBACK_EXPERT.length,
            readinessCount: FALLBACK_READINESS.length,
          },
        })
        // #endregion
      }
    }
    loadDictionaries()
  }, [sendDebugLog])

  useEffect(() => {
    if (!hasSelectedDisciplines && sortMode !== DEFAULT_SORT_MODE) {
      setSortMode(DEFAULT_SORT_MODE)
    }
  }, [hasSelectedDisciplines, sortMode])

  const fetchExperts = useCallback(async () => {
    setLoading(true)

    try {
      const runId = `search-${Date.now()}`
      const params = buildSearchParams(
        searchQuery,
        selectedHardSkills,
        selectedExpertSkills,
        selectedReadiness,
        sortMode
      )
      // #region agent log
      sendDebugLog({
        runId,
        hypothesisId: 'H2',
        location: 'ExpertSearchView.tsx:143',
        message: 'Request params prepared',
        data: {
          searchQuery,
          queryString: params.toString(),
          hardIds: selectedHardSkills,
          expertIds: selectedExpertSkills,
          readinessStatuses: selectedReadiness,
          sortMode,
        },
      })
      // #endregion

      const res = await api.get<{ content: ExpertApiItem[] }>(`/experts/search?${params}`)
      const mappedExperts = (res.data.content ?? []).map(mapApiExpert)
      const filteredMockExperts = filterMockExperts(
        searchQuery,
        selectedHardLabels,
        selectedExpertLabels,
        selectedReadiness
      )
      const apiIds = new Set(mappedExperts.map((e) => e.id))
      const mocksNotInApi = filteredMockExperts.filter((m) => !apiIds.has(m.id))
      // #region agent log
      sendDebugLog({
        runId,
        hypothesisId: 'H3',
        location: 'ExpertSearchView.tsx:168',
        message: 'Search response mapped',
        data: {
          resultCount: mappedExperts.length,
          mockCount: filteredMockExperts.length,
          firstFullName: mappedExperts[0]?.fullName ?? null,
          firstSkills: mappedExperts[0]?.skills?.slice(0, 3) ?? [],
        },
      })
      // #endregion

      setExperts(
        filteredMockExperts.length === 0
          ? applyCurrentSortMode(mappedExperts)
          : mocksNotInApi.length === 0
            ? applyCurrentSortMode(mappedExperts)
            : applyCurrentSortMode([...mocksNotInApi, ...mappedExperts])
      )
    } catch {
      // #region agent log
      sendDebugLog({
        runId: `search-fallback-${Date.now()}`,
        hypothesisId: 'H4',
        location: 'ExpertSearchView.tsx:179',
        message: 'Search request failed, mock fallback used',
        data: {
          searchQuery,
          hardIds: selectedHardSkills,
          expertIds: selectedExpertSkills,
          readinessStatuses: selectedReadiness,
          sortMode,
        },
      })
      // #endregion
      setExperts(
        applyCurrentSortMode(
          filterMockExperts(
            searchQuery,
            selectedHardLabels,
            selectedExpertLabels,
            selectedReadiness
          )
        )
      )
    } finally {
      setLoading(false)
    }
  }, [
    searchQuery,
    selectedHardSkills,
    selectedExpertSkills,
    selectedReadiness,
    sortMode,
    selectedHardLabels,
    selectedExpertLabels,
    applyCurrentSortMode,
    sendDebugLog,
  ])

  useEffect(() => {
    const timer = setTimeout(fetchExperts, 300)
    return () => clearTimeout(timer)
  }, [fetchExperts])

  useEffect(() => {
    // #region agent log
    sendDebugLog({
      runId: `state-${Date.now()}`,
      hypothesisId: 'H5',
      location: 'ExpertSearchView.tsx:209',
      message: 'Experts state changed',
      data: {
        searchQuery,
        sortMode,
        expertsCount: experts.length,
        firstUser: experts[0]?.fullName ?? null,
      },
    })
    // #endregion
  }, [experts, searchQuery, sortMode, sendDebugLog])

  function handleClose(id: number) {
    setExperts((prev) => applyCurrentSortMode(prev.filter((e) => e.id !== id)))
  }

  const closeInviteDialog = useCallback(() => {
    setInviteTarget(null)
    setSelectedInviteEventId('')
  }, [])

  const inviteDialogSubmitting =
    inviteTarget !== null && invitingExpertId === inviteTarget.id && inviteMutation.isPending

  useEffect(() => {
    if (!inviteTarget) return
    const id = inviteTarget.id
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      if (invitingExpertId === id) return
      closeInviteDialog()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [inviteTarget, invitingExpertId, closeInviteDialog])

  useEffect(() => {
    if (!inviteTarget || availableEvents.length === 0) return
    const selectedStillExists = availableEvents.some(
      (event) => String(event.id) === selectedInviteEventId
    )
    if (!selectedInviteEventId || !selectedStillExists) {
      setSelectedInviteEventId(String(availableEvents[0].id))
    }
  }, [inviteTarget, selectedInviteEventId, availableEvents])

  function handleInvite(id: number) {
    const expert = experts.find((e) => e.id === id)
    if (!expert) return
    setInviteTarget(expert)
    setSelectedInviteEventId('')
  }

  async function confirmInvite() {
    if (!inviteTarget || inviteSubmitLock.current) return
    const id = inviteTarget.id
    if (!selectedInviteEvent) {
      toast.error('Выберите событие')
      return
    }

    inviteSubmitLock.current = true
    setInvitingExpertId(id)
    try {
      const response = await inviteMutation.mutateAsync({
        expertId: id,
        eventId: selectedInviteEvent.id,
      })
      toast.success(response.message ?? `Эксперт добавлен в событие "${selectedInviteEvent.title}"`)
      closeInviteDialog()
    } catch (error) {
      toast.error(extractApiErrorMessage(error, 'Не удалось отправить приглашение'))
    } finally {
      setInvitingExpertId((currentId) => (currentId === id ? null : currentId))
      inviteSubmitLock.current = false
    }
  }

  async function handlePeerStar(expertId: number, userSkillId: number, isDemoMock?: boolean) {
    if (!localStorage.getItem('token')) {
      toast.error('Войдите в систему, чтобы поставить звезду')
      return
    }
    const key = `${expertId}-${userSkillId}`

    if (isDemoMock) {
      const now = Date.now()
      const last = mockPeerStarLastAtRef.current[key] ?? 0
      if (now - last < 250) {
        return
      }
      mockPeerStarLastAtRef.current[key] = now
    }

    setPeerStarLoadingKey(key)
    try {
      if (isDemoMock) {
        const resultBox: { outcome: MockPeerStarOutcome } = { outcome: 'ok' }
        setExperts((prev) => {
          const { next, outcome } = tryBumpMockPeerStar(prev, expertId, userSkillId)
          resultBox.outcome = outcome
          return outcome === 'ok' ? applyCurrentSortMode(next) : next
        })
        if (resultBox.outcome === 'missing') toast.error('Не найден навык')
        else if (resultBox.outcome === 'max') toast.error('У этого навыка уже максимум звёзд')
        else if (resultBox.outcome === 'already') toast.error('Вы уже поставили звезду за этот навык')
        else toast.success('Звезда добавлена')
        return
      }

      const res = await api.post<{ userSkillId: number; stars: number }>(
        `/users/${expertId}/skills/${userSkillId}/peer-star`
      )
      setExperts((prev) =>
        applyCurrentSortMode(
          prev.map((e) => {
            if (e.id !== expertId) return e
            const updatedSkills = e.skills.map((s) =>
              s.userSkillId === userSkillId
                ? { ...s, stars: res.data.stars, viewerPeerStarGiven: true }
                : s
            )
            const updatedSkill = updatedSkills.find((s) => s.userSkillId === userSkillId)
            const selectedSkillDelta =
              updatedSkill && matchesSelectedSkillByLabels(updatedSkill, selectedHardLabels, selectedExpertLabels)
                ? res.data.stars - (e.skills.find((s) => s.userSkillId === userSkillId)?.stars ?? 0)
                : 0
            return {
              ...e,
              skills: updatedSkills,
              selectedSkillStars:
                typeof e.selectedSkillStars === 'number'
                  ? e.selectedSkillStars + selectedSkillDelta
                  : e.selectedSkillStars,
            }
          })
        )
      )
      toast.success('Звезда добавлена')
    } catch (e) {
      const status =
        typeof e === 'object' && e !== null && 'response' in e
          ? (e as { response?: { status?: number } }).response?.status
          : undefined
      if (status === 409) {
        setExperts((prev) =>
          applyCurrentSortMode(
            prev.map((ex) =>
              ex.id === expertId
                ? {
                    ...ex,
                    skills: ex.skills.map((s) =>
                      s.userSkillId === userSkillId ? { ...s, viewerPeerStarGiven: true } : s
                    ),
                  }
                : ex
            )
          )
        )
      }
      toast.error(extractApiErrorMessage(e, 'Не удалось поставить звезду'))
    } finally {
      setPeerStarLoadingKey((k) => (k === key ? null : k))
    }
  }

  function toggleTab(tab: ActiveTab) {
    setActiveTab((prev) => (prev === tab ? null : tab))
  }

  function handleOpenExpertProfile(expertId: number) {
    const ex = experts.find((e) => e.id === expertId)
    if (!ex) return
    setDetailUserId(expertId)
    setDetailMockExpert(ex.isDemoMock ? ex : null)
    setDetailOpen(true)
  }

  function handleDetailOpenChange(next: boolean) {
    setDetailOpen(next)
    if (!next) {
      setDetailUserId(null)
      setDetailMockExpert(null)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#F5F5F5]">
      <ExpertUserDetailDialog
        open={detailOpen}
        onOpenChange={handleDetailOpenChange}
        userId={detailUserId}
        mockExpert={detailMockExpert}
      />

      {inviteTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4"
          role="presentation"
          onClick={() => {
            if (!inviteDialogSubmitting) closeInviteDialog()
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-dialog-title"
            className="relative max-h-[min(90dvh,40rem)] w-full max-w-md overflow-y-auto overscroll-contain rounded-2xl border border-gray-200 bg-white p-4 shadow-xl text-[#252525] sm:p-6"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !inviteDialogSubmitting) {
                e.preventDefault()
                void confirmInvite()
              }
            }}
          >
            <h2 id="invite-dialog-title" className="text-lg font-semibold tracking-tight">
              Приглашение на мероприятие
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Эксперт:{' '}
              <span className="font-medium text-[#252525]">{inviteTarget.fullName}</span>
            </p>
            <div className="mt-5 space-y-3">
              {hrEventsQuery.isLoading ? (
                <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-500">
                  Загружаем список событий...
                </div>
              ) : hrEventsQuery.isError ? (
                <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                  Не удалось загрузить события.
                  <Button
                    type="button"
                    variant="link"
                    className="ml-1 h-auto p-0 text-red-700"
                    onClick={() => void hrEventsQuery.refetch()}
                  >
                    Повторить
                  </Button>
                </div>
              ) : availableEvents.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/70 p-4">
                  <p className="text-sm font-medium text-[#252525]">Сначала создайте событие</p>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Чтобы пригласить эксперта, HR должен выбрать уже созданное событие.
                  </p>
                  {onOpenEvents ? (
                    <Button
                      type="button"
                      className="mt-4 rounded-xl bg-[#FF6720] text-white hover:bg-[#FF6720]/90"
                      onClick={() => {
                        closeInviteDialog()
                        onOpenEvents()
                      }}
                    >
                      Перейти к событиям
                    </Button>
                  ) : null}
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#252525]">Событие</Label>
                    <Select
                      value={selectedInviteEventId}
                      onValueChange={setSelectedInviteEventId}
                      disabled={inviteDialogSubmitting}
                    >
                      <SelectTrigger
                        className={cn(
                          'h-11 rounded-xl border-gray-200 bg-white text-[#252525]',
                          'focus:ring-[#FF6720]/40'
                        )}
                      >
                        <SelectValue placeholder="Выберите событие" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableEvents.map((event) => (
                          <SelectItem key={event.id} value={String(event.id)}>
                            {event.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedInviteEvent ? (
                    <div className="rounded-2xl border border-orange-100 bg-orange-50/60 p-4">
                      <p className="text-sm font-medium text-[#252525]">{selectedInviteEvent.title}</p>
                      <p className="mt-2 text-sm leading-6 text-gray-600">
                        {selectedInviteEvent.description || 'Описание события пока не заполнено.'}
                      </p>
                      <p className="mt-3 text-xs font-medium uppercase tracking-wide text-[#F95700]">
                        Уже приглашено: {selectedInviteEvent.participantsCount}
                      </p>
                    </div>
                  ) : null}
                </>
              )}
            </div>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                className="border-gray-300 text-[#252525] hover:bg-gray-50"
                disabled={inviteDialogSubmitting}
                onClick={closeInviteDialog}
              >
                Отмена
              </Button>
              <Button
                type="button"
                className="bg-[#FF6720] text-white hover:bg-[#FF6720]/90 focus-visible:ring-[#FF6720]"
                disabled={inviteDialogSubmitting || hrEventsQuery.isLoading || availableEvents.length === 0}
                onClick={() => void confirmInvite()}
              >
                {inviteDialogSubmitting ? 'Отправка...' : 'Пригласить в событие'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header / Filter bar — выше области карточек, чтобы выпадающие панели не перекрывались контентом */}
      <div className="relative z-40 isolate flex shrink-0 flex-col gap-3 bg-[#F0F0F0] px-3 pb-0 pt-3 sm:px-4 lg:flex-row lg:items-end lg:gap-3 lg:px-6 lg:pt-4">
        <div className="flex min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:items-end lg:gap-3">
          {/* Search input */}
          <div className="relative min-w-0 flex-1 lg:mb-4">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Кого найдем сегодня?"
              className="min-h-11 w-full rounded-xl border-0 bg-white py-3 pl-10 pr-3 text-sm text-[#252525] placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF6720]/45"
            />
          </div>

          <div className="mb-0 w-full shrink-0 space-y-2 sm:max-w-md lg:mb-4 lg:w-[250px]">
            <Label className="text-sm font-medium text-[#252525]">Сортировка</Label>
            <Select value={sortMode} onValueChange={(value) => setSortMode(value as SortMode)}>
              <SelectTrigger className="h-11 min-h-11 w-full rounded-xl border-gray-200 bg-white text-[#252525] focus:ring-[#FF6720]/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RECOMMEND_NEWCOMERS">
                  {SORT_MODE_LABELS.RECOMMEND_NEWCOMERS}
                </SelectItem>
                <SelectItem value="SELECTED_STARS_DESC" disabled={!hasSelectedDisciplines}>
                  {SORT_MODE_LABELS.SELECTED_STARS_DESC}
                </SelectItem>
                <SelectItem value="SELECTED_STARS_ASC" disabled={!hasSelectedDisciplines}>
                  {SORT_MODE_LABELS.SELECTED_STARS_ASC}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex min-w-0 flex-wrap items-end gap-2 pb-2 lg:mb-4 lg:flex-nowrap lg:pb-0">
          <FilterTabGroup
            title="Профессиональные"
            icon={<Briefcase size={20} />}
            items={hardSkillItems}
            selectedItems={selectedHardSkills}
            onChange={setSelectedHardSkills}
            isActive={activeTab === 'hard'}
            onToggle={() => toggleTab('hard')}
            panelSide="end"
          />
          <FilterTabGroup
            title="Готовность"
            icon={<Rocket size={20} />}
            items={readinessItems}
            selectedItems={selectedReadiness}
            onChange={setSelectedReadiness}
            isActive={activeTab === 'readiness'}
            onToggle={() => toggleTab('readiness')}
            panelSide="end"
          />
          <FilterTabGroup
            title="Экспертные"
            icon={<CheckCircle size={20} />}
            items={expertSkillItems}
            selectedItems={selectedExpertSkills}
            onChange={setSelectedExpertSkills}
            isActive={activeTab === 'expert'}
            onToggle={() => toggleTab('expert')}
            panelSide="end"
          />
        </div>

        <span className="hidden shrink-0 select-none pb-4 text-xl font-black text-[#FF6720] xl:inline">
          NAUMEN
        </span>
      </div>

      {/* Cards grid — явный нижний слой относительно шапки с фильтрами */}
      <div className="relative z-0 flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-4 lg:p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            Загрузка...
          </div>
        ) : experts.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            Эксперты не найдены
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experts.map((expert, index) => (
              <ExpertCard
                key={expert.isDemoMock ? `demo-${expert.id}` : expert.id}
                expert={expert}
                theme={index % 2 === 0 ? 'light' : 'dark'}
                onClose={handleClose}
                onInvite={isHrMode ? handleInvite : undefined}
                isInviting={invitingExpertId === expert.id}
                viewerUserId={viewerUserId}
                peerStarLoadingKey={peerStarLoadingKey}
                onPeerStar={handlePeerStar}
                onProfileClick={handleOpenExpertProfile}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
