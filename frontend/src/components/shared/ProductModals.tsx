import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FolderPlus,
  Github,
  RefreshCw,
  Sliders,
  Sparkles,
  X,
} from 'lucide-react';
import { useMavericks } from '../../state/MavericksContext';
import { CONCEPT_THEMES } from '../../themes/conceptTokens';
import { TaskPriority, TaskStatus, TaskType } from '../../types/mavericks';
import { STATUS_LABELS } from '../../utils/queryParser';

export const CreateTaskModal: React.FC = () => {
  const {
    concept,
    createTaskModalOpen,
    setCreateTaskModalOpen,
    createTaskDefaultStatus,
    createTask,
    members,
    activeProject,
  } = useMavericks();

  const theme = CONCEPT_THEMES[concept];
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('HIGH');
  const [type, setType] = useState<TaskType>('FEATURE');
  const [status, setStatus] = useState<TaskStatus>(createTaskDefaultStatus);
  const [storyPoints, setStoryPoints] = useState(5);
  const [assigneeId, setAssigneeId] = useState<string>(members[1]?.id ?? '');
  const [labelsInput, setLabelsInput] = useState('mobile, sprint-14');
  const [aiDrafting, setAiDrafting] = useState(false);

  React.useEffect(() => {
    setStatus(createTaskDefaultStatus);
  }, [createTaskDefaultStatus, createTaskModalOpen]);

  if (!createTaskModalOpen) return null;

  const handleAIDraft = () => {
    setAiDrafting(true);
    setTimeout(() => {
      if (!title.trim()) {
        setTitle('Implement real-time GitHub PR status sync badge');
      }
      setDescription(
        `Objective:\nDeliver seamless ${type.toLowerCase()} support for ${
          title.trim() || 'real-time GitHub webhook telemetry'
        } in ${activeProject.name}.\n\nAcceptance Criteria:\n• Reflect status transitions immediately via WebSocket.\n• Respect task blocking rules when PRs merge.\n• Verified across desktop (1440px) and mobile (390px).`
      );
      setAiDrafting(false);
    }, 550);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    createTask({
      title: title.trim(),
      description: description.trim(),
      priority,
      type,
      status,
      storyPoints,
      assigneeId: assigneeId || null,
      labels: labelsInput
        .split(',')
        .map((l) => l.trim())
        .filter(Boolean),
    });
    setTitle('');
    setDescription('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4"
      onClick={() => setCreateTaskModalOpen(false)}
    >
      <div
        className={`w-full max-w-xl border ${theme.borderStrong} ${theme.panelBg} ${theme.cardRadius} ${theme.shadowPopover} animate-slide-up`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-center justify-between px-5 py-4 border-b ${theme.border}`}>
          <div className="flex items-center gap-2">
            <span className={`font-mono text-xs px-2 py-0.5 rounded ${theme.accentBgSoft}`}>
              {activeProject.key}
            </span>
            <h3 className={`text-sm ${theme.headingStyle} ${theme.textPrimary}`}>
              Create New Issue
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAIDraft}
              disabled={aiDrafting}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium transition ${theme.buttonRadius} ${theme.secondaryBtn}`}
            >
              <Sparkles className={`h-3.5 w-3.5 ${aiDrafting ? 'animate-spin' : theme.accentText}`} />
              <span>{aiDrafting ? 'Drafting...' : 'Write with AI'}</span>
            </button>
            <button
              onClick={() => setCreateTaskModalOpen(false)}
              className={`rounded p-1 ${theme.ghostBtn}`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className={`block text-xs font-medium mb-1 ${theme.textSecondary}`}>
              Issue Title
            </label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Add biometric passkey fallback for mobile login"
              className={`w-full px-3 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${theme.buttonRadius} ${theme.inputBg}`}
            />
          </div>

          <div>
            <label className={`block text-xs font-medium mb-1 ${theme.textSecondary}`}>
              Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe expected behavior, edge cases, or click 'Write with AI'..."
              className={`w-full px-3 py-2 text-xs leading-relaxed border focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${theme.buttonRadius} ${theme.inputBg}`}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className={`block text-[11px] font-medium mb-1 ${theme.textMuted}`}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className={`w-full px-2.5 py-1.5 text-xs border ${theme.buttonRadius} ${theme.inputBg}`}
              >
                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-[11px] font-medium mb-1 ${theme.textMuted}`}>Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className={`w-full px-2.5 py-1.5 text-xs border ${theme.buttonRadius} ${theme.inputBg}`}
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
                value={type}
                onChange={(e) => setType(e.target.value as TaskType)}
                className={`w-full px-2.5 py-1.5 text-xs border ${theme.buttonRadius} ${theme.inputBg}`}
              >
                <option value="FEATURE">Feature</option>
                <option value="BUG">Bug</option>
                <option value="TASK">Task</option>
                <option value="CHORE">Chore</option>
              </select>
            </div>
            <div>
              <label className={`block text-[11px] font-medium mb-1 ${theme.textMuted}`}>
                Story Points
              </label>
              <select
                value={storyPoints}
                onChange={(e) => setStoryPoints(Number(e.target.value))}
                className={`w-full px-2.5 py-1.5 text-xs border ${theme.buttonRadius} ${theme.inputBg}`}
              >
                {[1, 2, 3, 5, 8, 13].map((pt) => (
                  <option key={pt} value={pt}>
                    {pt} pts
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block text-[11px] font-medium mb-1 ${theme.textMuted}`}>Assignee</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className={`w-full px-2.5 py-1.5 text-xs border ${theme.buttonRadius} ${theme.inputBg}`}
              >
                <option value="">Unassigned</option>
                {members
                  .filter((m) => m.status === 'ACTIVE')
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.role})
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className={`block text-[11px] font-medium mb-1 ${theme.textMuted}`}>
                Labels (comma separated)
              </label>
              <input
                value={labelsInput}
                onChange={(e) => setLabelsInput(e.target.value)}
                className={`w-full px-2.5 py-1.5 text-xs border ${theme.buttonRadius} ${theme.inputBg}`}
              />
            </div>
          </div>

          <div className={`flex justify-end gap-2 pt-3 border-t ${theme.border}`}>
            <button
              type="button"
              onClick={() => setCreateTaskModalOpen(false)}
              className={`px-3.5 py-2 text-xs font-medium ${theme.buttonRadius} ${theme.secondaryBtn}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-xs font-medium ${theme.buttonRadius} ${theme.primaryBtn}`}
            >
              Create Issue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const GitHubModal: React.FC = () => {
  const {
    concept,
    githubModalOpen,
    setGithubModalOpen,
    activeProject,
    toggleGitHubConnection,
    triggerGitHubSync,
  } = useMavericks();

  const theme = CONCEPT_THEMES[concept];
  const [repoName, setRepoName] = useState(activeProject.github.repo);

  if (!githubModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4"
      onClick={() => setGithubModalOpen(false)}
    >
      <div
        className={`w-full max-w-lg border ${theme.borderStrong} ${theme.panelBg} ${theme.cardRadius} ${theme.shadowPopover} animate-slide-up`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-center justify-between px-5 py-4 border-b ${theme.border}`}>
          <div className="flex items-center gap-2.5">
            <Github className={`h-5 w-5 ${theme.textPrimary}`} />
            <div>
              <h3 className={`text-sm ${theme.headingStyle} ${theme.textPrimary}`}>
                GitHub Integration — {activeProject.name}
              </h3>
              <p className={`text-[11px] ${theme.textMuted}`}>
                Auto-sync commits, pull requests & merge automation
              </p>
            </div>
          </div>
          <button onClick={() => setGithubModalOpen(false)} className={`rounded p-1 ${theme.ghostBtn}`}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div
            className={`flex items-center justify-between p-3 border ${theme.border} ${theme.panelSubtle} ${theme.cardRadius}`}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  activeProject.github.connected ? 'bg-emerald-500 animate-pulse-soft' : 'bg-slate-400'
                }`}
              />
              <div>
                <p className={`text-xs font-semibold ${theme.textPrimary}`}>
                  {activeProject.github.connected
                    ? `Connected to ${activeProject.github.owner}/${activeProject.github.repo}`
                    : 'Repository disconnected'}
                </p>
                <p className={`text-[11px] ${theme.textMuted}`}>
                  Branch: <span className="font-mono">{activeProject.github.branch}</span> · Last synced{' '}
                  {activeProject.github.lastSyncedAt}
                </p>
              </div>
            </div>
            <button
              onClick={triggerGitHubSync}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium ${theme.buttonRadius} ${theme.secondaryBtn}`}
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${
                  activeProject.github.syncState === 'syncing' ? 'animate-spin' : ''
                }`}
              />
              <span>Sync Now</span>
            </button>
          </div>

          <div>
            <label className={`block text-xs font-medium mb-1 ${theme.textSecondary}`}>
              Repository Slug
            </label>
            <div className="flex gap-2">
              <span
                className={`inline-flex items-center px-3 text-xs font-mono border ${theme.border} ${theme.panelSubtle} ${theme.buttonRadius} ${theme.textMuted}`}
              >
                {activeProject.github.owner}/
              </span>
              <input
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                className={`flex-1 px-3 py-2 text-xs font-mono border ${theme.buttonRadius} ${theme.inputBg}`}
              />
            </div>
          </div>

          <div
            className={`p-3 border ${theme.border} ${theme.cardRadius} text-xs space-y-1.5 ${theme.textSecondary}`}
          >
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Auto-complete tasks on PR merge (subject to blocking rules)</span>
            </div>
            <p className={`text-[11px] pl-6 ${theme.textMuted}`}>
              When a linked PR merges into <span className="font-mono">main</span>, Mavericks moves the task
              to Done unless an unfinished blocker (e.g. MOB-2) prevents completion.
            </p>
          </div>

          <div className={`flex items-center justify-between pt-3 border-t ${theme.border}`}>
            {activeProject.github.connected ? (
              <button
                onClick={() => toggleGitHubConnection(false)}
                className="text-xs font-medium text-rose-500 hover:underline"
              >
                Disconnect repository
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setGithubModalOpen(false)}
                className={`px-3 py-1.5 text-xs font-medium ${theme.buttonRadius} ${theme.secondaryBtn}`}
              >
                Close
              </button>
              <button
                onClick={() => {
                  toggleGitHubConnection(true, repoName);
                  setGithubModalOpen(false);
                }}
                className={`px-3.5 py-1.5 text-xs font-medium ${theme.buttonRadius} ${theme.primaryBtn}`}
              >
                {activeProject.github.connected ? 'Save Settings' : 'Connect Repository'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CompleteSprintModal: React.FC = () => {
  const {
    concept,
    completeSprintModalOpen,
    setCompleteSprintModalOpen,
    activeSprint,
    tasks,
    completeSprint,
  } = useMavericks();

  const theme = CONCEPT_THEMES[concept];
  const [destination, setDestination] = useState<'next-sprint' | 'backlog'>('next-sprint');

  if (!completeSprintModalOpen) return null;

  const sprintTasks = tasks.filter((t) => t.sprintId === activeSprint.id);
  const completedTasks = sprintTasks.filter((t) => t.status === 'DONE');
  const unfinishedTasks = sprintTasks.filter((t) => t.status !== 'DONE');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4"
      onClick={() => setCompleteSprintModalOpen(false)}
    >
      <div
        className={`w-full max-w-lg border ${theme.borderStrong} ${theme.panelBg} ${theme.cardRadius} ${theme.shadowPopover} animate-slide-up`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-center justify-between px-5 py-4 border-b ${theme.border}`}>
          <div>
            <h3 className={`text-sm ${theme.headingStyle} ${theme.textPrimary}`}>
              Complete {activeSprint.name}
            </h3>
            <p className={`text-[11px] ${theme.textMuted}`}>
              Sprint history and velocity metrics will be preserved.
            </p>
          </div>
          <button
            onClick={() => setCompleteSprintModalOpen(false)}
            className={`rounded p-1 ${theme.ghostBtn}`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-3 border ${theme.border} ${theme.panelSubtle} ${theme.cardRadius}`}>
              <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                <span>{completedTasks.length} Completed</span>
              </div>
              <p className={`text-[11px] mt-1 ${theme.textMuted}`}>
                {completedTasks.reduce((s, t) => s + t.storyPoints, 0)} story points shipped
              </p>
            </div>
            <div className={`p-3 border ${theme.border} ${theme.panelSubtle} ${theme.cardRadius}`}>
              <div className="flex items-center gap-1.5 text-amber-500 text-xs font-semibold">
                <AlertTriangle className="h-4 w-4" />
                <span>{unfinishedTasks.length} Unfinished</span>
              </div>
              <p className={`text-[11px] mt-1 ${theme.textMuted}`}>
                {unfinishedTasks.reduce((s, t) => s + t.storyPoints, 0)} story points remaining
              </p>
            </div>
          </div>

          {unfinishedTasks.length > 0 && (
            <div className="space-y-2">
              <p className={`text-xs font-medium ${theme.textSecondary}`}>
                Unfinished tasks will be moved automatically:
              </p>
              <div className={`max-h-32 overflow-y-auto border ${theme.border} ${theme.cardRadius} divide-y divide-transparent p-2 space-y-1`}>
                {unfinishedTasks.map((t) => (
                  <div key={t.id} className="flex items-center justify-between text-xs py-1 px-1.5">
                    <span className="truncate">
                      <span className={`font-mono font-semibold mr-2 ${theme.accentText}`}>{t.id}</span>
                      <span className={theme.textPrimary}>{t.title}</span>
                    </span>
                    <span className={`text-[10px] shrink-0 ml-2 ${theme.textMuted}`}>
                      {STATUS_LABELS[t.status]}
                    </span>
                  </div>
                ))}
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1.5 ${theme.textSecondary}`}>
                  Move unfinished tasks into:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDestination('next-sprint')}
                    className={`p-2.5 text-left text-xs border transition ${theme.cardRadius} ${
                      destination === 'next-sprint'
                        ? `border-indigo-500 ${theme.accentBgSoft}`
                        : `${theme.border} ${theme.textSecondary}`
                    }`}
                  >
                    <p className="font-semibold">Sprint 15 (Next Sprint)</p>
                    <p className="text-[10px] opacity-80">Start immediately with carry-over</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDestination('backlog')}
                    className={`p-2.5 text-left text-xs border transition ${theme.cardRadius} ${
                      destination === 'backlog'
                        ? `border-indigo-500 ${theme.accentBgSoft}`
                        : `${theme.border} ${theme.textSecondary}`
                    }`}
                  >
                    <p className="font-semibold">Project Backlog</p>
                    <p className="text-[10px] opacity-80">Re-triage before next planning</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className={`flex justify-end gap-2 pt-3 border-t ${theme.border}`}>
            <button
              onClick={() => setCompleteSprintModalOpen(false)}
              className={`px-3.5 py-2 text-xs font-medium ${theme.buttonRadius} ${theme.secondaryBtn}`}
            >
              Keep Sprint Active
            </button>
            <button
              onClick={() => completeSprint(destination)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium ${theme.buttonRadius} ${theme.primaryBtn}`}
            >
              <span>Complete Sprint</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const WorkspaceProjectModal: React.FC = () => {
  const {
    concept,
    workspaceModalOpen,
    setWorkspaceModalOpen,
    createWorkspaceAndProject,
  } = useMavericks();
  const theme = CONCEPT_THEMES[concept];
  const [wsName, setWsName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectKey, setProjectKey] = useState('WEB');

  if (!workspaceModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4"
      onClick={() => setWorkspaceModalOpen(false)}
    >
      <div
        className={`w-full max-w-md border ${theme.borderStrong} ${theme.panelBg} ${theme.cardRadius} ${theme.shadowPopover} animate-slide-up`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-center justify-between px-5 py-4 border-b ${theme.border}`}>
          <div className="flex items-center gap-2">
            <FolderPlus className={`h-4 w-4 ${theme.accentText}`} />
            <h3 className={`text-sm ${theme.headingStyle} ${theme.textPrimary}`}>
              New Organization & Project
            </h3>
          </div>
          <button onClick={() => setWorkspaceModalOpen(false)} className={`rounded p-1 ${theme.ghostBtn}`}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            createWorkspaceAndProject(wsName, projectName, projectKey);
          }}
          className="p-5 space-y-3.5"
        >
          <div>
            <label className={`block text-xs font-medium mb-1 ${theme.textSecondary}`}>
              Organization Name
            </label>
            <input
              required
              value={wsName}
              onChange={(e) => setWsName(e.target.value)}
              placeholder="e.g. Horizon Engineering"
              className={`w-full px-3 py-2 text-xs border ${theme.buttonRadius} ${theme.inputBg}`}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className={`block text-xs font-medium mb-1 ${theme.textSecondary}`}>
                First Project Name
              </label>
              <input
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Web Platform"
                className={`w-full px-3 py-2 text-xs border ${theme.buttonRadius} ${theme.inputBg}`}
              />
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1 ${theme.textSecondary}`}>Key</label>
              <input
                required
                maxLength={4}
                value={projectKey}
                onChange={(e) => setProjectKey(e.target.value.toUpperCase())}
                className={`w-full px-3 py-2 text-xs font-mono uppercase border ${theme.buttonRadius} ${theme.inputBg}`}
              />
            </div>
          </div>

          <div className={`flex justify-end gap-2 pt-3 border-t ${theme.border}`}>
            <button
              type="button"
              onClick={() => setWorkspaceModalOpen(false)}
              className={`px-3 py-1.5 text-xs font-medium ${theme.buttonRadius} ${theme.secondaryBtn}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-1.5 text-xs font-medium ${theme.buttonRadius} ${theme.primaryBtn}`}
            >
              Create Workspace
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const BoardSettingsModal: React.FC = () => {
  const {
    concept,
    boardSettingsOpen,
    setBoardSettingsOpen,
    columns,
    updateColumnTitle,
  } = useMavericks();
  const theme = CONCEPT_THEMES[concept];

  if (!boardSettingsOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4"
      onClick={() => setBoardSettingsOpen(false)}
    >
      <div
        className={`w-full max-w-md border ${theme.borderStrong} ${theme.panelBg} ${theme.cardRadius} ${theme.shadowPopover} animate-slide-up`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-center justify-between px-5 py-4 border-b ${theme.border}`}>
          <div className="flex items-center gap-2">
            <Sliders className={`h-4 w-4 ${theme.accentText}`} />
            <h3 className={`text-sm ${theme.headingStyle} ${theme.textPrimary}`}>
              Customize Board Columns
            </h3>
          </div>
          <button onClick={() => setBoardSettingsOpen(false)} className={`rounded p-1 ${theme.ghostBtn}`}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          {columns.map((col) => (
            <div key={col.id} className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full shrink-0"
                style={{ backgroundColor: col.accentColor }}
              />
              <input
                defaultValue={col.title}
                onBlur={(e) => updateColumnTitle(col.id, e.target.value, col.wipLimit)}
                className={`flex-1 px-2.5 py-1.5 text-xs border ${theme.buttonRadius} ${theme.inputBg}`}
              />
              <input
                type="number"
                min={1}
                max={20}
                placeholder="WIP"
                defaultValue={col.wipLimit ?? ''}
                onBlur={(e) =>
                  updateColumnTitle(
                    col.id,
                    col.title,
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                className={`w-16 px-2 py-1.5 text-xs text-center border ${theme.buttonRadius} ${theme.inputBg}`}
                title="WIP Limit"
              />
            </div>
          ))}
          <p className={`text-[11px] ${theme.textMuted}`}>
            Edits apply automatically on blur. Requires Admin or Owner role.
          </p>
        </div>
      </div>
    </div>
  );
};

