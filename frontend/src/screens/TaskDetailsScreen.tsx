import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  GitBranch,
  GitCommit,
  GitPullRequest,
  Link2,
  Lock,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
} from 'lucide-react';
import {
  Avatar,
  EmptyStateIllustration,
  PRBadge,
  PriorityBadge,
  StatusBadge,
  TaskTypeBadge,
} from '../components/shared/CommonAtoms';
import { useMavericks } from '../state/MavericksContext';
import { CONCEPT_THEMES } from '../themes/conceptTokens';
import { TaskPriority, TaskStatus, TaskType } from '../types/mavericks';
import { canPerform } from '../utils/permissions';
import { STATUS_LABELS } from '../utils/queryParser';

export const TaskDetailsScreen: React.FC = () => {
  const {
    concept,
    activeWorkspace,
    activeProject,
    tasks,
    selectedTask,
    selectTask,
    setScreen,
    sprints,
    members,
    activeRole,
    systemState,
    updateTask,
    toggleSubtask,
    addSubtask,
    addComment,
    generateAIContent,
    blockingError,
    clearBlockingError,
  } = useMavericks();

  const theme = CONCEPT_THEMES[concept];
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(selectedTask.title);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [commentDraft, setCommentDraft] = useState('');
  const [aiLoading, setAiLoading] = useState<'description' | 'checklist' | 'summary' | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  React.useEffect(() => {
    setTitleDraft(selectedTask.title);
    setEditingTitle(false);
    setAiSummary(null);
  }, [selectedTask.id, selectedTask.title]);

  const blockers = selectedTask.blockedBy
    .map((id) => tasks.find((t) => t.id === id))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  const blockingOthers = selectedTask.blocks
    .map((id) => tasks.find((t) => t.id === id))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  const hasMergedPR = selectedTask.pullRequests.some((p) => p.status === 'MERGED');
  const unresolvedBlockers = blockers.filter((b) => b.status !== 'DONE');
  const canEditTask = canPerform(activeRole, 'move_task');

  const handleAI = async (mode: 'description' | 'checklist' | 'summary') => {
    setAiLoading(mode);
    const out = await generateAIContent(selectedTask.id, mode);
    if (mode === 'summary') setAiSummary(out);
    setAiLoading(null);
  };

  if (systemState === 'loading') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className={`lg:col-span-2 p-6 border ${theme.border} ${theme.panelBg} ${theme.cardRadius} space-y-4`}>
          <div className="h-5 w-40 rounded bg-slate-400/20 animate-pulse" />
          <div className="h-8 w-3/4 rounded bg-slate-400/20 animate-pulse" />
          <div className="h-28 w-full rounded bg-slate-400/20 animate-pulse" />
        </div>
        <div className={`p-6 border ${theme.border} ${theme.panelBg} ${theme.cardRadius} space-y-3`}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-9 w-full rounded bg-slate-400/20 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (systemState === 'empty') {
    return (
      <EmptyStateIllustration
        conceptId={concept}
        title="No issue selected yet"
        description="Choose a task from the board or create a new issue to inspect commits, pull requests, and AI summaries."
        actionLabel="Return to Kanban Board"
        onAction={() => setScreen('board')}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Breadcrumb + Quick Task Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setScreen('board')}
            className={`inline-flex items-center gap-1 px-2 py-1 ${theme.buttonRadius} ${theme.ghostBtn}`}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Board</span>
          </button>
          <ChevronRight className={`h-3.5 w-3.5 ${theme.textMuted}`} />
          <span className={theme.textMuted}>{activeWorkspace.name}</span>
          <ChevronRight className={`h-3.5 w-3.5 ${theme.textMuted}`} />
          <span className={theme.textMuted}>{activeProject.name}</span>
          <ChevronRight className={`h-3.5 w-3.5 ${theme.textMuted}`} />
          <span className={`font-mono font-semibold ${theme.accentText}`}>{selectedTask.id}</span>
        </div>

        {/* Quick Issue Switcher for testing MOB-1 / MOB-2 / MOB-3 */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className={`text-[11px] ${theme.textMuted}`}>Quick switch:</span>
          {['MOB-1', 'MOB-2', 'MOB-3', 'MOB-4'].map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => selectTask(id, false)}
              className={`px-2 py-1 text-[11px] font-mono font-medium transition ${theme.buttonRadius} ${
                selectedTask.id === id ? theme.primaryBtn : theme.secondaryBtn
              }`}
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      {/* Friendly Blocking Warning (Enforced when trying to mark MOB-1 Done) */}
      {blockingError && blockingError.taskId === selectedTask.id && (
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border ${
            theme.isDark
              ? 'bg-amber-500/12 border-amber-500/40 text-amber-100'
              : 'bg-amber-50 border-amber-300 text-amber-950'
          } ${theme.cardRadius} animate-slide-up`}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-semibold">{blockingError.message}</p>
              {blockingError.prMergedNote && (
                <p className="text-xs opacity-90">{blockingError.prMergedNote}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => selectTask(blockingError.blockerId, false)}
              className={`px-3 py-1.5 text-xs font-medium ${theme.buttonRadius} ${theme.primaryBtn}`}
            >
              Go to {blockingError.blockerId}
            </button>
            <button
              type="button"
              onClick={clearBlockingError}
              className={`px-2.5 py-1.5 text-xs font-medium ${theme.buttonRadius} ${theme.secondaryBtn}`}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main 2-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Main Content (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Header & Description Card */}
          <div className={`p-5 border ${theme.border} ${theme.panelBg} ${theme.cardRadius} ${theme.shadowCard} space-y-4`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${theme.accentBgSoft}`}>
                  {selectedTask.id}
                </span>
                <TaskTypeBadge type={selectedTask.type} isDark={theme.isDark} />
                <StatusBadge status={selectedTask.status} isDark={theme.isDark} />
                {hasMergedPR && unresolvedBlockers.length > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/15 border border-purple-500/30 px-2.5 py-0.5 text-[11px] font-medium text-purple-500">
                    <GitPullRequest className="h-3 w-3" />
                    PR Merged · Awaiting Blocker
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleAI('description')}
                disabled={aiLoading !== null}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium transition ${theme.buttonRadius} ${theme.secondaryBtn}`}
              >
                <Sparkles className={`h-3.5 w-3.5 ${aiLoading === 'description' ? 'animate-spin' : theme.accentText}`} />
                <span>{aiLoading === 'description' ? 'Writing...' : 'Enhance with AI'}</span>
              </button>
            </div>

            {/* Editable Title */}
            {editingTitle && canEditTask ? (
              <div className="flex gap-2">
                <input
                  autoFocus
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      updateTask(selectedTask.id, { title: titleDraft });
                      setEditingTitle(false);
                    }
                  }}
                  className={`flex-1 px-3 py-1.5 text-lg font-semibold border ${theme.buttonRadius} ${theme.inputBg}`}
                />
                <button
                  type="button"
                  onClick={() => {
                    updateTask(selectedTask.id, { title: titleDraft });
                    setEditingTitle(false);
                  }}
                  className={`px-3 py-1.5 text-xs font-medium ${theme.buttonRadius} ${theme.primaryBtn}`}
                >
                  Save
                </button>
              </div>
            ) : (
              <h1
                onClick={() => canEditTask && setEditingTitle(true)}
                className={`text-lg sm:text-xl ${theme.headingStyle} ${theme.textPrimary} ${
                  canEditTask ? 'cursor-text hover:opacity-85' : ''
                }`}
                title={canEditTask ? 'Click to edit title' : undefined}
              >
                {selectedTask.title}
              </h1>
            )}

            {/* Description */}
            <div className={`text-xs sm:text-[13px] leading-relaxed whitespace-pre-line ${theme.textSecondary}`}>
              {selectedTask.description}
            </div>
          </div>

          {/* Blocking Relationships Visual Card */}
          {(blockers.length > 0 || blockingOthers.length > 0) && (
            <div className={`p-4 border ${theme.border} ${theme.panelBg} ${theme.cardRadius} ${theme.shadowCard} space-y-3`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link2 className={`h-4 w-4 ${theme.accentText}`} />
                  <h3 className={`text-xs font-semibold ${theme.textPrimary}`}>
                    Dependency & Blocking Rules
                  </h3>
                </div>
                {unresolvedBlockers.length > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-500">
                    <Lock className="h-3 w-3" /> Completion locked until blocker is Done
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {blockers.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => selectTask(b.id, false)}
                    className={`flex items-center justify-between gap-2 p-2.5 text-left border ${theme.border} ${theme.panelSubtle} ${theme.cardRadius} ${theme.cardHover} transition`}
                  >
                    <div className="min-w-0">
                      <p className={`text-[10px] font-semibold uppercase tracking-wide ${theme.textMuted}`}>
                        Blocked by
                      </p>
                      <p className={`text-xs font-medium truncate ${theme.textPrimary}`}>
                        <span className={`font-mono mr-1.5 ${theme.accentText}`}>{b.id}</span>
                        {b.title}
                      </p>
                    </div>
                    <StatusBadge status={b.status} isDark={theme.isDark} />
                  </button>
                ))}
                {blockingOthers.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => selectTask(b.id, false)}
                    className={`flex items-center justify-between gap-2 p-2.5 text-left border ${theme.border} ${theme.panelSubtle} ${theme.cardRadius} ${theme.cardHover} transition`}
                  >
                    <div className="min-w-0">
                      <p className={`text-[10px] font-semibold uppercase tracking-wide ${theme.textMuted}`}>
                        Blocks
                      </p>
                      <p className={`text-xs font-medium truncate ${theme.textPrimary}`}>
                        <span className={`font-mono mr-1.5 ${theme.accentText}`}>{b.id}</span>
                        {b.title}
                      </p>
                    </div>
                    <StatusBadge status={b.status} isDark={theme.isDark} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Checklist / Subtasks */}
          <div className={`p-5 border ${theme.border} ${theme.panelBg} ${theme.cardRadius} ${theme.shadowCard} space-y-3`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`h-4 w-4 ${theme.accentText}`} />
                <h3 className={`text-xs font-semibold ${theme.textPrimary}`}>
                  Subtasks ({selectedTask.subtasks.filter((s) => s.completed).length}/
                  {selectedTask.subtasks.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => handleAI('checklist')}
                disabled={aiLoading !== null}
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium ${theme.buttonRadius} ${theme.secondaryBtn}`}
              >
                <Sparkles className={`h-3 w-3 ${aiLoading === 'checklist' ? 'animate-spin' : theme.accentText}`} />
                <span>{aiLoading === 'checklist' ? 'Generating...' : 'AI Checklist'}</span>
              </button>
            </div>

            <div className="space-y-1.5">
              {selectedTask.subtasks.length === 0 ? (
                <p className={`text-xs ${theme.textMuted}`}>No subtasks added yet.</p>
              ) : (
                selectedTask.subtasks.map((st) => (
                  <label
                    key={st.id}
                    className={`flex items-center gap-2.5 p-2 border ${theme.border} ${theme.panelSubtle} ${theme.buttonRadius} cursor-pointer`}
                  >
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => toggleSubtask(selectedTask.id, st.id)}
                      className="rounded border-slate-400 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span
                      className={`text-xs ${
                        st.completed ? `line-through ${theme.textMuted}` : theme.textPrimary
                      }`}
                    >
                      {st.title}
                    </span>
                  </label>
                ))
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                addSubtask(selectedTask.id, newSubtaskTitle);
                setNewSubtaskTitle('');
              }}
              className="flex gap-2 pt-1"
            >
              <input
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Add a subtask..."
                className={`flex-1 px-3 py-1.5 text-xs border ${theme.buttonRadius} ${theme.inputBg}`}
              />
              <button
                type="submit"
                className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium ${theme.buttonRadius} ${theme.secondaryBtn}`}
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
            </form>
          </div>

          {/* GitHub Integration Section */}
          <div className={`p-5 border ${theme.border} ${theme.panelBg} ${theme.cardRadius} ${theme.shadowCard} space-y-3`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitBranch className={`h-4 w-4 ${theme.accentText}`} />
                <h3 className={`text-xs font-semibold ${theme.textPrimary}`}>
                  GitHub Pull Requests & Commits
                </h3>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-500 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Webhook Live
              </span>
            </div>

            {selectedTask.pullRequests.length === 0 && selectedTask.commits.length === 0 ? (
              <p className={`text-xs ${theme.textMuted}`}>
                No branches or PRs linked yet. Mention <span className="font-mono">{selectedTask.id}</span> in your branch or commit message to auto-link.
              </p>
            ) : (
              <div className="space-y-2.5">
                {selectedTask.pullRequests.map((pr) => (
                  <div
                    key={pr.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 border ${theme.border} ${theme.panelSubtle} ${theme.cardRadius}`}
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <PRBadge number={pr.number} status={pr.status} isDark={theme.isDark} />
                        <span className={`text-xs font-semibold truncate ${theme.textPrimary}`}>
                          {pr.title}
                        </span>
                      </div>
                      <p className={`text-[11px] font-mono ${theme.textMuted}`}>
                        {pr.branch} · {pr.author} · {pr.updatedAt}
                      </p>
                    </div>
                    <span
                      className={`text-[11px] font-medium shrink-0 ${
                        pr.checksPassed ? 'text-emerald-500' : 'text-rose-500'
                      }`}
                    >
                      {pr.checksPassed ? '✓ CI Checks Passed' : '✕ CI Checks Failed'}
                    </span>
                  </div>
                ))}

                {selectedTask.commits.map((commit) => (
                  <div
                    key={commit.sha}
                    className={`flex items-center justify-between gap-2 px-3 py-2 border ${theme.border} ${theme.buttonRadius}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <GitCommit className={`h-3.5 w-3.5 shrink-0 ${theme.textMuted}`} />
                      <span className={`font-mono text-[11px] ${theme.accentText}`}>{commit.sha}</span>
                      <span className={`text-xs truncate ${theme.textSecondary}`}>{commit.message}</span>
                    </div>
                    <span className={`text-[11px] shrink-0 ${theme.textMuted}`}>{commit.timestamp}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Discussion Thread & AI Summarization */}
          <div className={`p-5 border ${theme.border} ${theme.panelBg} ${theme.cardRadius} ${theme.shadowCard} space-y-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className={`h-4 w-4 ${theme.accentText}`} />
                <h3 className={`text-xs font-semibold ${theme.textPrimary}`}>
                  Discussion ({selectedTask.comments.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => handleAI('summary')}
                disabled={aiLoading !== null}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium ${theme.buttonRadius} ${theme.secondaryBtn}`}
              >
                <Sparkles className={`h-3 w-3 ${aiLoading === 'summary' ? 'animate-spin' : theme.accentText}`} />
                <span>{aiLoading === 'summary' ? 'Summarizing...' : 'Summarize with AI'}</span>
              </button>
            </div>

            {aiSummary && (
              <div className={`p-3 border ${theme.borderStrong} ${theme.accentBgSoft} ${theme.cardRadius} text-xs space-y-1 animate-slide-up`}>
                <div className="flex items-center gap-1.5 font-semibold">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Mavericks AI Summary</span>
                </div>
                <p className="leading-relaxed opacity-95">{aiSummary}</p>
              </div>
            )}

            <div className="space-y-3">
              {selectedTask.comments.map((c) => {
                const author = members.find((m) => m.id === c.authorId);
                return (
                  <div key={c.id} className="flex items-start gap-2.5">
                    <Avatar member={author} size="sm" conceptId={concept} />
                    <div className={`flex-1 p-3 border ${theme.border} ${theme.panelSubtle} ${theme.cardRadius}`}>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className={`text-xs font-semibold ${theme.textPrimary}`}>
                          {author?.name ?? 'Teammate'}
                        </span>
                        <span className={`text-[10px] ${theme.textMuted}`}>{c.createdAt}</span>
                      </div>
                      <p className={`text-xs leading-relaxed ${theme.textSecondary}`}>{c.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                addComment(selectedTask.id, commentDraft);
                setCommentDraft('');
              }}
              className="flex gap-2"
            >
              <input
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value)}
                placeholder="Write a comment or @mention a teammate..."
                className={`flex-1 px-3 py-2 text-xs border ${theme.buttonRadius} ${theme.inputBg}`}
              />
              <button
                type="submit"
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium ${theme.buttonRadius} ${theme.primaryBtn}`}
              >
                <Send className="h-3.5 w-3.5" />
                <span>Comment</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Metadata Inspector + Activity History (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className={`p-4 border ${theme.border} ${theme.panelBg} ${theme.cardRadius} ${theme.shadowCard} space-y-3`}>
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${theme.textMuted}`}>
              Issue Properties
            </h3>

            {/* Status Selector (Triggers blocking warning if MOB-1 set to DONE!) */}
            <div>
              <label className={`block text-[11px] font-medium mb-1 ${theme.textMuted}`}>Status</label>
              <select
                value={selectedTask.status}
                onChange={(e) => updateTask(selectedTask.id, { status: e.target.value as TaskStatus })}
                className={`w-full px-2.5 py-2 text-xs font-medium border ${theme.buttonRadius} ${theme.inputBg}`}
              >
                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
              {unresolvedBlockers.length > 0 && selectedTask.status !== 'DONE' && (
                <p className="mt-1 text-[10px] text-amber-500">
                  Tip: Try switching Status to Done to test the blocking enforcement rule.
                </p>
              )}
            </div>

            {/* Assignee */}
            <div>
              <label className={`block text-[11px] font-medium mb-1 ${theme.textMuted}`}>Assignee</label>
              <select
                value={selectedTask.assigneeId ?? ''}
                onChange={(e) =>
                  updateTask(selectedTask.id, { assigneeId: e.target.value || null })
                }
                className={`w-full px-2.5 py-2 text-xs border ${theme.buttonRadius} ${theme.inputBg}`}
              >
                <option value="">Unassigned</option>
                {members
                  .filter((m) => m.status === 'ACTIVE')
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className={`block text-[11px] font-medium mb-1 ${theme.textMuted}`}>Priority</label>
                <select
                  value={selectedTask.priority}
                  onChange={(e) =>
                    updateTask(selectedTask.id, { priority: e.target.value as TaskPriority })
                  }
                  className={`w-full px-2.5 py-2 text-xs border ${theme.buttonRadius} ${theme.inputBg}`}
                >
                  <option value="URGENT">Urgent</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
              <div>
                <label className={`block text-[11px] font-medium mb-1 ${theme.textMuted}`}>Type</label>
                <select
                  value={selectedTask.type}
                  onChange={(e) =>
                    updateTask(selectedTask.id, { type: e.target.value as TaskType })
                  }
                  className={`w-full px-2.5 py-2 text-xs border ${theme.buttonRadius} ${theme.inputBg}`}
                >
                  <option value="FEATURE">Feature</option>
                  <option value="BUG">Bug</option>
                  <option value="TASK">Task</option>
                  <option value="CHORE">Chore</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className={`block text-[11px] font-medium mb-1 ${theme.textMuted}`}>
                  Story Points
                </label>
                <select
                  value={selectedTask.storyPoints}
                  onChange={(e) =>
                    updateTask(selectedTask.id, { storyPoints: Number(e.target.value) })
                  }
                  className={`w-full px-2.5 py-2 text-xs border ${theme.buttonRadius} ${theme.inputBg}`}
                >
                  {[1, 2, 3, 5, 8, 13].map((p) => (
                    <option key={p} value={p}>
                      {p} points
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-[11px] font-medium mb-1 ${theme.textMuted}`}>Sprint</label>
                <select
                  value={selectedTask.sprintId ?? ''}
                  onChange={(e) =>
                    updateTask(selectedTask.id, { sprintId: e.target.value || null })
                  }
                  className={`w-full px-2.5 py-2 text-xs border ${theme.buttonRadius} ${theme.inputBg}`}
                >
                  <option value="">Backlog</option>
                  {sprints.map((sp) => (
                    <option key={sp.id} value={sp.id}>
                      {sp.name.split('—')[0].trim()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <span className={`block text-[11px] font-medium mb-1.5 ${theme.textMuted}`}>Labels</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedTask.labels.map((label) => (
                  <span
                    key={label}
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${theme.panelSubtle} ${theme.textSecondary} border ${theme.border}`}
                  >
                    #{label}
                  </span>
                ))}
              </div>
            </div>

            <div className={`pt-2 border-t ${theme.border} flex items-center justify-between text-[11px] ${theme.textMuted}`}>
              <span>Priority</span>
              <PriorityBadge priority={selectedTask.priority} isDark={theme.isDark} />
            </div>
          </div>

          {/* Activity History */}
          <div className={`p-4 border ${theme.border} ${theme.panelBg} ${theme.cardRadius} ${theme.shadowCard} space-y-3`}>
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${theme.textMuted}`}>
              Activity History
            </h3>
            <div className="space-y-2.5">
              {selectedTask.activity.length === 0 ? (
                <p className={`text-xs ${theme.textMuted}`}>No activity recorded yet.</p>
              ) : (
                selectedTask.activity.map((act) => {
                  const actor = members.find((m) => m.id === act.actorId);
                  return (
                    <div key={act.id} className="flex items-start gap-2 text-xs">
                      <Avatar member={actor} size="xs" conceptId={concept} />
                      <div className="min-w-0">
                        <p className={theme.textSecondary}>
                          <span className={`font-medium ${theme.textPrimary}`}>
                            {actor?.name ?? 'System'}
                          </span>{' '}
                          {act.action}
                        </p>
                        <p className={`text-[10px] ${theme.textMuted}`}>{act.timestamp}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

