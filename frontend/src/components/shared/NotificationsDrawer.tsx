import React from 'react';
import {
  AtSign,
  Bell,
  CheckCheck,
  GitPullRequest,
  MessageSquare,
  RefreshCw,
  UserPlus,
  X,
} from 'lucide-react';
import { useMavericks } from '../../state/MavericksContext';
import { CONCEPT_THEMES } from '../../themes/conceptTokens';

export const NotificationsDrawer: React.FC = () => {
  const {
    concept,
    notificationsOpen,
    setNotificationsOpen,
    notifications,
    markAllNotificationsRead,
    selectTask,
  } = useMavericks();

  const theme = CONCEPT_THEMES[concept];
  if (!notificationsOpen) return null;

  const iconForKind = (kind: string) => {
    switch (kind) {
      case 'github':
        return <GitPullRequest className="h-4 w-4 text-purple-500" />;
      case 'mention':
        return <AtSign className="h-4 w-4 text-sky-500" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4 text-amber-500" />;
      case 'assignment':
        return <UserPlus className="h-4 w-4 text-emerald-500" />;
      default:
        return <RefreshCw className="h-4 w-4 text-indigo-500" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[1px]"
      onClick={() => setNotificationsOpen(false)}
    >
      <div
        className={`h-full w-full max-w-md border-l ${theme.borderStrong} ${theme.panelBg} ${theme.shadowPopover} flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-center justify-between px-5 py-4 border-b ${theme.border}`}>
          <div className="flex items-center gap-2">
            <Bell className={`h-4 w-4 ${theme.accentText}`} />
            <h3 className={`text-sm ${theme.headingStyle} ${theme.textPrimary}`}>
              Notifications & Activity
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllNotificationsRead}
              className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium ${theme.ghostBtn}`}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
            <button
              onClick={() => setNotificationsOpen(false)}
              className={`rounded p-1 ${theme.ghostBtn}`}
              aria-label="Close notifications"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-transparent p-3 space-y-2">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => {
                if (n.taskId) {
                  selectTask(n.taskId, true);
                  setNotificationsOpen(false);
                }
              }}
              className={`w-full text-left flex items-start gap-3 p-3 border ${theme.border} ${
                n.read ? theme.cardBg : theme.panelSubtle
              } ${theme.cardRadius} ${theme.cardHover} transition`}
            >
              <div className={`mt-0.5 rounded-lg p-2 ${theme.panelSubtle}`}>
                {iconForKind(n.kind)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-xs font-semibold ${theme.textPrimary}`}>{n.title}</p>
                  {!n.read && <span className="h-2 w-2 rounded-full bg-indigo-500 shrink-0" />}
                </div>
                <p className={`mt-1 text-xs leading-relaxed ${theme.textMuted}`}>{n.body}</p>
                <p className={`mt-1.5 text-[10px] ${theme.textMuted}`}>{n.timestamp}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

