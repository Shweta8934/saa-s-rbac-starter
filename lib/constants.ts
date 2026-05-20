// Constants
export const APP_NAME = 'SaaS RBAC Starter'
export const APP_DESCRIPTION = 'Multi-tenant SaaS platform with dynamic RBAC'

// Role slugs
export const ROLE_SLUGS = {
  SUPER_ADMIN: 'super-admin',
  ORG_ADMIN: 'org-admin',
  HR: 'hr',
  RECRUITER: 'recruiter',
  DEVELOPER: 'developer',
  BILLING: 'billing',
  MEMBER: 'member',
} as const

// Modules for permissions
export const MODULES = [
  { id: 'organizations', label: 'Organizations' },
  { id: 'members', label: 'Members' },
  { id: 'roles', label: 'Roles' },
  { id: 'invites', label: 'Invites' },
  { id: 'billing', label: 'Billing' },
  { id: 'subscription', label: 'Subscription' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'jobs', label: 'Jobs' },
  { id: 'candidates', label: 'Candidates' },
  { id: 'interviews', label: 'Interviews' },
  { id: 'settings', label: 'Settings' },
  { id: 'reports', label: 'Reports' },
] as const

// Actions for permissions
export const ACTIONS = [
  { id: 'view', label: 'View' },
  { id: 'create', label: 'Create' },
  { id: 'update', label: 'Update' },
  { id: 'delete', label: 'Delete' },
  { id: 'invite', label: 'Invite' },
  { id: 'manage', label: 'Manage' },
  { id: 'approve', label: 'Approve' },
  { id: 'reject', label: 'Reject' },
  { id: 'export', label: 'Export' },
] as const

// Industry options
export const INDUSTRIES = [
  { value: 'technology', label: 'Technology' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance' },
  { value: 'education', label: 'Education' },
  { value: 'retail', label: 'Retail' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'other', label: 'Other' },
] as const

// Status badges colors
export const STATUS_COLORS = {
  active: 'bg-emerald-100 text-emerald-800',
  inactive: 'bg-gray-100 text-gray-800',
  suspended: 'bg-red-100 text-red-800',
  pending: 'bg-amber-100 text-amber-800',
  expired: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
  accepted: 'bg-emerald-100 text-emerald-800',
  success: 'bg-emerald-100 text-emerald-800',
  failed: 'bg-red-100 text-red-800',
} as const

// Plan badge colors
export const PLAN_COLORS = {
  free: 'bg-gray-100 text-gray-800',
  starter: 'bg-blue-100 text-blue-800',
  professional: 'bg-indigo-100 text-indigo-800',
  enterprise: 'bg-amber-100 text-amber-800',
} as const

export const PLAN_NAMES = {
  free: 'Free',
  starter: 'Starter',
  professional: 'Professional',
  enterprise: 'Enterprise',
} as const

export const PLAN_PRICING = {
  free: { monthly: 0, yearly: 0 },
  starter: { monthly: 29, yearly: 290 },
  professional: { monthly: 79, yearly: 790 },
  enterprise: { monthly: 199, yearly: 1990 },
} as const

export const PLAN_FEATURES = {
  free: {
    members: 5,
    projects: 3,
    storage: 5 * 1024,
    customRoles: false,
    advancedAnalytics: false,
    prioritySupport: false,
    sso: false,
  },
  starter: {
    members: 15,
    projects: 20,
    storage: 50 * 1024,
    customRoles: false,
    advancedAnalytics: false,
    prioritySupport: true,
    sso: false,
  },
  professional: {
    members: 50,
    projects: 100,
    storage: 250 * 1024,
    customRoles: true,
    advancedAnalytics: true,
    prioritySupport: true,
    sso: false,
  },
  enterprise: {
    members: -1,
    projects: -1,
    storage: -1,
    customRoles: true,
    advancedAnalytics: true,
    prioritySupport: true,
    sso: true,
  },
} as const

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

// Date format
export const DATE_FORMAT = 'MMM d, yyyy'
export const DATETIME_FORMAT = 'MMM d, yyyy h:mm a'

// Invite expiry in days
export const INVITE_EXPIRY_DAYS = 7

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_USER: 'saas_rbac_user',
  THEME: 'saas_rbac_theme',
} as const
