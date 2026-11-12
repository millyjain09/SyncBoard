import { Member, Task, TaskPriority, TaskStatus, TaskType } from '../types/mavericks';

export interface FilterChip {
  id: string;
  field: string;
  operator: string;
  value: string;
  raw: string;
}

export interface ParsedQueryResult {
  chips: FilterChip[];
  freeText: string[];
  error: string | null;
  suggestion: string | null;
}

const VALID_FIELDS = ['assignee', 'priority', 'status', 'type', 'label', 'blocked', 'sprint', 'pr'];

export function parseSmartQuery(raw: string): ParsedQueryResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { chips: [], freeText: [], error: null, suggestion: null };
  }

  // Split by AND (case-insensitive) while preserving structured tokens
  const clauses = trimmed.split(/\s+AND\s+/i).map((c) => c.trim()).filter(Boolean);
  const chips: FilterChip[] = [];
  const freeText: string[] = [];
  let error: string | null = null;
  let suggestion: string | null = null;

  clauses.forEach((clause, idx) => {
    const match = clause.match(/^([a-zA-Z]+)\s*(=|!=|:)\s*(.+)$/);
    if (match) {
      const field = match[1].toLowerCase();
      const operator = match[2];
      const value = match[3].replace(/^["']|["']$/g, '').trim();

      if (!VALID_FIELDS.includes(field)) {
        error = `Unknown filter field "${field}".`;
        suggestion = `Try fields: ${VALID_FIELDS.join(', ')} (e.g. assignee = me AND priority = high)`;
      } else if (!value) {
        error = `Missing value after "${field} ${operator}".`;
        suggestion = `Provide a value such as "${field} = high" or "${field} = me".`;
      } else {
        chips.push({
          id: `chip-${idx}-${field}`,
          field,
          operator,
          value,
          raw: clause,
        });
      }
    } else if (clause.includes('=') || clause.includes(':')) {
      error = `Could not parse "${clause}".`;
      suggestion = 'Use syntax like: assignee = me AND priority = high';
    } else {
      freeText.push(clause.toLowerCase());
    }
  });

  return { chips, freeText, error, suggestion };
}

export function filterTasksByQuery(
  tasks: Task[],
  parsed: ParsedQueryResult,
  members: Member[],
  currentUserId: string,
  extraAssigneeId: string | 'ALL',
  extraPriority: TaskPriority | 'ALL'
): Task[] {
  return tasks.filter((task) => {
    if (extraAssigneeId !== 'ALL') {
      if (extraAssigneeId === 'UNASSIGNED' && task.assigneeId !== null) return false;
      if (extraAssigneeId !== 'UNASSIGNED' && task.assigneeId !== extraAssigneeId) return false;
    }

    if (extraPriority !== 'ALL' && task.priority !== extraPriority) {
      return false;
    }

    for (const chip of parsed.chips) {
      const val = chip.value.toLowerCase();
      const negate = chip.operator === '!=';
      let matched = true;

      switch (chip.field) {
        case 'assignee': {
          if (val === 'me') {
            matched = task.assigneeId === currentUserId;
          } else if (val === 'unassigned') {
            matched = task.assigneeId === null;
          } else {
            const member = members.find((m) => m.id === task.assigneeId);
            matched = Boolean(member && member.name.toLowerCase().includes(val));
          }
          break;
        }
        case 'priority': {
          matched = task.priority.toLowerCase() === val;
          break;
        }
        case 'status': {
          const normalized = task.status.toLowerCase().replace('_', ' ');
          matched = normalized === val || task.status.toLowerCase() === val;
          break;
        }
        case 'type': {
          matched = task.type.toLowerCase() === val;
          break;
        }
        case 'label': {
          matched = task.labels.some((l) => l.toLowerCase().includes(val));
          break;
        }
        case 'blocked': {
          const isBlocked = task.blockedBy.length > 0;
          matched = val === 'true' || val === 'yes' ? isBlocked : !isBlocked;
          break;
        }
        case 'pr': {
          if (val === 'merged') {
            matched = task.pullRequests.some((p) => p.status === 'MERGED');
          } else if (val === 'open') {
            matched = task.pullRequests.some((p) => p.status === 'OPEN');
          } else {
            matched = task.pullRequests.length > 0;
          }
          break;
        }
        default:
          matched = true;
      }

      if (negate ? matched : !matched) return false;
    }

    for (const term of parsed.freeText) {
      const haystack = `${task.id} ${task.title} ${task.description} ${task.labels.join(' ')}`.toLowerCase();
      if (!haystack.includes(term)) return false;
    }

    return true;
  });
}

export const PRIORITY_ORDER: Record<TaskPriority, number> = {
  URGENT: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  BACKLOG: 'Backlog',
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  TESTING: 'Testing',
  DONE: 'Done',
};

export const TYPE_LABELS: Record<TaskType, string> = {
  FEATURE: 'Feature',
  BUG: 'Bug',
  TASK: 'Task',
  CHORE: 'Chore',
};

