export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  fullName: string
  department: string
  role: 'ROLE_EMPLOYEE' | 'ROLE_HR' | 'ROLE_MENTOR' | 'ROLE_TRAINEE'
}

export interface AuthResponse {
  token: string
  role: 'ROLE_EMPLOYEE' | 'ROLE_HR' | 'ROLE_MENTOR' | 'ROLE_TRAINEE'
  redirectUrl: string
  userId: number
  fullName: string
}

export interface UserInfoResponse {
  userId: number
  email: string
  fullName: string
  role: 'ROLE_EMPLOYEE' | 'ROLE_HR' | 'ROLE_MENTOR' | 'ROLE_TRAINEE'
  department: string
}

export interface StoredUser {
  userId: number
  fullName: string
  role: 'ROLE_EMPLOYEE' | 'ROLE_HR' | 'ROLE_MENTOR' | 'ROLE_TRAINEE'
}
