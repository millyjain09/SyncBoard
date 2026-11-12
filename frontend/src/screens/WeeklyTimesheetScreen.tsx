import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  X,
} from 'lucide-react';
import { Avatar, EmptyStateIllustration } from '../components/shared/CommonAtoms';
import { useMavericks } from '../state/MavericksContext';
import { CONCEPT_THEMES } from '../themes/conceptTokens';
import { TimesheetEntry } from '../types/mavericks';

type DayKey = keyof TimesheetEntry['days'];

const WEEKS = [
  { key: '2026-11-02', label: 'Nov 02 – Nov 08, 2026' },
  { key: '2026-11-09', label: 'Nov 09 – Nov 15, 2026 (Current)' },
];

const DAY_COLUMNS: Array<{ key: DayKey; label: string; short: string }> = [
  { key: 'mon', label: 'Mon', short: 'M' },
  { key: 'tue', label: 'Tue', short: 'T' },
  { key: 'wed', label: 'Wed', short: 'W' },
  { key: 'thu', label: 'Thu', short: 'T' },
  { key: 'fri', label: 'Fri', short: 'F' },
  { key: 'sat', label: 'Sat', short: 'S' },
  { key: 'sun', label: 'Sun', short: 'S' },
];

function formatMinutes(mins: number): string {
  if (!mins) return '—';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export const WeeklyTimesheetScreen: React.FC = () => {
  const {
    concept,
    currentUser,
    tasks,
    timesheets,
    systemState,
    logTimesheetMinutes,
    selectTask,
  } = useMavericks();

  const theme = CONCEPT_THEMES[concept];
  const [weekIdx, setWeekIdx] = useState(1);
  const activeWeek = WEEKS[weekIdx];

  const [logModalOpen, setLogModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState('MOB-1');
  const [selectedDay, setSelectedDay] = useState<DayKey>('fri');
  const [hoursInput, setHoursInput] = useState('2');
  const [minutesInput, setMinutesInput] = useState('30');
  const [validationError, setValidationError] = useState<string | null>(null);

  const weekEntries = useMemo(() => {
    if (systemState === 'empty') return [];
    return timesheets.filter((e) => e.weekStart === activeWeek.key);
  }, [timesheets, activeWeek.key, systemState]);

  const dailyTotals = useMemo(() => {
    const totals: Record<DayKey, number> = {
      mon: 0,
      tue: 0,
      wed: 0,
      thu: 0,
      fri: 0,
      sat: 0,
      sun: 0,
    };
    for (const row of weekEntries) {
      for (const col of DAY_COLUMNS) {
        totals[col.key] += row.days[col.key];
      }
    }
    return totals;
  }, [weekEntries]);

  const weeklyTotalMinutes = Object.values(dailyTotals).reduce((a, b) => a + b, 0);

  const handleOpenCellLog = (taskId: string, day: DayKey, currentMins: number) => {
    setSelectedTaskId(taskId);
    setSelectedDay(day);
    setHoursInput(String(Math.floor(currentMins / 60)));
    setMinutesInput(String(currentMins % 60));
    setValidationError(null);
    setLogModalOpen(true);
  };

  const handleSubmitTime = (e: React.FormEvent) => {
    e.preventDefault();
    const h = Number(hoursInput);
    const m = Number(minutesInput);
    if (Number.isNaN(h) || Number.isNaN(m) || h < 0 || m < 0) {
      setValidationError('Negative or non-numeric time values are not allowed.');
      return;
    }
    const totalMinutes = Math.round(h * 60 + m);
    if (totalMinutes < 1) {
      setValidationError('Minimum loggable time is 1 minute.');
      return;
    }
    if (totalMinutes > 1440) {
      setValidationError('Cannot exceed 24 hours (1,440 minutes) per task per day.');
      return;
    }

    const res = logTimesheetMinutes(selectedTaskId, activeWeek.key, selectedDay, totalMinutes);
    if (!res.ok) {
      setValidationError(res.error ?? 'Could not save time entry.');
      return;
    }
    setLogModalOpen(false);
  };

  if (systemState === 'loading') {
    return (
      <div className={`p-5 border ${theme.border} ${theme.panelBg} ${theme.cardRadius} space-y-3`}>
        <div className="h-8 w-64 rounded bg-slate-400/20 animate-pulse" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 w-full rounded bg-slate-400/20 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header & Week Switcher */}
      <div
        className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border ${theme.border} ${theme.panelBg} ${theme.cardRadius} ${theme.shadowCard}`}
      >
        <div className="flex items-center gap-3">
          <Avatar member={currentUser} size="lg" conceptId={concept} showPresence />
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-lg ${theme.headingStyle} ${theme.textPrimary}`}>
                Weekly Timesheet
              </h1>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${theme.accentBgSoft}`}>
                {currentUser.role}
              </span>
            </div>
            <p className={`text-xs ${theme.textMuted}`}>
              {currentUser.name} · {currentUser.title} · Total logged:{' '}
              <strong className={theme.textPrimary}>{formatMinutes(weeklyTotalMinutes)}</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className={`inline-flex items-center border ${theme.border} ${theme.panelSubtle} ${theme.buttonRadius} p-0.5`}>
            <button
              type="button"
              disabled={weekIdx === 0}
              onClick={() => setWeekIdx((i) => Math.max(0, i - 1))}
              className={`p-1.5 disabled:opacity-40 ${theme.ghostBtn} ${theme.buttonRadius}`}
              aria-label="Previous week"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className={`inline-flex items-center gap-1.5 px-3 text-xs font-medium ${theme.textPrimary}`}>
              <Calendar className="h-3.5 w-3.5 text-indigo-500" />
              {activeWeek.label}
            </span>
            <button
              type="button"
              disabled={weekIdx === WEEKS.length - 1}
              onClick={() => setWeekIdx((i) => Math.min(WEEKS.length - 1, i + 1))}
              className={`p-1.5 disabled:opacity-40 ${theme.ghostBtn} ${theme.buttonRadius}`}
              aria-label="Next week"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setValidationError(null);
              setLogModalOpen(true);
            }}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium transition ${theme.buttonRadius} ${theme.primaryBtn}`}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Log Time</span>
          </button>
        </div>
      </div>

      {/* Timesheet Grid or Empty State */}
      {weekEntries.length === 0 ? (
        <EmptyStateIllustration
          conceptId={concept}
          title="No working hours logged for this week yet"
          description="Track engineering hours per task (1m minimum, up to 24h per day). Click Log Time to record your first entry."
          actionLabel="Log Time Now"
          onAction={() => setLogModalOpen(true)}
        />
      ) : (
        <>
          {/* Desktop / Tablet Matrix */}
          <div className={`hidden md:block border ${theme.border} ${theme.panelBg} ${theme.cardRadius} ${theme.shadowCard} overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b ${theme.border} ${theme.tableHeaderBg} text-[11px] font-semibold uppercase tracking-wider ${theme.textMuted}`}>
                    <th className="py-3 px-4 min-w-[260px]">Task</th>
                    {DAY_COLUMNS.map((d) => (
                      <th key={d.key} className="py-3 px-3 text-center w-20">
                        {d.label}
                      </th>
                    ))}
                    <th className="py-3 px-4 text-right w-24">Total</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme.border}`}>
                  {weekEntries.map((entry) => {
                    const task = tasks.find((t) => t.id === entry.taskId);
                    const rowTotal = DAY_COLUMNS.reduce((sum, d) => sum + entry.days[d.key], 0);
                    return (
                      <tr key={entry.id} className={theme.tableRowHover}>
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => selectTask(entry.taskId, true)}
                            className="text-left group"
                          >
                            <span className={`font-mono text-xs font-semibold mr-2 ${theme.accentText} group-hover:underline`}>
                              {entry.taskId}
                            </span>
                            <span className={`text-xs font-medium ${theme.textPrimary}`}>
                              {task?.title ?? 'Project task'}
                            </span>
                          </button>
                        </td>
                        {DAY_COLUMNS.map((d) => {
                          const mins = entry.days[d.key];
                          return (
                            <td key={d.key} className="py-2 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleOpenCellLog(entry.taskId, d.key, mins)}
                                className={`w-full py-1.5 px-1 text-xs font-mono transition ${theme.buttonRadius} ${
                                  mins > 0
                                    ? `${theme.panelSubtle} ${theme.textPrimary} font-semibold border ${theme.border}`
                                    : `${theme.textMuted} hover:bg-slate-400/10`
                                }`}
                                title={`Edit ${d.label} hours for ${entry.taskId}`}
                              >
                                {formatMinutes(mins)}
                              </button>
                            </td>
                          );
                        })}
                        <td className={`py-3 px-4 text-right font-mono text-xs font-bold ${theme.accentText}`}>
                          {formatMinutes(rowTotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className={`border-t-2 ${theme.borderStrong} ${theme.tableHeaderBg}`}>
                    <td className={`py-3 px-4 text-xs font-bold ${theme.textPrimary}`}>
                      Daily Totals
                    </td>
                    {DAY_COLUMNS.map((d) => (
                      <td
                        key={d.key}
                        className={`py-3 px-2 text-center font-mono text-xs font-bold ${theme.textPrimary}`}
                      >
                        {formatMinutes(dailyTotals[d.key])}
                      </td>
                    ))}
                    <td className={`py-3 px-4 text-right font-mono text-sm font-bold ${theme.accentText}`}>
                      {formatMinutes(weeklyTotalMinutes)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Mobile Responsive Task Cards (< 768px) */}
          <div className="md:hidden space-y-3">
            {weekEntries.map((entry) => {
              const task = tasks.find((t) => t.id === entry.taskId);
              const rowTotal = DAY_COLUMNS.reduce((sum, d) => sum + entry.days[d.key], 0);
              return (
                <div
                  key={entry.id}
                  className={`p-4 border ${theme.border} ${theme.panelBg} ${theme.cardRadius} ${theme.shadowCard} space-y-3`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className={`font-mono text-xs font-semibold ${theme.accentText}`}>
                        {entry.taskId}
                      </span>
                      <p className={`text-xs font-medium mt-0.5 ${theme.textPrimary}`}>
                        {task?.title}
                      </p>
                    </div>
                    <span className={`font-mono text-xs font-bold ${theme.accentText}`}>
                      {formatMinutes(rowTotal)}
                    </span>
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {DAY_COLUMNS.map((d) => (
                      <button
                        key={d.key}
                        type="button"
                        onClick={() => handleOpenCellLog(entry.taskId, d.key, entry.days[d.key])}
                        className={`flex flex-col items-center py-1.5 border ${theme.border} ${theme.panelSubtle} ${theme.buttonRadius}`}
                      >
                        <span className={`text-[9px] ${theme.textMuted}`}>{d.short}</span>
                        <span className={`text-[10px] font-mono font-semibold ${theme.textPrimary}`}>
                          {entry.days[d.key] ? `${Math.round((entry.days[d.key] / 60) * 10) / 10}h` : '·'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Log Time Modal with 1m - 24h Validation */}
      {logModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4"
          onClick={() => setLogModalOpen(false)}
        >
          <div
            className={`w-full max-w-md border ${theme.borderStrong} ${theme.panelBg} ${theme.cardRadius} ${theme.shadowPopover} animate-slide-up`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex items-center justify-between px-5 py-4 border-b ${theme.border}`}>
              <div className="flex items-center gap-2">
                <Clock className={`h-4 w-4 ${theme.accentText}`} />
                <h3 className={`text-sm ${theme.headingStyle} ${theme.textPrimary}`}>
                  Log Working Hours
                </h3>
              </div>
              <button onClick={() => setLogModalOpen(false)} className={`rounded p-1 ${theme.ghostBtn}`}>
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitTime} className="p-5 space-y-4">
              <div>
                <label className={`block text-xs font-medium mb-1 ${theme.textSecondary}`}>Task</label>
                <select
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  className={`w-full px-3 py-2 text-xs border ${theme.buttonRadius} ${theme.inputBg}`}
                >
                  {tasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.id} — {t.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1 ${theme.textSecondary}`}>Day</label>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value as DayKey)}
                  className={`w-full px-3 py-2 text-xs border ${theme.buttonRadius} ${theme.inputBg}`}
                >
                  {DAY_COLUMNS.map((d) => (
                    <option key={d.key} value={d.key}>
                      {d.label} ({activeWeek.label})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${theme.textSecondary}`}>
                    Hours (0–24)
                  </label>
                  <input
                    type="number"
                    value={hoursInput}
                    onChange={(e) => setHoursInput(e.target.value)}
                    className={`w-full px-3 py-2 text-xs font-mono border ${theme.buttonRadius} ${theme.inputBg}`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${theme.textSecondary}`}>
                    Minutes (0–59)
                  </label>
                  <input
                    type="number"
                    value={minutesInput}
                    onChange={(e) => setMinutesInput(e.target.value)}
                    className={`w-full px-3 py-2 text-xs font-mono border ${theme.buttonRadius} ${theme.inputBg}`}
                  />
                </div>
              </div>

              <p className={`text-[11px] ${theme.textMuted}`}>
                Validation rule: minimum 1 minute, maximum 24 hours per task per day.
              </p>

              {validationError && (
                <div className="flex items-start gap-2 rounded-md bg-rose-500/10 border border-rose-500/25 px-3 py-2 text-xs text-rose-500">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{validationError}</span>
                </div>
              )}

              <div className={`flex justify-end gap-2 pt-3 border-t ${theme.border}`}>
                <button
                  type="button"
                  onClick={() => setLogModalOpen(false)}
                  className={`px-3.5 py-2 text-xs font-medium ${theme.buttonRadius} ${theme.secondaryBtn}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-xs font-medium ${theme.buttonRadius} ${theme.primaryBtn}`}
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

