import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Command,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { useMavericks } from '../../state/MavericksContext';
import { CONCEPT_THEMES } from '../../themes/conceptTokens';
import { filterTasksByQuery, parseSmartQuery } from '../../utils/queryParser';
import { PriorityBadge, StatusBadge } from './CommonAtoms';

const SAMPLE_QUERIES = [
  'assignee = me AND priority = high',
  'status = testing AND blocked = true',
  'pr = merged',
  'type = bug',
];

export const CommandSearchModal: React.FC = () => {
  const {
    concept,
    commandBarOpen,
    setCommandBarOpen,
    searchQuery,
    setSearchQuery,
    tasks,
    members,
    currentUser,
    selectTask,
    setScreen,
  } = useMavericks();

  const theme = CONCEPT_THEMES[concept];
  const [localQuery, setLocalQuery] = useState(searchQuery);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery, commandBarOpen]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandBarOpen(!commandBarOpen);
      }
      if (e.key === 'Escape' && commandBarOpen) {
        setCommandBarOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [commandBarOpen, setCommandBarOpen]);

  const parsed = useMemo(() => parseSmartQuery(localQuery), [localQuery]);
  const matchedTasks = useMemo(
    () => filterTasksByQuery(tasks, parsed, members, currentUser.id, 'ALL', 'ALL').slice(0, 6),
    [tasks, parsed, members, currentUser.id]
  );

  if (!commandBarOpen) return null;

  const applyToBoard = () => {
    setSearchQuery(localQuery);
    setScreen('board');
    setCommandBarOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-[2px] pt-16 px-4"
      onClick={() => setCommandBarOpen(false)}
    >
      <div
        className={`w-full max-w-2xl overflow-hidden border ${theme.borderStrong} ${theme.panelBg} ${theme.cardRadius} ${theme.shadowPopover} animate-slide-up`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className={`flex items-center gap-3 px-4 py-3 border-b ${theme.border}`}>
          <Search className={`h-4 w-4 shrink-0 ${theme.textMuted}`} />
          <input
            autoFocus
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !parsed.error) applyToBoard();
            }}
            placeholder="Search tasks or type smart query: assignee = me AND priority = high"
            className={`w-full bg-transparent text-sm focus:outline-none ${theme.textPrimary}`}
          />
          {localQuery && (
            <button
              onClick={() => {
                setLocalQuery('');
                setSearchQuery('');
              }}
              className={`rounded p-1 ${theme.ghostBtn}`}
              title="Clear query"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <kbd
            className={`hidden sm:inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-mono border ${theme.border} ${theme.textMuted}`}
          >
            ESC
          </kbd>
        </div>

        {/* Parsed Filter Chips & Invalid Query Guidance */}
        {(parsed.chips.length > 0 || parsed.error) && (
          <div className={`px-4 py-2.5 border-b ${theme.border} ${theme.panelSubtle} space-y-2`}>
            {parsed.chips.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className={`text-[10px] uppercase tracking-wider font-semibold ${theme.textMuted}`}>
                  Active Filters:
                </span>
                {parsed.chips.map((chip) => (
                  <span
                    key={chip.id}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${theme.accentBgSoft}`}
                  >
                    <span className="font-mono">{chip.field}</span>
                    <span className="opacity-70">{chip.operator}</span>
                    <span className="font-semibold">{chip.value}</span>
                  </span>
                ))}
              </div>
            )}

            {parsed.error && (
              <div className="flex items-start gap-2 rounded-md bg-rose-500/10 border border-rose-500/25 px-3 py-2 text-xs text-rose-500">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">{parsed.error}</p>
                  {parsed.suggestion && <p className="text-[11px] opacity-90 mt-0.5">{parsed.suggestion}</p>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Query Suggestions */}
        <div className={`px-4 py-2.5 border-b ${theme.border} flex flex-wrap items-center gap-1.5`}>
          <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${theme.textMuted} mr-1`}>
            <Sparkles className="h-3 w-3" /> Try:
          </span>
          {SAMPLE_QUERIES.map((q) => (
            <button
              key={q}
              onClick={() => setLocalQuery(q)}
              className={`rounded-md px-2 py-1 text-[11px] font-mono border ${theme.border} ${theme.ghostBtn} transition`}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto divide-y divide-transparent">
          {matchedTasks.length === 0 ? (
            <div className={`p-6 text-center text-xs ${theme.textMuted}`}>
              No tasks match this query yet. Try clearing a filter or adjusting your syntax.
            </div>
          ) : (
            matchedTasks.map((task) => (
              <button
                key={task.id}
                onClick={() => {
                  selectTask(task.id, true);
                  setCommandBarOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left transition ${theme.tableRowHover}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`font-mono text-xs font-semibold shrink-0 ${theme.accentText}`}>
                    {task.id}
                  </span>
                  <span className={`text-xs font-medium truncate ${theme.textPrimary}`}>
                    {task.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <PriorityBadge priority={task.priority} isDark={theme.isDark} />
                  <StatusBadge status={task.status} isDark={theme.isDark} />
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-between px-4 py-2.5 border-t ${theme.border} ${theme.panelSubtle}`}>
          <div className={`flex items-center gap-1.5 text-[11px] ${theme.textMuted}`}>
            <Command className="h-3 w-3" />
            <span>Supports fields: assignee, priority, status, type, label, blocked, pr</span>
          </div>
          <button
            onClick={applyToBoard}
            disabled={Boolean(parsed.error)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${theme.buttonRadius} ${theme.primaryBtn}`}
          >
            <span>Apply to Board</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

