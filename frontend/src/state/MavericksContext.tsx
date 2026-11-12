import React, { createContext, useContext, useMemo, useState } from 'react';
import {
  DEFAULT_COLUMNS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SPRINTS,
  INITIAL_SPRINT_HISTORY,
  INITIAL_TASKS,
  INITIAL_TIMESHEETS,
  MEMBERS,
  PROJECTS,
  WORKSPACES,
} from '../data/seedData';
import {
  BoardColumn,
  ConceptId,
  Member,
  NotificationItem,
  Project,
  Role,
  ScreenId,
  Sprint,
  SprintHistoryEntry,
  SystemStateMode,
  Task,
  TaskPriority,
  TaskStatus,
  TaskType,
  TimesheetEntry,
  ViewportPreset,
  Workspace,
} from '../types/mavericks';
import { canPerform, getDeniedReason } from '../utils/permissions';
import { STATUS_LABELS } from '../utils/queryParser';

export interface ToastMessage {
  id: string;
  tone: 'success' | 'warning' | 'error' | 'info';
  title: string;
  description?: string;
}

export interface BlockingError {
  taskId: string;
  blockerId: string;
  blockerTitle: string;
  message: string;
  prMergedNote?: string;
}

interface MavericksContextValue {
  // Studio / Navigation controls
  concept: ConceptId;
  setConcept: (c: ConceptId) => void;
  screen: ScreenId;
  setScreen: (s: ScreenId) => void;
  viewport: ViewportPreset;
  setViewport: (v: ViewportPreset) => void;
  systemState: SystemStateMode;
  setSystemState: (s: SystemStateMode) => void;
  activeRole: Role;
  setActiveRole: (r: Role) => void;
  currentUser: Member;

  // Domain entities
  workspaces: Workspace[];
  activeWorkspace: Workspace;
  setActiveWorkspaceId: (id: string) => void;
  projects: Project[];
  activeProject: Project;
  setActiveProjectId: (id: string) => void;
  columns: BoardColumn[];
  tasks: Task[];
  selectedTaskId: string;
  selectedTask: Task;
  selectTask: (taskId: string, navigateToDetail?: boolean) => void;
  sprints: Sprint[];
  activeSprint: Sprint;
  sprintHistory: SprintHistoryEntry[];
  timesheets: TimesheetEntry[];
  members: Member[];
  notifications: NotificationItem[];

  // Filters & search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  assigneeFilter: string | 'ALL';
  setAssigneeFilter: (id: string | 'ALL') => void;
  priorityFilter: TaskPriority | 'ALL';
  setPriorityFilter: (p: TaskPriority | 'ALL') => void;

  // Global overlays
  commandBarOpen: boolean;
  setCommandBarOpen: (v: boolean) => void;
  notificationsOpen: boolean;
  setNotificationsOpen: (v: boolean) => void;
  githubModalOpen: boolean;
  setGithubModalOpen: (v: boolean) => void;
  createTaskModalOpen: boolean;
  setCreateTaskModalOpen: (v: boolean) => void;
  createTaskDefaultStatus: TaskStatus;
  openCreateTaskModal: (status?: TaskStatus) => void;
  completeSprintModalOpen: boolean;
  setCompleteSprintModalOpen: (v: boolean) => void;
  workspaceModalOpen: boolean;
  setWorkspaceModalOpen: (v: boolean) => void;
  boardSettingsOpen: boolean;
  setBoardSettingsOpen: (v: boolean) => void;

  // Blocking warning banner state
  blockingError: BlockingError | null;
  clearBlockingError: () => void;

