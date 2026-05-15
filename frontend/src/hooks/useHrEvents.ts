import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  CreateHrEventRequest,
  HrEvent,
  HrEventParticipant,
  InviteExpertToEventRequest,
  InviteExpertToEventResponse,
  SaveParticipantExperienceRequest,
  SaveParticipantExperienceResponse,
} from '@/types/hrEvents'

const HR_EVENTS_QUERY_KEY = ['hr-events'] as const

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined
}

function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value)
    ? value
    : typeof value === 'string' && value.trim() && Number.isFinite(Number(value))
      ? Number(value)
      : undefined
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function normalizeParticipant(raw: unknown): HrEventParticipant | null {
  const record = asRecord(raw)
  if (!record) return null

  const id = asNumber(record.userId) ?? asNumber(record.id)
  const fullName = asString(record.fullName) ?? asString(record.name)
  if (typeof id !== 'number' || !fullName) return null

  return {
    id,
    fullName,
    department: asString(record.department) ?? 'Не указан',
    email: asString(record.email),
    invitedAt: asString(record.invitedAt),
    status: asString(record.status),
    profileEventSaved: Boolean(record.profileEventSaved),
    participationRole: asString(record.participationRole) as HrEventParticipant['participationRole'],
    resultLevel: asString(record.resultLevel) as HrEventParticipant['resultLevel'],
    feedback: asString(record.feedback) ?? '',
  }
}

function normalizeEvent(raw: unknown): HrEvent | null {
  const record = asRecord(raw)
  if (!record) return null

  const id = asNumber(record.id)
  const title = asString(record.title) ?? asString(record.eventName)
  if (typeof id !== 'number' || !title) return null

  const participants = asArray(
    record.participants ?? record.invitedParticipants ?? record.experts ?? record.users
  )
    .map(normalizeParticipant)
    .filter((participant): participant is HrEventParticipant => participant !== null)

  return {
    id,
    title,
    description: asString(record.description) ?? '',
    organizer: asString(record.organizer),
    createdAt: asString(record.createdAt),
    eventType: asString(record.eventType),
    eventDate: asString(record.eventDate),
    participants,
    participantsCount:
      asNumber(record.invitedCount) ?? asNumber(record.participantsCount) ?? participants.length,
  }
}

function extractEvents(payload: unknown): HrEvent[] {
  if (Array.isArray(payload)) {
    return payload.map(normalizeEvent).filter((event): event is HrEvent => event !== null)
  }

  const record = asRecord(payload)
  if (!record) return []

  const nested =
    record.content ?? record.events ?? record.items ?? record.data ?? record.results ?? record.eventList

  return asArray(nested).map(normalizeEvent).filter((event): event is HrEvent => event !== null)
}

function extractEvent(payload: unknown): HrEvent | null {
  const direct = normalizeEvent(payload)
  if (direct) return direct

  const record = asRecord(payload)
  if (!record) return null

  return normalizeEvent(record.event ?? record.data ?? record.result)
}

function extractInviteResponse(payload: unknown): InviteExpertToEventResponse {
  const record = asRecord(payload)
  if (!record) return {}

  return {
    message: asString(record.message),
    inviterUserId: asNumber(record.inviterUserId),
    invitedUserId: asNumber(record.invitedUserId),
    expertId: asNumber(record.expertId),
    eventId: asNumber(record.eventId),
    eventTitle: asString(record.eventTitle) ?? asString(record.eventName),
  }
}

function extractParticipantExperienceResponse(payload: unknown): SaveParticipantExperienceResponse {
  const record = asRecord(payload)
  if (!record) return {}

  return {
    eventId: asNumber(record.eventId),
    userId: asNumber(record.userId),
    participationRole: asString(record.participationRole) as SaveParticipantExperienceResponse['participationRole'],
    resultLevel: asString(record.resultLevel) as SaveParticipantExperienceResponse['resultLevel'],
    feedback: asString(record.feedback) ?? '',
  }
}

export function useHrEvents(enabled = true) {
  return useQuery({
    queryKey: HR_EVENTS_QUERY_KEY,
    queryFn: async () => {
      const response = await api.get('/hr/events')
      return extractEvents(response.data)
    },
    enabled,
  })
}

export function useHrEventDetails(eventId: number | null, enabled = true) {
  return useQuery({
    queryKey: [...HR_EVENTS_QUERY_KEY, eventId],
    queryFn: async () => {
      const response = await api.get(`/hr/events/${eventId}`)
      return extractEvent(response.data)
    },
    enabled: enabled && typeof eventId === 'number',
  })
}

export function useCreateHrEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateHrEventRequest) => {
      const response = await api.post('/hr/events', payload)
      return extractEvent(response.data)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: HR_EVENTS_QUERY_KEY })
    },
  })
}

export function useDeleteHrEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (eventId: number) => {
      await api.delete(`/hr/events/${eventId}`)
      return eventId
    },
    onSuccess: async (eventId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: HR_EVENTS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: [...HR_EVENTS_QUERY_KEY, eventId] }),
      ])
      queryClient.removeQueries({ queryKey: [...HR_EVENTS_QUERY_KEY, eventId] })
    },
  })
}

export function useInviteExpertToEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: InviteExpertToEventRequest) => {
      const response = await api.post(`/hr/events/${payload.eventId}/invitations`, {
        userId: payload.expertId,
      })
      return extractInviteResponse(response.data)
    },
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: HR_EVENTS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: [...HR_EVENTS_QUERY_KEY, variables.eventId] }),
      ])
    },
  })
}

export function useSaveParticipantExperience() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: SaveParticipantExperienceRequest) => {
      const response = await api.put(
        `/hr/events/${payload.eventId}/participants/${payload.userId}/experience`,
        {
          participationRole: payload.participationRole,
          resultLevel: payload.resultLevel,
          feedback: payload.feedback,
        }
      )
      return extractParticipantExperienceResponse(response.data)
    },
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: HR_EVENTS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: [...HR_EVENTS_QUERY_KEY, variables.eventId] }),
        queryClient.invalidateQueries({ queryKey: ['userProfileCard', variables.userId] }),
      ])
    },
  })
}
