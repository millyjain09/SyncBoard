import React, { useMemo, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Flag,
  GitBranch,
  Github,
  Lock,
  Plus,
  Search,
  Sliders,
  Sparkles,
  X,
} from 'lucide-react';
import {
  Avatar,
  EmptyStateIllustration,
  PRBadge,
  PriorityBadge,
  SkeletonBoard,
  TaskTypeBadge,
} from '../components/shared/CommonAtoms';
import { useMavericks } from '../state/MavericksContext';
import { CONCEPT_THEMES, getTypeStripeColor } from '../themes/conceptTokens';
import { BoardColumn, ConceptId, Task, TaskPriority, TaskStatus } from '../types/mavericks';
import { canPerform } from '../utils/permissions';
import { filterTasksByQuery, parseSmartQuery } from '../utils/queryParser';

interface TaskCardProps {
  task: Task;
  conceptId: ConceptId;
  isOverlay?: boolean;
}

const TaskCardContent: React.FC<TaskCardProps> = ({ task, conceptId, isOverlay = false }) => {
  const { members, tasks, selectTask, moveTask, activeRole } = useMavericks();
  const theme = CONCEPT_THEMES[conceptId];
  const assignee = members.find((m) => m.id === task.assigneeId);

  const unresolvedBlockers = task.blockedBy
    .map((id) => tasks.find((t) => t.id === id))
    .filter((b): b is Task => Boolean(b && b.status !== 'DONE'));

  const isBlocked = unresolvedBlockers.length > 0;
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const latestPR = task.pullRequests[0];

  const stripeClass =
    conceptId === 'creative-studio' ? `border-l-4 ${getTypeStripeColor(task.type)}` : '';

  return (
    <div
      className={`group relative border ${theme.border} ${theme.cardBg} ${theme.cardRadius} ${
        theme.shadowCard
      } ${!isOverlay ? theme.cardHover : 'rotate-1 scale-[1.02] shadow-2xl'} ${stripeClass} p-3 transition-all duration-150`}
    >
      {/* Top Row: ID, Type & Hover Quick Actions */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              selectTask(task.id, true);
            }}
            className={`font-mono text-[11px] font-semibold hover:underline ${theme.accentText}`}
          >
            {task.id}
          </button>
          <TaskTypeBadge type={task.type} isDark={theme.isDark} compact={conceptId === 'linear-minimal'} />
        </div>

        <div className="flex items-center gap-1">
          {task.storyPoints > 0 && (
            <span
              className={`inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold ${theme.panelSubtle} ${theme.textSecondary}`}
              title={`${task.storyPoints} story points`}
            >
              {task.storyPoints}p
            </span>
          )}
          {!isOverlay && canPerform(activeRole, 'move_task') && task.status !== 'DONE' && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                moveTask(task.id, 'DONE');
              }}
              title="Quick mark Done"
              className={`opacity-0 group-hover:opacity-100 rounded p-0.5 transition ${theme.ghostBtn}`}
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            </button>
          )}
        </div>
      </div>

      {/* Title */}
      <button
        type="button"
        onClick={() => selectTask(task.id, true)}
        className={`block w-full text-left text-[13px] font-medium leading-snug mb-2 ${theme.textPrimary}`}
      >
        {task.title}
      </button>

      {/* Blocked Warning Pill */}
      {isBlocked && (
        <div
          className={`mb-2 flex items-center gap-1.5 rounded px-2 py-1 text-[10px] font-medium ${
            theme.isDark
              ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          <Lock className="h-3 w-3 shrink-0" />
          <span className="truncate">Blocked by {unresolvedBlockers.map((b) => b.id).join(', ')}</span>
        </div>
      )}

      {/* Labels */}
      {task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {task.labels.slice(0, 3).map((label) => (
            <span
              key={label}
              className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                conceptId === 'creative-studio'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                  : `${theme.panelSubtle} ${theme.textMuted}`
              }`}
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Footer Metadata: Priority, GitHub PR, Subtasks, Avatar */}
      <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-dashed border-slate-400/20">
        <div className="flex flex-wrap items-center gap-1.5">
          <PriorityBadge priority={task.priority} isDark={theme.isDark} />
          {latestPR && (
            <PRBadge number={latestPR.number} status={latestPR.status} isDark={theme.isDark} />
          )}
          {task.subtasks.length > 0 && (
            <span className={`text-[10px] font-mono ${theme.textMuted}`}>
              {completedSubtasks}/{task.subtasks.length}
            </span>
          )}
        </div>
        <Avatar
          member={assignee}
          size="xs"
          conceptId={conceptId}
          showPresence={conceptId === 'human-workspace' || conceptId === 'creative-studio'}
        />
      </div>
    </div>
  );
};