  // Domain actions
  moveTask: (taskId: string, targetStatus: TaskStatus) => boolean;
  updateTask: (taskId: string, patch: Partial<Task>) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  addComment: (taskId: string, body: string) => void;
  createTask: (input: {
    title: string;
    description: string;
    priority: TaskPriority;
    type: TaskType;
    status: TaskStatus;
    storyPoints: number;
    assigneeId: string | null;
    labels: string[];
  }) => void;
  generateAIContent: (taskId: string, mode: 'description' | 'checklist' | 'summary') => Promise<string>;
  completeSprint: (destination: 'next-sprint' | 'backlog') => void;
  updateSprint: (sprintId: string, patch: Partial<Sprint>) => void;
  logTimesheetMinutes: (
    taskId: string,
    weekStart: string,
    dayKey: keyof TimesheetEntry['days'],
    minutes: number
  ) => { ok: boolean; error?: string };
  inviteMember: (email: string, role: Role, name?: string) => { ok: boolean; error?: string };
  updateMemberRole: (memberId: string, role: Role) => void;
  acceptPendingInvite: (memberId: string) => void;
  updateColumnTitle: (columnId: TaskStatus, title: string, wipLimit?: number) => void;
  toggleGitHubConnection: (connected: boolean, repo?: string) => void;
  triggerGitHubSync: () => void;
  createWorkspaceAndProject: (wsName: string, projectName: string, projectKey: string) => void;
  markAllNotificationsRead: () => void;

  // Toasts
  toasts: ToastMessage[];
  pushToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;
}

const MavericksContext = createContext<MavericksContextValue | null>(null);

