export type ConceptId =
  | 'linear-minimal'
  | 'dev-command'
  | 'human-workspace'
  | 'enterprise-exec'
  | 'creative-studio';

export type ScreenId = 'board' | 'task' | 'sprint' | 'timesheet' | 'team';

export type ViewportPreset = 'fluid' | '1440' | '1280' | '768' | '390';

export type SystemStateMode = 'normal' | 'loading' | 'offline' | 'empty';

export type Role = 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST';

export type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'TESTING' | 'DONE';

export type TaskPriority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';

export type TaskType = 'FEATURE' | 'BUG' | 'TASK' | 'CHORE';

export type PRStatus = 'OPEN' | 'MERGED' | 'CLOSED';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: string;
  memberCount: number;
}

export interface GitHubRepoConfig {
  connected: boolean;
  owner: string;
  repo: string;
  branch: string;
  lastSyncedAt: string;
  autoCompleteOnMerge: boolean;
  syncState: 'synced' | 'syncing' | 'error';
}

export interface Project {
  id: string;
  workspaceId: string;
  key: string;
  name: string;
  description: string;
  github: GitHubRepoConfig;
}

export interface BoardColumn {
  id: TaskStatus;
  title: string;
  wipLimit?: number;
  accentColor: string;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  author: string;
  timestamp: string;
  url: string;
}

export interface GitHubPR {
  id: string;
  number: number;
  title: string;
  branch: string;
  status: PRStatus;
  author: string;
  updatedAt: string;
  checksPassed: boolean;
}

export interface Comment {
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
  mentions?: string[];
}

export interface ActivityItem {
  id: string;
  actorId: string;
  action: string;
  target?: string;
  timestamp: string;
  kind: 'status' | 'github' | 'comment' | 'ai' | 'sprint' | 'team';
}

export interface Task {
  id: string; // e.g. "MOB-1"
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  assigneeId: string | null;
  storyPoints: number;
  sprintId: string | null;
  labels: string[];
  blockedBy: string[]; // Task IDs that block this task
  blocks: string[]; // Task IDs blocked by this task
  subtasks: SubTask[];
  commits: GitHubCommit[];
  pullRequests: GitHubPR[];
  comments: Comment[];
  activity: ActivityItem[];
  updatedAt: string;
}

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  status: 'ACTIVE' | 'PLANNED' | 'COMPLETED';
  startDate: string;
  endDate: string;
  goal: string;
  burndown: Array<{
    day: string;
    ideal: number;
    actual: number | null;
  }>;
  velocityHistory: Array<{
    sprintName: string;
    committed: number;
    completed: number;
  }>;
}

export interface SprintHistoryEntry {
  id: string;
  name: string;
  completedAt: string;
  completedPoints: number;
  totalPoints: number;
  completedCount: number;
  movedCount: number;
}

export interface TimesheetEntry {
  id: string;
  taskId: string;
  memberId: string;
  weekStart: string; // YYYY-MM-DD (Monday)
  days: {
    mon: number; // minutes
    tue: number;
    wed: number;
    thu: number;
    fri: number;
    sat: number;
    sun: number;
  };
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  title: string;
  avatarInitials: string;
  avatarColor: string;
  status: 'ACTIVE' | 'PENDING';
  online: boolean;
  lastActive: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  kind: 'assignment' | 'mention' | 'comment' | 'status' | 'github';
  taskId?: string;
}

export interface PermissionMatrixRow {
  capability: string;
  category: 'Workspace' | 'Projects & GitHub' | 'Tasks & Sprints' | 'Timesheets';
  OWNER: boolean;
  ADMIN: boolean;
  MEMBER: boolean;
  GUEST: boolean;
}

