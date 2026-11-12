import React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Bug,
  CheckCircle2,
  GitPullRequest,
  Info,
  Layers,
  Sparkles,
  Wrench,
  X,
} from 'lucide-react';
import { useMavericks } from '../../state/MavericksContext';
import {
  CONCEPT_THEMES,
  getPriorityBadgeStyle,
  getStatusPillStyle,
} from '../../themes/conceptTokens';
import { ConceptId, Member, PRStatus, TaskPriority, TaskStatus, TaskType } from '../../types/mavericks';
import { STATUS_LABELS, TYPE_LABELS } from '../../utils/queryParser';

export const Avatar: React.FC<{
  member?: Member | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  conceptId?: ConceptId;
  showPresence?: boolean;
}> = ({ member, size = 'sm', conceptId = 'linear-minimal', showPresence = false }) => {
  const sizes = {
    xs: 'h-5 w-5 text-[9px]',
    sm: 'h-6 w-6 text-[10px]',
    md: 'h-8 w-8 text-xs',
    lg: 'h-10 w-10 text-sm',
  };

  const shape =
    conceptId === 'enterprise-exec'
      ? 'rounded-md'
      : conceptId === 'human-workspace'
      ? 'rounded-full ring-2 ring-[#FFFDF9]'
      : 'rounded-full';

  if (!member) {
    return (
      <span
        className={`inline-flex items-center justify-center ${sizes[size]} ${shape} bg-slate-200 text-slate-500 font-medium`}
        title="Unassigned"
      >
        ?
      </span>
    );
  }

  return (
    <span className="relative inline-flex shrink-0" title={`${member.name} (${member.role})`}>
      <span
        className={`inline-flex items-center justify-center font-semibold text-white ${sizes[size]} ${shape}`}
        style={{ backgroundColor: member.avatarColor }}
      >
        {member.avatarInitials}
      </span>
      {showPresence && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 ${
            conceptId === 'dev-command' ? 'border-[#111520]' : 'border-white'
          } ${member.online ? 'bg-emerald-500' : 'bg-slate-400'}`}
        />
      )}
    </span>
  );
};

export const TaskTypeBadge: React.FC<{ type: TaskType; isDark?: boolean; compact?: boolean }> = ({
  type,
  isDark = false,
  compact = false,
}) => {
  const map: Record<TaskType, { icon: React.ComponentType<{ className?: string }>; light: string; dark: string }> = {
    FEATURE: {
      icon: Sparkles,
      light: 'text-indigo-700 bg-indigo-50 border-indigo-200',
      dark: 'text-indigo-300 bg-indigo-500/15 border-indigo-500/30',
    },
    BUG: {
      icon: Bug,
      light: 'text-rose-700 bg-rose-50 border-rose-200',
      dark: 'text-rose-300 bg-rose-500/15 border-rose-500/30',
    },
    TASK: {
      icon: Layers,
      light: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      dark: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30',
    },
    CHORE: {
      icon: Wrench,
      light: 'text-slate-700 bg-slate-100 border-slate-200',
      dark: 'text-slate-300 bg-slate-700/50 border-slate-600',
    },
  };
  const cfg = map[type];
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium border ${
        isDark ? cfg.dark : cfg.light
      }`}
    >
      <Icon className="h-2.5 w-2.5" />
      {!compact && <span>{TYPE_LABELS[type]}</span>}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: TaskPriority; isDark?: boolean }> = ({
  priority,
  isDark = false,
}) => {
  const labelMap: Record<TaskPriority, string> = {
    URGENT: 'Urgent',
    HIGH: 'High',
    MEDIUM: 'Medium',
    LOW: 'Low',
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold ${getPriorityBadgeStyle(
        priority,
        isDark
      )}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          priority === 'URGENT'
            ? 'bg-rose-500'
            : priority === 'HIGH'
            ? 'bg-amber-500'
            : priority === 'MEDIUM'
            ? 'bg-sky-500'
            : 'bg-slate-400'
        }`}
      />
      {labelMap[priority]}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: TaskStatus; isDark?: boolean }> = ({
  status,
  isDark = false,
}) => (
  <span
    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${getStatusPillStyle(
      status,
      isDark
    )}`}
  >
    {STATUS_LABELS[status]}
  </span>
);