export const MavericksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [concept, setConcept] = useState<ConceptId>('linear-minimal');
  const [screen, setScreen] = useState<ScreenId>('board');
  const [viewport, setViewport] = useState<ViewportPreset>('fluid');
  const [systemState, setSystemState] = useState<SystemStateMode>('normal');
  const [activeRole, setActiveRole] = useState<Role>('ADMIN');

  const [workspaces, setWorkspaces] = useState<Workspace[]>(WORKSPACES);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(WORKSPACES[0].id);
  const [projects, setProjects] = useState<Project[]>(PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState<string>(PROJECTS[0].id);
  const [columns, setColumns] = useState<BoardColumn[]>(DEFAULT_COLUMNS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('MOB-1');
  const [sprints, setSprints] = useState<Sprint[]>(INITIAL_SPRINTS);
  const [sprintHistory, setSprintHistory] = useState<SprintHistoryEntry[]>(INITIAL_SPRINT_HISTORY);
  const [timesheets, setTimesheets] = useState<TimesheetEntry[]>(INITIAL_TIMESHEETS);
  const [members, setMembers] = useState<Member[]>(MEMBERS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const [searchQuery, setSearchQuery] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState<string | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'ALL'>('ALL');

  const [commandBarOpen, setCommandBarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [githubModalOpen, setGithubModalOpen] = useState(false);
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [createTaskDefaultStatus, setCreateTaskDefaultStatus] = useState<TaskStatus>('TODO');
  const [completeSprintModalOpen, setCompleteSprintModalOpen] = useState(false);
  const [workspaceModalOpen, setWorkspaceModalOpen] = useState(false);
  const [boardSettingsOpen, setBoardSettingsOpen] = useState(false);

  const [blockingError, setBlockingError] = useState<BlockingError | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const pushToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev.slice(-3), { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const activeWorkspace = useMemo(
    () => workspaces.find((w) => w.id === activeWorkspaceId) ?? workspaces[0],
    [workspaces, activeWorkspaceId]
  );

  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId) ?? projects[0],
    [projects, activeProjectId]
  );

  const activeSprint = useMemo(
    () =>
      sprints.find((s) => s.projectId === activeProject.id && s.status === 'ACTIVE') ??
      sprints[0],
    [sprints, activeProject.id]
  );

  const selectedTask = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId) ?? tasks[0],
    [tasks, selectedTaskId]
  );

  // Current user corresponds to the previewed role so `assignee = me` and permissions work cleanly
  const currentUser = useMemo(() => {
    const match = members.find((m) => m.role === activeRole && m.status === 'ACTIVE');
    return match ?? members[1];
  }, [members, activeRole]);

  const selectTask = (taskId: string, navigateToDetail = true) => {
    setSelectedTaskId(taskId);
    setBlockingError(null);
    if (navigateToDetail) {
      setScreen('task');
    }
  };

  const openCreateTaskModal = (status: TaskStatus = 'TODO') => {
    if (!canPerform(activeRole, 'create_task')) {
      pushToast({
        tone: 'error',
        title: 'Permission required',
        description: getDeniedReason(activeRole, 'create_task'),
      });
      return;
    }
    setCreateTaskDefaultStatus(status);
    setCreateTaskModalOpen(true);
  };

  const moveTask = (taskId: string, targetStatus: TaskStatus): boolean => {
    if (!canPerform(activeRole, 'move_task')) {
      pushToast({
        tone: 'error',
        title: 'Permission denied',
        description: getDeniedReason(activeRole, 'move_task'),
      });
      return false;
    }

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return false;
    if (task.status === targetStatus) return true;

    // Enforce blocking rule when attempting to move to DONE
    if (targetStatus === 'DONE' && task.blockedBy.length > 0) {
      const unfinishedBlocker = task.blockedBy
        .map((bid) => tasks.find((t) => t.id === bid))
        .find((b) => b && b.status !== 'DONE');

      if (unfinishedBlocker) {
        const hasMergedPR = task.pullRequests.some((p) => p.status === 'MERGED');
        const message = `You cannot complete ${task.id} yet. Finish ${unfinishedBlocker.id} — ${unfinishedBlocker.title} first.`;
        const prMergedNote = hasMergedPR
          ? `PR #${task.pullRequests.find((p) => p.status === 'MERGED')?.number} is already merged, but the blocking rule remains enforced.`
          : undefined;

        setBlockingError({
          taskId: task.id,
          blockerId: unfinishedBlocker.id,
          blockerTitle: unfinishedBlocker.title,
          message,
          prMergedNote,
        });

        pushToast({
          tone: 'warning',
          title: `${task.id} is blocked by ${unfinishedBlocker.id}`,
          description: message,
        });
        return false;
      }
    }

    setBlockingError(null);
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: targetStatus,
              updatedAt: 'Just now',
              activity: [
                {
                  id: `act-${Date.now()}`,
                  actorId: currentUser.id,
                  action: `moved ${t.id} from ${STATUS_LABELS[t.status]} to ${STATUS_LABELS[targetStatus]}`,
                  timestamp: 'Just now',
                  kind: 'status',
                },
                ...t.activity,
              ],
            }
          : t
      )
    );

    if (targetStatus === 'DONE') {
      pushToast({
        tone: 'success',
        title: 'Nice work!',
        description: `Your task ${taskId} has been moved to Done.`,
      });
    } else {
      pushToast({
        tone: 'info',
        title: `${taskId} updated`,
        description: `Moved to ${STATUS_LABELS[targetStatus]}.`,
      });
    }
    return true;
  };

  const updateTask = (taskId: string, patch: Partial<Task>) => {
    if (patch.status) {
      const ok = moveTask(taskId, patch.status);
      if (!ok) return;
      const { status: _s, ...rest } = patch;
      if (Object.keys(rest).length === 0) return;
      patch = rest;
    }

    if (!canPerform(activeRole, 'move_task')) {
      pushToast({
        tone: 'error',
        title: 'Read-only access',
        description: getDeniedReason(activeRole, 'move_task'),
      });
      return;
    }

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...patch, updatedAt: 'Just now' } : t))
    );
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    if (!canPerform(activeRole, 'move_task')) {
      pushToast({
        tone: 'error',
        title: 'Read-only access',
        description: getDeniedReason(activeRole, 'move_task'),
      });
      return;
    }
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              subtasks: t.subtasks.map((st) =>
                st.id === subtaskId ? { ...st, completed: !st.completed } : st
              ),
            }
          : t
      )
    );
  };

  const addSubtask = (taskId: string, title: string) => {
    if (!title.trim()) return;
    if (!canPerform(activeRole, 'move_task')) {
      pushToast({
        tone: 'error',
        title: 'Permission denied',
        description: getDeniedReason(activeRole, 'move_task'),
      });
      return;
    }
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              subtasks: [...t.subtasks, { id: `st-${Date.now()}`, title: title.trim(), completed: false }],
            }
          : t
      )
    );
  };

  const addComment = (taskId: string, body: string) => {
    if (!body.trim()) return;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              comments: [
                ...t.comments,
                {
                  id: `c-${Date.now()}`,
                  authorId: currentUser.id,
                  body: body.trim(),
                  createdAt: 'Just now',
                },
              ],
              activity: [
                {
                  id: `act-${Date.now()}`,
                  actorId: currentUser.id,
                  action: 'commented on this issue',
                  timestamp: 'Just now',
                  kind: 'comment',
                },
                ...t.activity,
              ],
            }
          : t
      )
    );
    pushToast({ tone: 'success', title: 'Comment posted', description: `Added to ${taskId}.` });
  };

  const createTask = (input: {
    title: string;
    description: string;
    priority: TaskPriority;
    type: TaskType;
    status: TaskStatus;
    storyPoints: number;
    assigneeId: string | null;
    labels: string[];
  }) => {
    const nextNum =
      tasks.reduce((max, t) => {
        const n = parseInt(t.id.split('-')[1] || '0', 10);
        return Number.isNaN(n) ? max : Math.max(max, n);
      }, 10) + 1;

    const newTask: Task = {
      id: `${activeProject.key}-${nextNum}`,
      projectId: activeProject.id,
      title: input.title,
      description: input.description || 'No description provided yet.',
      status: input.status,
      priority: input.priority,
      type: input.type,
      assigneeId: input.assigneeId,
      storyPoints: input.storyPoints,
      sprintId: input.status === 'BACKLOG' ? null : activeSprint.id,
      labels: input.labels,
      blockedBy: [],
      blocks: [],
      subtasks: [],
      commits: [],
      pullRequests: [],
      comments: [],
      activity: [
        {
          id: `act-${Date.now()}`,
          actorId: currentUser.id,
          action: `created ${activeProject.key}-${nextNum}`,
          timestamp: 'Just now',
          kind: 'status',
        },
      ],
      updatedAt: 'Just now',
    };

    setTasks((prev) => [newTask, ...prev]);
    setCreateTaskModalOpen(false);
    pushToast({
      tone: 'success',
      title: `${newTask.id} created`,
      description: `"${newTask.title}" added to ${STATUS_LABELS[newTask.status]}.`,
    });
  };

  const generateAIContent = async (
    taskId: string,
    mode: 'description' | 'checklist' | 'summary'
  ): Promise<string> => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return '';

    await new Promise((r) => setTimeout(r, 650));

    if (mode === 'description') {
      const generated = `${task.description}\n\nAI Acceptance Criteria:\n• Ensure idempotent API state transitions with optimistic UI rollback.\n• Verify GitHub webhook sync reflects commit & PR status within 5s.\n• Confirm WCAG AA contrast and responsive behavior across 390px–1440px.`;
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                description: generated,
                activity: [
                  {
                    id: `act-${Date.now()}`,
                    actorId: currentUser.id,
                    action: 'used Mavericks AI to enrich task description',
                    timestamp: 'Just now',
                    kind: 'ai',
                  },
                  ...t.activity,
                ],
              }
            : t
        )
      );
      pushToast({ tone: 'success', title: 'AI description ready', description: `Enhanced ${task.id}.` });
      return generated;
    }

    if (mode === 'checklist') {
      const generatedSubtasks = [
        { id: `st-ai-${Date.now()}-1`, title: 'Add integration test for edge-case error state', completed: false },
        { id: `st-ai-${Date.now()}-2`, title: 'Verify GitHub PR status check & merge gate', completed: false },
      ];
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                subtasks: [...t.subtasks, ...generatedSubtasks],
                activity: [
                  {
                    id: `act-${Date.now()}`,
                    actorId: currentUser.id,
                    action: 'generated 2 checklist items with Mavericks AI',
                    timestamp: 'Just now',
                    kind: 'ai',
                  },
                  ...t.activity,
                ],
              }
            : t
        )
      );
      pushToast({ tone: 'success', title: 'Checklist generated', description: 'Added 2 AI subtasks.' });
      return 'Added 2 subtasks';
    }

    // Discussion summary
    const summary =
      task.comments.length > 0
        ? `AI Thread Summary (${task.comments.length} comments): Code changes are verified and PR checks pass on staging. Completion depends on resolving ${
            task.blockedBy.length ? task.blockedBy.join(', ') : 'final QA sign-off'
          }. Next owner action: verify production credentials before flipping status to Done.`
        : `AI Summary for ${task.id}: Currently in ${STATUS_LABELS[task.status]} (${task.storyPoints} pts). No discussion blockers logged yet; ready for engineering execution.`;
    pushToast({ tone: 'info', title: 'Thread summarized', description: 'Mavericks AI generated a concise summary.' });
    return summary;
  };

  const completeSprint = (destination: 'next-sprint' | 'backlog') => {
    if (!canPerform(activeRole, 'manage_sprints')) {
      pushToast({
        tone: 'error',
        title: 'Permission denied',
        description: getDeniedReason(activeRole, 'manage_sprints'),
      });
      return;
    }

    const sprintTasks = tasks.filter((t) => t.sprintId === activeSprint.id);
    const doneTasks = sprintTasks.filter((t) => t.status === 'DONE');
    const unfinished = sprintTasks.filter((t) => t.status !== 'DONE');
    const nextSprint = sprints.find((s) => s.status === 'PLANNED');

    const completedPoints = doneTasks.reduce((sum, t) => sum + t.storyPoints, 0);
    const totalPoints = sprintTasks.reduce((sum, t) => sum + t.storyPoints, 0);

    setSprintHistory((prev) => [
      {
        id: `sh-${Date.now()}`,
        name: activeSprint.name,
        completedAt: 'Nov 12, 2026',
        completedPoints,
        totalPoints,
        completedCount: doneTasks.length,
        movedCount: unfinished.length,
      },
      ...prev,
    ]);

    setTasks((prev) =>
      prev.map((t) => {
        if (t.sprintId !== activeSprint.id || t.status === 'DONE') return t;
        return {
          ...t,
          sprintId: destination === 'next-sprint' && nextSprint ? nextSprint.id : null,
          status: destination === 'backlog' ? 'BACKLOG' : t.status,
        };
      })
    );

    setSprints((prev) =>
      prev.map((s) => {
        if (s.id === activeSprint.id) return { ...s, status: 'COMPLETED' };
        if (nextSprint && s.id === nextSprint.id) return { ...s, status: 'ACTIVE' };
        return s;
      })
    );

    setCompleteSprintModalOpen(false);
    pushToast({
      tone: 'success',
      title: 'Sprint completed!',
      description: `${doneTasks.length} tasks shipped (${completedPoints} pts). ${unfinished.length} unfinished tasks moved to ${
        destination === 'next-sprint' && nextSprint ? nextSprint.name : 'Backlog'
      }.`,
    });
  };

  const updateSprint = (sprintId: string, patch: Partial<Sprint>) => {
    if (!canPerform(activeRole, 'manage_sprints')) {
      pushToast({
        tone: 'error',
        title: 'Permission denied',
        description: getDeniedReason(activeRole, 'manage_sprints'),
      });
      return;
    }
    setSprints((prev) => prev.map((s) => (s.id === sprintId ? { ...s, ...patch } : s)));
    pushToast({ tone: 'success', title: 'Sprint updated', description: 'Changes saved.' });
  };

  const logTimesheetMinutes = (
    taskId: string,
    weekStart: string,
    dayKey: keyof TimesheetEntry['days'],
    minutes: number
  ): { ok: boolean; error?: string } => {
    if (!canPerform(activeRole, 'log_time')) {
      const err = getDeniedReason(activeRole, 'log_time');
      pushToast({ tone: 'error', title: 'Permission denied', description: err });
      return { ok: false, error: err };
    }

    if (Number.isNaN(minutes) || minutes < 1) {
      return { ok: false, error: 'Minimum time entry is 1 minute (1m). Negative or zero entries are not allowed.' };
    }
    if (minutes > 1440) {
      return { ok: false, error: 'Maximum allowed is 24 hours (1,440 minutes) per task per day.' };
    }

    setTimesheets((prev) => {
      const existing = prev.find(
        (e) => e.taskId === taskId && e.weekStart === weekStart && e.memberId === currentUser.id
      );
      if (existing) {
        return prev.map((e) =>
          e.id === existing.id ? { ...e, days: { ...e.days, [dayKey]: minutes } } : e
        );
      }
      const newEntry: TimesheetEntry = {
        id: `ts-${Date.now()}`,
        taskId,
        memberId: currentUser.id,
        weekStart,
        days: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0, [dayKey]: minutes },
      };
      return [...prev, newEntry];
    });

    pushToast({
      tone: 'success',
      title: 'Time logged',
      description: `Recorded ${Math.floor(minutes / 60)}h ${minutes % 60}m on ${taskId}.`,
    });
    return { ok: true };
  };

  const inviteMember = (email: string, role: Role, name?: string): { ok: boolean; error?: string } => {
    if (!canPerform(activeRole, 'manage_members')) {
      const err = getDeniedReason(activeRole, 'manage_members');
      pushToast({ tone: 'error', title: 'Owner access required', description: err });
      return { ok: false, error: err };
    }
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return { ok: false, error: 'Please enter a valid work email address.' };
    }
    if (members.some((m) => m.email.toLowerCase() === cleanEmail)) {
      return { ok: false, error: 'This teammate is already in Acme Tech.' };
    }

    const derivedName =
      name?.trim() ||
      cleanEmail
        .split('@')[0]
        .split(/[._-]/)
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(' ');
    const initials = derivedName
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const newMember: Member = {
      id: `mem-${Date.now()}`,
      name: derivedName,
      email: cleanEmail,
      role,
      title: role === 'GUEST' ? 'External Collaborator' : 'Software Engineer',
      avatarInitials: initials || 'TM',
      avatarColor: '#6366F1',
      status: 'PENDING',
      online: false,
      lastActive: 'Invited just now',
    };

    setMembers((prev) => [...prev, newMember]);
    pushToast({
      tone: 'success',
      title: 'Invitation sent',
      description: `Invited ${cleanEmail} as ${role}.`,
    });
    return { ok: true };
  };

  const updateMemberRole = (memberId: string, role: Role) => {
    if (!canPerform(activeRole, 'manage_members')) {
      pushToast({
        tone: 'error',
        title: 'Owner access required',
        description: getDeniedReason(activeRole, 'manage_members'),
      });
      return;
    }
    setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, role } : m)));
    pushToast({ tone: 'success', title: 'Role updated', description: `Permissions changed to ${role}.` });
  };

  const acceptPendingInvite = (memberId: string) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId ? { ...m, status: 'ACTIVE', online: true, lastActive: 'Joined just now' } : m
      )
    );
    pushToast({
      tone: 'success',
      title: 'Welcome aboard!',
      description: 'Teammate accepted the workspace invitation.',
    });
  };

  const updateColumnTitle = (columnId: TaskStatus, title: string, wipLimit?: number) => {
    if (!canPerform(activeRole, 'customize_board')) {
      pushToast({
        tone: 'error',
        title: 'Permission denied',
        description: getDeniedReason(activeRole, 'customize_board'),
      });
      return;
    }
    setColumns((prev) =>
      prev.map((c) => (c.id === columnId ? { ...c, title: title.trim() || c.title, wipLimit } : c))
    );
    pushToast({ tone: 'success', title: 'Board updated', description: 'Column settings saved.' });
  };

  const toggleGitHubConnection = (connected: boolean, repo?: string) => {
    if (!canPerform(activeRole, 'connect_github')) {
      pushToast({
        tone: 'error',
        title: 'Permission denied',
        description: getDeniedReason(activeRole, 'connect_github'),
      });
      return;
    }
    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeProject.id
          ? {
              ...p,
              github: {
                ...p.github,
                connected,
                repo: repo || p.github.repo,
                lastSyncedAt: 'Just now',
                syncState: 'synced',
              },
            }
          : p
      )
    );
    pushToast({
      tone: connected ? 'success' : 'info',
      title: connected ? 'GitHub connected' : 'GitHub disconnected',
      description: connected
        ? `Synced ${activeProject.github.owner}/${repo || activeProject.github.repo}.`
        : 'Repository webhook paused.',
    });
  };

  const triggerGitHubSync = () => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeProject.id
          ? { ...p, github: { ...p.github, syncState: 'syncing' } }
          : p
      )
    );
    setTimeout(() => {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === activeProject.id
            ? { ...p, github: { ...p.github, syncState: 'synced', lastSyncedAt: 'Just now' } }
            : p
        )
      );
      pushToast({
        tone: 'success',
        title: 'GitHub synced',
        description: 'Latest commits and PR statuses are up to date.',
      });
    }, 650);
  };

  const createWorkspaceAndProject = (wsName: string, projectName: string, projectKey: string) => {
    if (!canPerform(activeRole, 'create_project')) {
      pushToast({
        tone: 'error',
        title: 'Permission denied',
        description: getDeniedReason(activeRole, 'create_project'),
      });
      return;
    }
    const wsId = `ws-${Date.now()}`;
    const projId = `proj-${Date.now()}`;
    const newWs: Workspace = {
      id: wsId,
      name: wsName.trim() || 'New Workspace',
      slug: (wsName || 'new-workspace').toLowerCase().replace(/\s+/g, '-'),
      plan: 'Pro',
      memberCount: 1,
    };
    const newProj: Project = {
      id: projId,
      workspaceId: wsId,
      key: (projectKey || 'PRJ').toUpperCase().slice(0, 4),
      name: projectName.trim() || 'New Project',
      description: 'Freshly initialized Mavericks workspace project.',
      github: {
        connected: false,
        owner: newWs.slug,
        repo: 'app-repo',
        branch: 'main',
        lastSyncedAt: 'Never',
        autoCompleteOnMerge: true,
        syncState: 'synced',
      },
    };
    setWorkspaces((prev) => [...prev, newWs]);
    setProjects((prev) => [...prev, newProj]);
    setActiveWorkspaceId(wsId);
    setActiveProjectId(projId);
    setWorkspaceModalOpen(false);
    pushToast({
      tone: 'success',
      title: 'Workspace ready!',
      description: `Created ${newWs.name} / ${newProj.name}.`,
    });
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <MavericksContext.Provider
      value={{
        concept,
        setConcept,
        screen,
        setScreen,
        viewport,
        setViewport,
        systemState,
        setSystemState,
        activeRole,
        setActiveRole,
        currentUser,
        workspaces,
        activeWorkspace,
        setActiveWorkspaceId,
        projects,
        activeProject,
        setActiveProjectId,
        columns,
        tasks,
        selectedTaskId,
        selectedTask,
        selectTask,
        sprints,
        activeSprint,
        sprintHistory,
        timesheets,
        members,
        notifications,
        searchQuery,
        setSearchQuery,
        assigneeFilter,
        setAssigneeFilter,
        priorityFilter,
        setPriorityFilter,
        commandBarOpen,
        setCommandBarOpen,
        notificationsOpen,
        setNotificationsOpen,
        githubModalOpen,
        setGithubModalOpen,
        createTaskModalOpen,
        setCreateTaskModalOpen,
        createTaskDefaultStatus,
        openCreateTaskModal,
        completeSprintModalOpen,
        setCompleteSprintModalOpen,
        workspaceModalOpen,
        setWorkspaceModalOpen,
        boardSettingsOpen,
        setBoardSettingsOpen,
        blockingError,
        clearBlockingError: () => setBlockingError(null),
        moveTask,
        updateTask,
        toggleSubtask,
        addSubtask,
        addComment,
        createTask,
        generateAIContent,
        completeSprint,
        updateSprint,
        logTimesheetMinutes,
        inviteMember,
        updateMemberRole,
        acceptPendingInvite,
        updateColumnTitle,
        toggleGitHubConnection,
        triggerGitHubSync,
        createWorkspaceAndProject,
        markAllNotificationsRead,
        toasts,
        pushToast,
        dismissToast,
      }}
    >
      {children}
    </MavericksContext.Provider>
  );
};

export function useMavericks() {
  const ctx = useContext(MavericksContext);
  if (!ctx) throw new Error('useMavericks must be used inside MavericksProvider');
  return ctx;
}

