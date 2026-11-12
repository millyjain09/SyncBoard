import { Sprint, Task, TaskStatus, TimesheetEntry } from '../types/mavericks';

/**
 * Backend Integration Adapter Contract
 * Designed to align with SyncBoard/backend (Express 5 + Socket.io + Prisma/PostgreSQL).
 * Currently backed by local state in MavericksContext; swap implementations here
 * when connecting live REST endpoints and WebSocket events.
 */
export interface MavericksApiClient {
  baseUrl: string;
  moveTask: (taskId: string, status: TaskStatus) => Promise<{ ok: boolean; error?: string }>;
  createTask: (payload: Partial<Task>) => Promise<Task>;
  completeSprint: (sprintId: string, destination: 'next-sprint' | 'backlog') => Promise<Sprint>;
  logTime: (entry: TimesheetEntry) => Promise<TimesheetEntry>;
  syncGitHubRepo: (projectId: string) => Promise<{ syncedAt: string }>;
}

export const defaultApiConfig = {
  apiBaseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api',
  socketUrl: import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:4000',
};

