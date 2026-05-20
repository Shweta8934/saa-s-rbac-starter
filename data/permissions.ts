// Dummy Permissions Data
import type { Permission } from '@/types/rbac'

export const permissions: Permission[] = [
  // Organizations
  { id: 'org-view', module: 'organizations', action: 'view', label: 'View Organizations', description: 'View organization details' },
  { id: 'org-create', module: 'organizations', action: 'create', label: 'Create Organizations', description: 'Create new organizations' },
  { id: 'org-update', module: 'organizations', action: 'update', label: 'Update Organizations', description: 'Update organization details' },
  { id: 'org-delete', module: 'organizations', action: 'delete', label: 'Delete Organizations', description: 'Delete organizations' },
  { id: 'org-manage', module: 'organizations', action: 'manage', label: 'Manage Organizations', description: 'Full organization management' },

  // Members
  { id: 'members-view', module: 'members', action: 'view', label: 'View Members', description: 'View team members' },
  { id: 'members-create', module: 'members', action: 'create', label: 'Add Members', description: 'Add new team members' },
  { id: 'members-update', module: 'members', action: 'update', label: 'Update Members', description: 'Update member details' },
  { id: 'members-delete', module: 'members', action: 'delete', label: 'Remove Members', description: 'Remove team members' },
  { id: 'members-invite', module: 'members', action: 'invite', label: 'Invite Members', description: 'Send member invitations' },

  // Roles
  { id: 'roles-view', module: 'roles', action: 'view', label: 'View Roles', description: 'View roles and permissions' },
  { id: 'roles-create', module: 'roles', action: 'create', label: 'Create Roles', description: 'Create custom roles' },
  { id: 'roles-update', module: 'roles', action: 'update', label: 'Update Roles', description: 'Update role permissions' },
  { id: 'roles-delete', module: 'roles', action: 'delete', label: 'Delete Roles', description: 'Delete custom roles' },
  { id: 'roles-manage', module: 'roles', action: 'manage', label: 'Manage Roles', description: 'Full role management' },

  // Invites
  { id: 'invites-view', module: 'invites', action: 'view', label: 'View Invites', description: 'View pending invitations' },
  { id: 'invites-create', module: 'invites', action: 'create', label: 'Send Invites', description: 'Send new invitations' },
  { id: 'invites-delete', module: 'invites', action: 'delete', label: 'Cancel Invites', description: 'Cancel pending invitations' },

  // Billing
  { id: 'billing-view', module: 'billing', action: 'view', label: 'View Billing', description: 'View billing information' },
  { id: 'billing-manage', module: 'billing', action: 'manage', label: 'Manage Billing', description: 'Manage payment methods and billing' },
  { id: 'billing-export', module: 'billing', action: 'export', label: 'Export Billing', description: 'Export billing reports' },

  // Subscription
  { id: 'subscription-view', module: 'subscription', action: 'view', label: 'View Subscription', description: 'View subscription details' },
  { id: 'subscription-manage', module: 'subscription', action: 'manage', label: 'Manage Subscription', description: 'Upgrade/downgrade subscription' },

  // Dashboard
  { id: 'dashboard-view', module: 'dashboard', action: 'view', label: 'View Dashboard', description: 'Access dashboard' },

  // Jobs
  { id: 'jobs-view', module: 'jobs', action: 'view', label: 'View Jobs', description: 'View job listings' },
  { id: 'jobs-create', module: 'jobs', action: 'create', label: 'Create Jobs', description: 'Create job postings' },
  { id: 'jobs-update', module: 'jobs', action: 'update', label: 'Update Jobs', description: 'Update job details' },
  { id: 'jobs-delete', module: 'jobs', action: 'delete', label: 'Delete Jobs', description: 'Delete job postings' },
  { id: 'jobs-manage', module: 'jobs', action: 'manage', label: 'Manage Jobs', description: 'Full job management' },

  // Candidates
  { id: 'candidates-view', module: 'candidates', action: 'view', label: 'View Candidates', description: 'View candidate profiles' },
  { id: 'candidates-create', module: 'candidates', action: 'create', label: 'Add Candidates', description: 'Add new candidates' },
  { id: 'candidates-update', module: 'candidates', action: 'update', label: 'Update Candidates', description: 'Update candidate info' },
  { id: 'candidates-delete', module: 'candidates', action: 'delete', label: 'Delete Candidates', description: 'Remove candidates' },
  { id: 'candidates-approve', module: 'candidates', action: 'approve', label: 'Approve Candidates', description: 'Approve candidate applications' },
  { id: 'candidates-reject', module: 'candidates', action: 'reject', label: 'Reject Candidates', description: 'Reject candidate applications' },

  // Interviews
  { id: 'interviews-view', module: 'interviews', action: 'view', label: 'View Interviews', description: 'View interview schedules' },
  { id: 'interviews-create', module: 'interviews', action: 'create', label: 'Schedule Interviews', description: 'Schedule new interviews' },
  { id: 'interviews-update', module: 'interviews', action: 'update', label: 'Update Interviews', description: 'Update interview details' },
  { id: 'interviews-delete', module: 'interviews', action: 'delete', label: 'Cancel Interviews', description: 'Cancel scheduled interviews' },

  // Settings
  { id: 'settings-view', module: 'settings', action: 'view', label: 'View Settings', description: 'View settings' },
  { id: 'settings-update', module: 'settings', action: 'update', label: 'Update Settings', description: 'Update settings' },

  // Reports
  { id: 'reports-view', module: 'reports', action: 'view', label: 'View Reports', description: 'View reports and analytics' },
  { id: 'reports-export', module: 'reports', action: 'export', label: 'Export Reports', description: 'Export report data' },
]

export function getPermissionsByModule(module: string): Permission[] {
  return permissions.filter(p => p.module === module)
}

export function getPermissionById(id: string): Permission | undefined {
  return permissions.find(p => p.id === id)
}