const DraggableTaskCard: React.FC<{ task: Task; conceptId: ConceptId; disabled: boolean }> = ({
  task,
  conceptId,
  disabled,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    disabled,
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`${disabled ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'} ${
        isDragging ? 'opacity-30' : 'opacity-100'
      }`}
    >
      <TaskCardContent task={task} conceptId={conceptId} />
    </div>
  );
};

const DroppableColumn: React.FC<{
  column: BoardColumn;
  tasks: Task[];
  conceptId: ConceptId;
  canDrag: boolean;
}> = ({ column, tasks, conceptId, canDrag }) => {
  const { openCreateTaskModal } = useMavericks();
  const theme = CONCEPT_THEMES[conceptId];
  const { isOver, setNodeRef } = useDroppable({ id: column.id });

  const overWip = column.wipLimit !== undefined && tasks.length > column.wipLimit;

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-w-[240px] lg:min-w-0 lg:flex-1 border ${
        isOver ? 'border-indigo-500 ring-2 ring-indigo-500/20' : theme.border
      } ${theme.panelSubtle} ${theme.cardRadius} p-2.5 transition-colors`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between gap-2 px-1 pb-2.5">
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full shrink-0"
            style={{ backgroundColor: column.accentColor }}
          />
          <h3 className={`text-xs font-semibold ${theme.textPrimary}`}>{column.title}</h3>
          <span
            className={`rounded-full px-1.5 py-0.5 text-[10px] font-mono font-semibold ${
              overWip
                ? 'bg-rose-500/20 text-rose-500'
                : `${theme.cardBg} ${theme.textMuted} border ${theme.border}`
            }`}
          >
            {tasks.length}
            {column.wipLimit ? `/${column.wipLimit}` : ''}
          </span>
        </div>

        <button
          type="button"
          onClick={() => openCreateTaskModal(column.id)}
          className={`rounded p-1 transition ${theme.ghostBtn}`}
          title={`Quick add to ${column.title}`}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Cards or Friendly Empty Column */}
      <div className="flex-1 space-y-2.5 min-h-[160px]">
        {tasks.length === 0 ? (
          <div
            className={`flex flex-col items-center justify-center text-center h-36 border border-dashed ${theme.borderStrong} ${theme.cardRadius} p-3`}
          >
            <p className={`text-xs font-medium ${theme.textSecondary}`}>
              {conceptId === 'human-workspace'
                ? 'All clear in this lane ✨'
                : `No issues in ${column.title}`}
            </p>
            <p className={`text-[11px] mt-0.5 ${theme.textMuted}`}>
              Drag a card here or create a new issue.
            </p>
            <button
              type="button"
              onClick={() => openCreateTaskModal(column.id)}
              className={`mt-2 inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium ${theme.buttonRadius} ${theme.secondaryBtn}`}
            >
              <Plus className="h-3 w-3" /> Add task
            </button>
          </div>
        ) : (
          tasks.map((task) => (
            <DraggableTaskCard
              key={task.id}
              task={task}
              conceptId={conceptId}
              disabled={!canDrag}
            />
          ))
        )}
      </div>
    </div>
  );
};

export const KanbanBoardScreen: React.FC = () => {
  const {
    concept,
    activeWorkspace,
    activeProject,
    activeSprint,
    columns,
    tasks,
    members,
    currentUser,
    activeRole,
    systemState,
    searchQuery,
    setSearchQuery,
    assigneeFilter,
    setAssigneeFilter,
    priorityFilter,
    setPriorityFilter,
    moveTask,
    openCreateTaskModal,
    setCompleteSprintModalOpen,
    setBoardSettingsOpen,
    setGithubModalOpen,
    blockingError,
    clearBlockingError,
    selectTask,
  } = useMavericks();

  const theme = CONCEPT_THEMES[concept];
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );

  const parsedQuery = useMemo(() => parseSmartQuery(searchQuery), [searchQuery]);
  const projectTasks = useMemo(
    () =>
      systemState === 'empty'
        ? []
        : filterTasksByQuery(
            tasks.filter((t) => t.projectId === activeProject.id),
            parsedQuery,
            members,
            currentUser.id,
            assigneeFilter,
            priorityFilter
          ),
    [tasks, activeProject.id, parsedQuery, members, currentUser.id, assigneeFilter, priorityFilter, systemState]
  );

  const activeDragTask = tasks.find((t) => t.id === activeDragId) ?? null;
  const canDrag = canPerform(activeRole, 'move_task');

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
    if (!event.over) return;
    const taskId = String(event.active.id);
    const targetStatus = event.over.id as TaskStatus;
    moveTask(taskId, targetStatus);
  };

  return (
    <div className="space-y-4">
      {/* Top Breadcrumb + Sprint Metadata Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <div className={`flex items-center gap-1.5 text-xs ${theme.textMuted}`}>
            <span>{activeWorkspace.name}</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className={`font-medium ${theme.textSecondary}`}>{activeProject.name}</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className={`font-mono text-[11px] ${theme.accentText}`}>Kanban Board</span>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2.5">
            <h1 className={`text-xl ${theme.headingStyle} ${theme.textPrimary}`}>
              {activeProject.name} Board
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${theme.accentBgSoft}`}
            >
              <Flag className="h-3 w-3" />
              {activeSprint.name}
            </span>
            <span className={`inline-flex items-center gap-1 text-xs ${theme.textMuted}`}>
              <Calendar className="h-3.5 w-3.5" />
              Ends {activeSprint.endDate}
            </span>
          </div>
        </div>

        {/* Action Strip */}
        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setGithubModalOpen(true)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition ${theme.buttonRadius} ${theme.secondaryBtn}`}
          >
            <Github className="h-3.5 w-3.5 shrink-0" />
            <span className="font-mono text-[11px]">
              {activeProject.github.connected
                ? `${activeProject.github.owner}/${activeProject.github.repo}`
                : 'Connect GitHub'}
            </span>
            <span
              className={`h-2 w-2 rounded-full ${
                activeProject.github.connected ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
            />
          </button>

          <button
            type="button"
            onClick={() => setBoardSettingsOpen(true)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition ${theme.buttonRadius} ${theme.secondaryBtn}`}
          >
            <Sliders className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden xl:inline">Board Settings</span>
          </button>

          <button
            type="button"
            onClick={() => setCompleteSprintModalOpen(true)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition ${theme.buttonRadius} ${theme.secondaryBtn}`}
          >
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
            <span>Complete Sprint</span>
          </button>

          <button
            type="button"
            onClick={() => openCreateTaskModal('TODO')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium whitespace-nowrap transition ${theme.buttonRadius} ${theme.primaryBtn}`}
          >
            <Plus className="h-3.5 w-3.5 shrink-0" />
            <span>Create Issue</span>
          </button>
        </div>
      </div>

      {/* Smart Query Search & Filter Bar */}
      <div
        className={`flex flex-col md:flex-row md:items-center gap-2.5 p-2.5 border ${theme.border} ${theme.panelBg} ${theme.cardRadius} ${theme.shadowCard}`}
      >
        <div className="relative flex-1 flex items-center">
          <Search
            className={`h-3.5 w-3.5 pointer-events-none absolute left-3 ${theme.textMuted}`}
            size={14}
          />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter with smart syntax: assignee = me AND priority = high"
            className={`w-full pl-9 pr-8 py-1.5 text-xs border focus:outline-none focus:ring-2 focus:ring-indigo-500/25 ${theme.buttonRadius} ${theme.inputBg}`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className={`absolute right-2 rounded p-0.5 ${theme.ghostBtn}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSearchQuery('assignee = me AND priority = high')}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium border ${theme.border} ${theme.buttonRadius} ${theme.ghostBtn}`}
            title="Apply smart query example"
          >
            <Sparkles className="h-3 w-3 text-indigo-500" />
            <span>My High Priority</span>
          </button>

          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className={`px-2.5 py-1.5 text-xs border ${theme.buttonRadius} ${theme.inputBg}`}
            aria-label="Filter by assignee"
          >
            <option value="ALL">All Assignees</option>
            {members
              .filter((m) => m.status === 'ACTIVE')
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | 'ALL')}
            className={`px-2.5 py-1.5 text-xs border ${theme.buttonRadius} ${theme.inputBg}`}
            aria-label="Filter by priority"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Active Query Chips or Invalid Syntax Feedback */}
      {(parsedQuery.chips.length > 0 || parsedQuery.error) && (
        <div className="flex flex-wrap items-center gap-2">
          {parsedQuery.chips.map((chip) => (
            <span
              key={chip.id}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${theme.accentBgSoft}`}
            >
              <span className="font-mono">{chip.field}</span>
              <span>{chip.operator}</span>
              <span className="font-semibold">{chip.value}</span>
            </span>
          ))}
          {parsedQuery.error && (
            <div className="flex items-center gap-2 rounded-md bg-rose-500/10 border border-rose-500/25 px-3 py-1.5 text-xs text-rose-500">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>
                {parsedQuery.error} {parsedQuery.suggestion}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Blocking Rule Alert Banner (triggered when attempting to complete MOB-1 before MOB-2) */}
      {blockingError && (
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 border ${
            theme.isDark
              ? 'bg-amber-500/10 border-amber-500/35 text-amber-200'
              : 'bg-amber-50 border-amber-300 text-amber-900'
          } ${theme.cardRadius} animate-slide-up`}
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs space-y-0.5">
              <p className="font-semibold">{blockingError.message}</p>
              {blockingError.prMergedNote && (
                <p className="opacity-85 flex items-center gap-1">
                  <GitBranch className="h-3 w-3" /> {blockingError.prMergedNote}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => selectTask(blockingError.blockerId, true)}
              className={`px-2.5 py-1 text-xs font-medium ${theme.buttonRadius} ${theme.primaryBtn}`}
            >
              Open {blockingError.blockerId}
            </button>
            <button
              type="button"
              onClick={clearBlockingError}
              className="rounded p-1 hover:bg-black/10"
              aria-label="Dismiss blocking notice"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Read-only Guest Notice */}
      {!canDrag && (
        <div
          className={`flex items-center gap-2 px-3 py-2 text-xs border ${theme.border} ${theme.panelSubtle} ${theme.cardRadius} ${theme.textMuted}`}
        >
          <Lock className="h-3.5 w-3.5 text-amber-500" />
          <span>
            Viewing as <strong>GUEST</strong> — you can inspect cards and write comments, but dragging tasks or changing settings is disabled.
          </span>
        </div>
      )}

      {/* Main Board Area */}
      {systemState === 'loading' ? (
        <SkeletonBoard conceptId={concept} />
      ) : systemState === 'empty' ? (
        <EmptyStateIllustration
          conceptId={concept}
          title="Nothing here yet. Create your first task to get started."
          description="Your Kanban columns are ready for Sprint 14. Add an issue or connect GitHub to sync pull requests automatically."
          actionLabel="Create First Task"
          onAction={() => openCreateTaskModal('TODO')}
        />
      ) : (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-2.5 overflow-x-auto lg:overflow-visible pb-3">
            {columns.map((col) => (
              <DroppableColumn
                key={col.id}
                column={col}
                tasks={projectTasks.filter((t) => t.status === col.id)}
                conceptId={concept}
                canDrag={canDrag}
              />
            ))}
          </div>

          <DragOverlay>
            {activeDragTask ? (
              <div className="w-[275px]">
                <TaskCardContent task={activeDragTask} conceptId={concept} isOverlay />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
};

