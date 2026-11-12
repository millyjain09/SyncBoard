import { Role } from '../types/mavericks';

export type PermissionAction =
  | 'manage_billing'
  | 'manage_members'
  | 'create_project'
  | 'customize_board'
  | 'connect_github'
  | 'manage_sprints'
  | 'create_task'
  | 'move_task'
  | 'log_time'
  | 'comment';

const ROLE_MATRIX: Record<Role, Record<PermissionAction, boolean>> = {
  OWNER: {
    manage_billing: true,
    manage_members: true,
    create_project: true,
    customize_board: true,
    connect_github: true,
    manage_sprints: true,
    create_task: true,
    move_task: true,
    log_time: true,
    comment: true,
  },
  ADMIN: {
    manage_billing: false,
    manage_members: false,
    create_project: true,
    customize_board: true,
    connect_github: true,
    manage_sprints: true,
    create_task: true,
    move_task: true,
    log_time: true,
    comment: true,
  },
  MEMBER: {
    manage_billing: false,
    manage_members: false,
    create_project: false,
    customize_board: false,
    connect_github: false,
    manage_sprints: false,
    create_task: true,
    move_task: true,
    log_time: true,
    comment: true,
  },
  GUEST: {
    manage_billing: false,
    manage_members: false,
    create_project: false,
    customize_board: false,
    connect_github: false,
    manage_sprints: false,
    create_task: false,
    move_task: false,
    log_time: false,
    comment: true,
  },
};

export function canPerform(role: Role, action: PermissionAction): boolean {
  return ROLE_MATRIX[role][action];
}

export function getDeniedReason(role: Role, action: PermissionAction): string {
  const actionLabel: Record<PermissionAction, string> = {
    manage_billing: 'manage workspace billing',
    manage_members: 'invite or manage team members',
    create_project: 'create projects or modify project settings',
    customize_board: 'customize board columns',
    connect_github: 'configure GitHub repository connections',
    manage_sprints: 'edit or complete sprints',
    create_task: 'create new tasks',
    move_task: 'move or update task statuses',
    log_time: 'log working hours',
    comment: 'post comments',
  };
  return `As a ${role}, you don't have permission to ${actionLabel[action]}. Ask an Admin or Owner for access.`;
}

