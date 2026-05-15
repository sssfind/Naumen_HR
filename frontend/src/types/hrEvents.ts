export interface HrEventParticipant {
  id: number
  fullName: string
  department: string
  email?: string
  invitedAt?: string
  status?: string
  profileEventSaved?: boolean
  participationRole?: ParticipationRole
  resultLevel?: ResultLevel
  feedback?: string
}

export interface HrEvent {
  id: number
  title: string
  description: string
  organizer?: string
  createdAt?: string
  eventType?: string
  eventDate?: string
  participants: HrEventParticipant[]
  participantsCount: number
}

export interface CreateHrEventRequest {
  title: string
  description: string
}

export interface InviteExpertToEventRequest {
  expertId: number
  eventId: number
}

export interface InviteExpertToEventResponse {
  message?: string
  inviterUserId?: number
  invitedUserId?: number
  expertId?: number
  eventId?: number
  eventTitle?: string
}

export type ParticipationRole = 'SPEAKER' | 'MENTOR' | 'JURY' | 'PARTICIPANT' | 'ORGANIZER'

export type ResultLevel = 'NONE' | 'SHORTLIST' | 'WINNER'

export interface SaveParticipantExperienceRequest {
  eventId: number
  userId: number
  participationRole: ParticipationRole
  resultLevel: ResultLevel
  feedback: string
}

export interface SaveParticipantExperienceResponse {
  eventId?: number
  userId?: number
  participationRole?: ParticipationRole
  resultLevel?: ResultLevel
  feedback?: string
}
