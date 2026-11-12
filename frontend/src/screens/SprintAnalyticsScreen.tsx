import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Edit3,
  Flag,
  History,
  Lock,
  Target,
  TrendingUp,
} from 'lucide-react';
import { BurndownChart, VelocityChart } from '../components/charts/SprintCharts';
import {
  Avatar,
  EmptyStateIllustration,
  PriorityBadge,
  StatusBadge,
} from '../components/shared/CommonAtoms';
import { useMavericks } from '../state/MavericksContext';
import { CONCEPT_THEMES } from '../themes/conceptTokens';
import { canPerform } from '../utils/permissions';

export const SprintAnalyticsScreen: React.FC = () => {
  const {
    concept,
    activeSprint,
    sprintHistory,
    tasks,
    members,
    activeRole,
    systemState,
    selectTask,
    setCompleteSprintModalOpen,
    updateSprint,
  } = useMavericks();

  const theme = CONCEPT_THEMES[concept];
  const [editingSprint, setEditingSprint] = useState(false);
  const [goalDraft, setGoalDraft] = useState(activeSprint.goal);
  const [endDateDraft, setEndDateDraft] = useState(activeSprint.endDate);

  const sprintTasks = tasks.filter((t) => t.sprintId === activeSprint.id);
  const totalPoints = sprintTasks.reduce((s, t) => s + t.storyPoints, 0);
  const completedPoints = sprintTasks
    .filter((t) => t.status === 'DONE')
    .reduce((s, t) => s + t.storyPoints, 0);
  const remainingPoints = Math.max(0, totalPoints - completedPoints);
  const completionPct = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

  if (systemState === 'loading') {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`h-24 border ${theme.border} ${theme.panelBg} ${theme.cardRadius} animate-pulse`} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className={`h-64 border ${theme.border} ${theme.panelBg} ${theme.cardRadius} animate-pulse`} />
          <div className={`h-64 border ${theme.border} ${theme.panelBg} ${theme.cardRadius} animate-pulse`} />
        </div>
      </div>
    );
  }

  if (systemState === 'empty') {
    return (
      <EmptyStateIllustration
        conceptId={concept}
        title="No active sprint running"
        description="Plan your next sprint from the backlog to start tracking velocity, burndown, and story point completion."
      />
    );
  }

  const canManageSprint = canPerform(activeRole, 'manage_sprints');

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className={`p-5 border ${theme.border} ${theme.panelBg} ${theme.cardRadius} ${theme.shadowCard}`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                  activeSprint.status === 'ACTIVE'
                    ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                    : theme.accentBgSoft
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-soft" />
                {activeSprint.status}
              </span>
              <span className={`inline-flex items-center gap-1 text-xs ${theme.textMuted}`}>
                <Calendar className="h-3.5 w-3.5" />
                {activeSprint.startDate} — {activeSprint.endDate}
              </span>
            </div>

            <h1 className={`text-xl ${theme.headingStyle} ${theme.textPrimary}`}>
              {activeSprint.name}
            </h1>

            {editingSprint ? (
              <div className="flex flex-col sm:flex-row gap-2 pt-1 max-w-2xl">
                <input
                  value={goalDraft}
                  onChange={(e) => setGoalDraft(e.target.value)}
                  className={`flex-1 px-3 py-1.5 text-xs border ${theme.buttonRadius} ${theme.inputBg}`}
                  placeholder="Sprint goal"
                />
                <input
                  value={endDateDraft}
                  onChange={(e) => setEndDateDraft(e.target.value)}
                  className={`w-36 px-3 py-1.5 text-xs border ${theme.buttonRadius} ${theme.inputBg}`}
                  placeholder="End date"
                />
                <button
                  type="button"
                  onClick={() => {
                    updateSprint(activeSprint.id, { goal: goalDraft, endDate: endDateDraft });
                    setEditingSprint(false);
                  }}
                  className={`px-3 py-1.5 text-xs font-medium ${theme.buttonRadius} ${theme.primaryBtn}`}
                >
                  Save
                </button>
              </div>
            ) : (
              <p className={`flex items-start gap-1.5 text-xs ${theme.textSecondary}`}>
                <Target className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${theme.accentText}`} />
                <span>{activeSprint.goal}</span>
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (!canManageSprint) {
                  updateSprint(activeSprint.id, {});
                  return;
                }
                setGoalDraft(activeSprint.goal);
                setEndDateDraft(activeSprint.endDate);
                setEditingSprint(!editingSprint);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition ${theme.buttonRadius} ${theme.secondaryBtn}`}
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit Sprint</span>
            </button>
            <button
              type="button"
              onClick={() => setCompleteSprintModalOpen(true)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium transition ${theme.buttonRadius} ${theme.primaryBtn}`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Complete Sprint</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: 'Total Story Points',
            value: `${totalPoints} pts`,
            sub: `${sprintTasks.length} sprint issues`,
            icon: Flag,
          },
          {
            label: 'Completed Points',
            value: `${completedPoints} pts`,
            sub: `${sprintTasks.filter((t) => t.status === 'DONE').length} issues shipped`,
            icon: CheckCircle2,
          },
          {
            label: 'Remaining Points',
            value: `${remainingPoints} pts`,
            sub: `${sprintTasks.filter((t) => t.status !== 'DONE').length} in progress or queued`,
            icon: TrendingUp,
          },
          {
            label: 'Sprint Completion',
            value: `${completionPct}%`,
            sub: 'Target 100% by sprint end',
            icon: Target,
            showProgress: true,
          },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className={`p-4 border ${theme.border} ${theme.panelBg} ${theme.cardRadius} ${theme.shadowCard}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[11px] font-medium ${theme.textMuted}`}>{kpi.label}</span>
                <Icon className={`h-4 w-4 ${theme.accentText}`} />
              </div>
              <div className="flex items-end justify-between gap-2">
                <p className={`text-2xl font-bold tracking-tight ${theme.textPrimary}`}>{kpi.value}</p>
                {kpi.showProgress && concept === 'creative-studio' && (
                  <svg className="h-9 w-9 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#E2E8F0" strokeWidth="4" />
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="#E11D48"
                      strokeWidth="4"
                      strokeDasharray={`${(completionPct / 100) * 88} 88`}
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </div>
              {kpi.showProgress && concept !== 'creative-studio' && (
                <div className={`mt-2 h-1.5 w-full rounded-full overflow-hidden ${theme.panelSubtle}`}>
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
              )}
              <p className={`mt-1 text-[11px] ${theme.textMuted}`}>{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Burndown & Velocity Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={`p-5 border ${theme.border} ${theme.panelBg} ${theme.cardRadius} ${theme.shadowCard}`}>
          <BurndownChart sprint={activeSprint} conceptId={concept} />
        </div>
        <div className={`p-5 border ${theme.border} ${theme.panelBg} ${theme.cardRadius} ${theme.shadowCard}`}>
          <VelocityChart sprint={activeSprint} conceptId={concept} />
        </div>
      </div>

      {/* Sprint Backlog Table */}
      <div className={`border ${theme.border} ${theme.panelBg} ${theme.cardRadius} ${theme.shadowCard} overflow-hidden`}>
        <div className={`flex items-center justify-between px-5 py-3.5 border-b ${theme.border}`}>
          <div>
            <h3 className={`text-sm font-semibold ${theme.textPrimary}`}>Sprint Backlog</h3>
            <p className={`text-[11px] ${theme.textMuted}`}>
              Click any issue to inspect dependencies, commits, or update status
            </p>
          </div>
          <span className={`font-mono text-xs ${theme.textMuted}`}>{sprintTasks.length} tasks</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${theme.border} ${theme.tableHeaderBg} text-[11px] font-semibold uppercase tracking-wider ${theme.textMuted}`}>
                <th className="py-2.5 px-4">ID</th>
                <th className="py-2.5 px-4">Task</th>
                <th className="py-2.5 px-4">Assignee</th>
                <th className="py-2.5 px-4">Priority</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Points</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${theme.border}`}>
              {sprintTasks.map((task) => {
                const assignee = members.find((m) => m.id === task.assigneeId);
                const hasBlocker = task.blockedBy.some(
                  (bid) => tasks.find((t) => t.id === bid)?.status !== 'DONE'
                );
                return (
                  <tr
                    key={task.id}
                    onClick={() => selectTask(task.id, true)}
                    className={`cursor-pointer transition ${theme.tableRowHover}`}
                  >
                    <td className={`py-3 px-4 font-mono text-xs font-semibold ${theme.accentText}`}>
                      {task.id}
                    </td>
                    <td className="py-3 px-4 max-w-md">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium truncate ${theme.textPrimary}`}>
                          {task.title}
                        </span>
                        {hasBlocker && (
                          <span className="inline-flex items-center gap-1 rounded bg-rose-500/15 px-1.5 py-0.5 text-[10px] text-rose-500 shrink-0">
                            <Lock className="h-2.5 w-2.5" /> Blocked
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Avatar member={assignee} size="xs" conceptId={concept} />
                        <span className={`text-xs ${theme.textSecondary}`}>
                          {assignee?.name ?? 'Unassigned'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <PriorityBadge priority={task.priority} isDark={theme.isDark} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={task.status} isDark={theme.isDark} />
                    </td>
                    <td className={`py-3 px-4 text-right font-mono text-xs font-semibold ${theme.textPrimary}`}>
                      {task.storyPoints}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preserved Sprint History */}
      <div className={`p-5 border ${theme.border} ${theme.panelBg} ${theme.cardRadius} ${theme.shadowCard} space-y-3`}>
        <div className="flex items-center gap-2">
          <History className={`h-4 w-4 ${theme.accentText}`} />
          <h3 className={`text-sm font-semibold ${theme.textPrimary}`}>Preserved Sprint History</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sprintHistory.map((h) => (
            <div
              key={h.id}
              className={`flex items-center justify-between p-3 border ${theme.border} ${theme.panelSubtle} ${theme.cardRadius}`}
            >
              <div>
                <p className={`text-xs font-semibold ${theme.textPrimary}`}>{h.name}</p>
                <p className={`text-[11px] ${theme.textMuted}`}>
                  Completed {h.completedAt} · {h.completedCount} shipped, {h.movedCount} rolled over
                </p>
              </div>
              <span className={`font-mono text-xs font-bold ${theme.accentText}`}>
                {h.completedPoints}/{h.totalPoints} pts
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

