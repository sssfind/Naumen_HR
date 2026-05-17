import type { DirectoryEmployee } from '@/types/employee'
import type { MentorSummary } from '@/types/user'

export function mentorSummaryToDirectory(mentor: MentorSummary): DirectoryEmployee {
  return {
    userId: mentor.userId,
    email: mentor.email,
    fullName: mentor.fullName,
    role: mentor.role,
    departmentId: null,
    department: mentor.department,
    parentDepartmentName: mentor.parentDepartmentName,
    divisionName: mentor.divisionName,
    responsibilityZone: mentor.responsibilityZone,
    phone: mentor.phone,
    position: mentor.position,
    photoUrl: mentor.photoUrl,
    team: mentor.team,
  }
}
