export type ProficiencyLevel = 'BASIC' | 'CONFIDENT' | 'EXPERT'

export type ReadinessEventType =
  | 'MENTORSHIP'
  | 'PUBLIC_SPEAKING'
  | 'JURY_WORK'
  | 'WORKSHOP_FACILITATION'
  | 'LECTURE_DELIVERY'
  | 'HACKATHON_PARTICIPATION'
  | 'EVENT_ORGANIZATION'

export type ParticipationRole =
  | 'SPEAKER'
  | 'MENTOR'
  | 'JURY'
  | 'PARTICIPANT'
  | 'ORGANIZER'

export type ResultLevel = 'NONE' | 'SHORTLIST' | 'WINNER'

export type UserMeCardRole = 'ROLE_EMPLOYEE' | 'ROLE_HR'

export interface UserMeCardSkill {
  userSkillId: number
  id: number
  name: string
  stars: number
  proficiencyLevel: ProficiencyLevel
}

export interface UserMeCardEvent {
  title: string
  eventType: string
  eventDate: string
  participationRole: ParticipationRole
  resultLevel: ResultLevel
  feedback: string
}

export interface UserMeCardSimilarPerson {
  id: number
  fullName: string
  department: string | null
  topSkills: string[]
  overlapCount: number
}

export interface UserMeCardResponse {
  id: number
  fullName: string
  email: string
  department: string | null
  role: UserMeCardRole
  initials: string
  readiness: ReadinessEventType[]
  professionalSkills: UserMeCardSkill[]
  expertSkills: UserMeCardSkill[]
  events: UserMeCardEvent[]
  similarPeople: UserMeCardSimilarPerson[]
}