export const PRBadge: React.FC<{
  number: number;
  status: PRStatus;
  isDark?: boolean;
}> = ({ number, status, isDark = false }) => {
  const style =
    status === 'MERGED'
      ? isDark
        ? 'bg-purple-500/20 text-purple-300 border-purple-500/35'
        : 'bg-purple-50 text-purple-700 border-purple-200'
      : status === 'OPEN'
      ? isDark
        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35'
        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : isDark
      ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
      : 'bg-rose-50 text-rose-700 border-rose-200';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-mono font-medium border ${style}`}
    >
      <GitPullRequest className="h-2.5 w-2.5" />
      <span>#{number}</span>
      <span className="capitalize font-sans">{status.toLowerCase()}</span>
    </span>
  );
};

export const EmptyStateIllustration: React.FC<{
  conceptId: ConceptId;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}> = ({ conceptId, title, description, actionLabel, onAction }) => {
  const theme = CONCEPT_THEMES[conceptId];
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 ${theme.cardRadius} border border-dashed ${theme.borderStrong} ${theme.panelSubtle}`}
    >
      {/* Bespoke lightweight SVG illustration tailored to Human/Creative vs Minimal/Dev */}
      <svg
        width="84"
        height="64"
        viewBox="0 0 84 64"
        fill="none"
        className="mb-3 opacity-90"
        aria-hidden="true"
      >
        <rect
          x="8"
          y="10"
          width="68"
          height="44"
          rx={conceptId === 'human-workspace' ? '14' : '8'}
          fill={theme.isDark ? '#171C2B' : '#FFFFFF'}
          stroke={theme.isDark ? '#2E3852' : '#CBD5E1'}
          strokeWidth="1.5"
        />
        <rect
          x="18"
          y="20"
          width="28"
          height="5"
          rx="2.5"
          fill={conceptId === 'human-workspace' ? '#F59E0B' : theme.isDark ? '#38BDF8' : '#5E6AD2'}
        />
        <rect
          x="18"
          y="30"
          width="48"
          height="4"
          rx="2"
          fill={theme.isDark ? '#2A334B' : '#E2E8F0'}
        />
        <rect
          x="18"
          y="38"
          width="36"
          height="4"
          rx="2"
          fill={theme.isDark ? '#2A334B' : '#E2E8F0'}
        />
        <circle
          cx="62"
          cy="22"
          r="5"
          fill={conceptId === 'creative-studio' ? '#E11D48' : '#10B981'}
          fillOpacity="0.22"
        />
        <circle
          cx="62"
          cy="22"
          r="2.2"
          fill={conceptId === 'creative-studio' ? '#E11D48' : '#10B981'}
        />
      </svg>
      <h4 className={`text-sm ${theme.headingStyle} ${theme.textPrimary}`}>{title}</h4>
      <p className={`mt-1 max-w-sm text-xs ${theme.textMuted}`}>{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className={`mt-4 px-3.5 py-1.5 text-xs font-medium transition ${theme.buttonRadius} ${theme.primaryBtn}`}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export const SkeletonBoard: React.FC<{ conceptId: ConceptId }> = ({ conceptId }) => {
  const theme = CONCEPT_THEMES[conceptId];
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {[1, 2, 3, 4, 5].map((col) => (
        <div
          key={col}
          className={`p-3 border ${theme.border} ${theme.panelSubtle} ${theme.cardRadius} space-y-2.5`}
        >
          <div className="flex items-center justify-between">
            <div className="h-3.5 w-20 rounded bg-slate-400/20 animate-pulse" />
            <div className="h-4 w-6 rounded bg-slate-400/20 animate-pulse" />
          </div>
          {[1, 2, 3].map((card) => (
            <div
              key={card}
              className={`p-3 border ${theme.border} ${theme.cardBg} ${theme.cardRadius} space-y-2`}
            >
              <div className="h-3 w-14 rounded bg-slate-400/20 animate-pulse" />
              <div className="h-3.5 w-full rounded bg-slate-400/20 animate-pulse" />
              <div className="h-3.5 w-3/4 rounded bg-slate-400/20 animate-pulse" />
              <div className="flex justify-between pt-1">
                <div className="h-4 w-12 rounded bg-slate-400/20 animate-pulse" />
                <div className="h-5 w-5 rounded-full bg-slate-400/20 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export const ToastStack: React.FC = () => {
  const { toasts, dismissToast, concept } = useMavericks();
  const theme = CONCEPT_THEMES[concept];

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-2">
      {toasts.map((t) => {
        const Icon =
          t.tone === 'success'
            ? CheckCircle2
            : t.tone === 'warning'
            ? AlertTriangle
            : t.tone === 'error'
            ? AlertCircle
            : Info;
        const iconColor =
          t.tone === 'success'
            ? 'text-emerald-500'
            : t.tone === 'warning'
            ? 'text-amber-500'
            : t.tone === 'error'
            ? 'text-rose-500'
            : 'text-sky-500';

        return (
          <div
            key={t.id}
            className={`pointer-events-auto animate-slide-up flex items-start gap-2.5 p-3 border ${theme.borderStrong} ${theme.panelBg} ${theme.cardRadius} ${theme.shadowPopover}`}
          >
            <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${iconColor}`} />
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-semibold ${theme.textPrimary}`}>{t.title}</p>
              {t.description && (
                <p className={`text-[11px] mt-0.5 leading-relaxed ${theme.textMuted}`}>
                  {t.description}
                </p>
              )}
            </div>
            <button
              onClick={() => dismissToast(t.id)}
              className={`rounded p-0.5 ${theme.ghostBtn}`}
              aria-label="Dismiss notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

