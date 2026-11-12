import React, { useState } from 'react';
import {
  BarChart3,
  Bell,
  Clock,
  Command,
  FileText,
  FolderPlus,
  Github,
  Kanban,
  Menu,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Users,
  WifiOff,
  X,
} from 'lucide-react';
import { Avatar } from '../components/shared/CommonAtoms';
import { useMavericks } from '../state/MavericksContext';
import { CONCEPT_THEMES } from '../themes/conceptTokens';
import { CONCEPTS, SCREENS } from '../themes/concepts';
import { ScreenId } from '../types/mavericks';

const SCREEN_ICONS: Record<ScreenId, React.ComponentType<{ className?: string }>> = {
  board: Kanban,
  task: FileText,
  sprint: BarChart3,
  timesheet: Clock,
  team: Users,
};

export const ConceptShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    concept,
    screen,
    setScreen,
    viewport,
    systemState,
    setSystemState,
    workspaces,
    activeWorkspace,
    setActiveWorkspaceId,
    projects,
    activeProject,
    setActiveProjectId,
    members,
    currentUser,
    notifications,
    setCommandBarOpen,
    setNotificationsOpen,
    setGithubModalOpen,
    setWorkspaceModalOpen,
    openCreateTaskModal,
    tasks,
  } = useMavericks();

  const theme = CONCEPT_THEMES[concept];
  const conceptMeta = CONCEPTS.find((c) => c.id === concept)!;
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const onlineMembers = members.filter((m) => m.online);
  const donePoints = tasks
    .filter((t) => t.status === 'DONE')
    .reduce((s, t) => s + t.storyPoints, 0);
  const totalPoints = tasks.reduce((s, t) => s + t.storyPoints, 0);

  const viewportWidthClass =
    viewport === '1440'
      ? 'max-w-[1440px] mx-auto my-4 rounded-xl border shadow-2xl overflow-hidden'
      : viewport === '1280'
      ? 'max-w-[1280px] mx-auto my-4 rounded-xl border shadow-2xl overflow-hidden'
      : viewport === '768'
      ? 'max-w-[768px] mx-auto my-4 rounded-2xl border shadow-2xl overflow-hidden'
      : viewport === '390'
      ? 'max-w-[390px] mx-auto my-4 rounded-[28px] border-4 border-slate-800 shadow-2xl overflow-hidden'
      : 'w-full';

  const isCompactViewport = viewport === '390' || viewport === '768';
  const isCreativeTopNav = concept === 'creative-studio';

  const renderNavItems = (onSelect?: () => void) => (
    <nav className="space-y-1" aria-label="Primary navigation">
      {concept === 'enterprise-exec' && (
        <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Workspace Operations
        </p>
      )}
      {SCREENS.map((item) => {
        const Icon = SCREEN_ICONS[item.id];
        const active = screen === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setScreen(item.id);
              onSelect?.();
            }}
            className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 text-xs font-medium transition ${
              theme.buttonRadius
            } ${
              active
                ? theme.sidebarActiveItem
                : `${theme.sidebarMuted} hover:bg-black/5 ${
                    theme.isDark || concept === 'enterprise-exec' ? 'hover:bg-white/5 hover:text-white' : ''
                  }`
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.shortLabel}</span>
            </span>
            {item.id === 'board' && (
              <span className="text-[10px] font-mono opacity-70">{tasks.length}</span>
            )}
          </button>
        );
      })}
    </nav>
  );

  const renderWorkspaceSelector = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-1">
        <select
          value={activeWorkspace.id}
          onChange={(e) => setActiveWorkspaceId(e.target.value)}
          className={`flex-1 px-2.5 py-1.5 text-xs font-semibold border focus:outline-none ${
            theme.buttonRadius
          } ${
            concept === 'enterprise-exec' || theme.isDark
              ? 'bg-white/10 border-white/15 text-white'
              : `${theme.cardBg} ${theme.border} ${theme.textPrimary}`
          }`}
          aria-label="Switch workspace"
        >
          {workspaces.map((w) => (
            <option key={w.id} value={w.id} className="text-slate-900">
              {w.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setWorkspaceModalOpen(true)}
          title="Create organization or project"
          className={`p-1.5 border ${theme.buttonRadius} ${
            concept === 'enterprise-exec' || theme.isDark
              ? 'border-white/15 text-slate-200 hover:bg-white/10'
              : `${theme.border} ${theme.ghostBtn}`
          }`}
        >
          <FolderPlus className="h-3.5 w-3.5" />
        </button>
      </div>

      <select
        value={activeProject.id}
        onChange={(e) => setActiveProjectId(e.target.value)}
        className={`w-full px-2.5 py-1.5 text-xs border focus:outline-none ${theme.buttonRadius} ${
          concept === 'enterprise-exec' || theme.isDark
            ? 'bg-white/5 border-white/10 text-slate-200'
            : `${theme.panelSubtle} ${theme.border} ${theme.textSecondary}`
        }`}
        aria-label="Switch project"
      >
        {projects.map((p) => (
          <option key={p.id} value={p.id} className="text-slate-900">
            {p.key} · {p.name}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div data-concept={concept} className={`${conceptMeta.fontClass} ${theme.appBg} min-h-[calc(100vh-44px)] transition-colors duration-200`}>
      <div className={`${viewportWidthClass} ${theme.appBg} ${theme.border} flex flex-col min-h-[calc(100vh-44px)]`}>
        {/* Offline / Reconnecting Global Banner */}
        {systemState === 'offline' && (
          <div className="flex items-center justify-between gap-3 bg-amber-500 px-4 py-2 text-xs font-medium text-slate-950">
            <div className="flex items-center gap-2">
              <WifiOff className="h-4 w-4 shrink-0" />
              <span>
                Connection interrupted — Mavericks is queueing offline Kanban updates and reconnecting...
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSystemState('normal')}
              className="inline-flex items-center gap-1 rounded bg-slate-950/15 px-2.5 py-1 text-[11px] font-semibold hover:bg-slate-950/25"
            >
              <RefreshCw className="h-3 w-3" /> Reconnect now
            </button>
          </div>
        )}

        {/* Creative Studio Top-Bar Architecture (Concept 05) */}
        {isCreativeTopNav && (
          <header className={`border-b ${theme.border} ${theme.headerBg} px-4 py-2.5`}>
            <div className="mx-auto max-w-[1440px] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-indigo-600 text-white font-bold text-sm shadow-sm">
                    M
                  </span>
                  <div>
                    <p className={`text-sm font-bold leading-none ${theme.textPrimary}`}>Mavericks</p>
                    <p className={`text-[10px] ${theme.textMuted}`}>
                      {activeWorkspace.name} / {activeProject.name}
                    </p>
                  </div>
                </div>

                {!isCompactViewport && (
                  <div className="hidden md:flex items-center gap-1 rounded-full bg-[#F1F3FA] p-1 border border-[#E2E6F0]">
                    {SCREENS.map((item) => {
                      const Icon = SCREEN_ICONS[item.id];
                      const active = screen === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setScreen(item.id)}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition ${
                            active
                              ? 'bg-[#18181B] text-white shadow-sm'
                              : 'text-[#52525B] hover:text-[#18181B]'
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          <span>{item.shortLabel}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCommandBarOpen(true)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs ${theme.buttonRadius} ${theme.secondaryBtn}`}
                >
                  <Search className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Search</span>
                  <kbd className="text-[10px] font-mono opacity-60">⌘K</kbd>
                </button>
                <button
                  type="button"
                  onClick={() => setNotificationsOpen(true)}
                  className={`relative p-2 ${theme.buttonRadius} ${theme.secondaryBtn}`}
                  aria-label="Open notifications"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <div className="hidden sm:flex -space-x-1.5">
                  {onlineMembers.map((m) => (
                    <Avatar key={m.id} member={m} size="sm" conceptId={concept} showPresence />
                  ))}
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Main Sidebar + Content Area */}
        <div className="flex flex-1 min-h-0">
          {/* Desktop Sidebar (Concepts 01–04) */}
          {!isCreativeTopNav && !isCompactViewport && (
            <aside
              className={`hidden md:flex flex-col shrink-0 border-r ${theme.sidebarBorder} ${
                theme.sidebarBg
              } ${concept === 'linear-minimal' ? 'w-56' : 'w-64'} p-3.5 justify-between`}
            >
              <div className="space-y-4">
                {/* Brand Lockup */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex h-7 w-7 items-center justify-center text-xs font-bold ${
                        concept === 'human-workspace'
                          ? 'rounded-xl bg-[#C2590A] text-white'
                          : concept === 'enterprise-exec'
                          ? 'rounded bg-[#1D4ED8] text-white'
                          : concept === 'dev-command'
                          ? 'rounded-md bg-gradient-to-tr from-blue-600 to-violet-500 text-white'
                          : 'rounded-md bg-[#111827] text-white'
                      }`}
                    >
                      MV
                    </span>
                    <div>
                      <p className={`text-xs font-bold leading-none ${theme.sidebarText}`}>
                        Mavericks
                      </p>
                      <p className={`text-[10px] mt-0.5 ${theme.sidebarMuted}`}>
                        {conceptMeta.shortName}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openCreateTaskModal('TODO')}
                    className={`p-1.5 ${theme.buttonRadius} ${
                      concept === 'enterprise-exec' || theme.isDark
                        ? 'bg-white/10 text-white hover:bg-white/20'
                        : `${theme.cardBg} border ${theme.border} ${theme.textPrimary}`
                    }`}
                    title="Quick create issue"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Workspace & Project Switcher */}
                {renderWorkspaceSelector()}

                {/* Command Trigger */}
                <button
                  type="button"
                  onClick={() => setCommandBarOpen(true)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs border transition ${
                    theme.buttonRadius
                  } ${
                    concept === 'enterprise-exec' || theme.isDark
                      ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      : `${theme.cardBg} ${theme.border} ${theme.textMuted}`
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Search className="h-3.5 w-3.5" />
                    <span>Smart search...</span>
                  </span>
                  <kbd className="inline-flex items-center gap-0.5 font-mono text-[10px] opacity-75">
                    <Command className="h-2.5 w-2.5" />K
                  </kbd>
                </button>

                {/* Navigation */}
                {renderNavItems()}

                {/* Concept-Specific Sidebar Widget */}
                {concept === 'dev-command' && (
                  <button
                    type="button"
                    onClick={() => setGithubModalOpen(true)}
                    className="w-full text-left p-2.5 rounded-lg bg-[#141926] border border-[#232D44] space-y-1 hover:border-blue-500/40 transition"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-300">
                      <span className="flex items-center gap-1.5 font-mono">
                        <Github className="h-3.5 w-3.5 text-blue-400" />
                        {activeProject.github.repo}
                      </span>
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-soft" />
                    </div>
                    <p className="text-[10px] font-mono text-slate-400">
                      branch: {activeProject.github.branch} · synced {activeProject.github.lastSyncedAt}
                    </p>
                  </button>
                )}

                {concept === 'human-workspace' && (
                  <div className="p-3 rounded-2xl bg-[#FFFDF9] border border-[#E7DFD3] space-y-1">
                    <p className="text-[11px] font-semibold text-[#92400E] flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> Team Pulse
                    </p>
                    <p className="text-[11px] text-[#78716C] leading-relaxed">
                      {onlineMembers.length} teammates active right now. Take breaks between sprint blocks!
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom User Profile */}
              <div
                className={`pt-3 border-t ${theme.sidebarBorder} flex items-center justify-between gap-2`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar member={currentUser} size="sm" conceptId={concept} showPresence />
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold truncate ${theme.sidebarText}`}>
                      {currentUser.name}
                    </p>
                    <p className={`text-[10px] font-mono ${theme.sidebarMuted}`}>
                      {currentUser.role}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setNotificationsOpen(true)}
                  className={`relative p-1.5 ${theme.buttonRadius} ${
                    concept === 'enterprise-exec' || theme.isDark
                      ? 'text-slate-300 hover:bg-white/10'
                      : theme.ghostBtn
                  }`}
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-rose-500" />
                  )}
                </button>
              </div>
            </aside>
          )}

          {/* Mobile Drawer */}
          {mobileNavOpen && (
            <div
              className="fixed inset-0 z-50 flex bg-black/50"
              onClick={() => setMobileNavOpen(false)}
            >
              <div
                className={`w-72 h-full p-4 space-y-4 ${theme.sidebarBg} border-r ${theme.sidebarBorder}`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-bold ${theme.sidebarText}`}>Mavericks</span>
                  <button
                    onClick={() => setMobileNavOpen(false)}
                    className={`p-1 ${theme.sidebarMuted}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {renderWorkspaceSelector()}
                {renderNavItems(() => setMobileNavOpen(false))}
              </div>
            </div>
          )}

          {/* Main Content Column */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Top Contextual Header (Concepts 01–04 + Mobile Trigger) */}
            {(!isCreativeTopNav || isCompactViewport) && (
              <header
                className={`flex items-center justify-between gap-3 px-4 sm:px-6 py-2.5 border-b ${theme.border} ${theme.headerBg}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => setMobileNavOpen(true)}
                    className={`${isCompactViewport ? 'inline-flex' : 'md:hidden inline-flex'} p-1.5 ${
                      theme.buttonRadius
                    } ${theme.ghostBtn}`}
                    aria-label="Open menu"
                  >
                    <Menu className="h-4 w-4" />
                  </button>

                  {concept === 'enterprise-exec' && (
                    <div className="hidden sm:flex items-center gap-3 text-[11px]">
                      <span className="font-semibold text-[#0F172A]">
                        {activeWorkspace.name} Governance
                      </span>
                      <span className="text-slate-300">|</span>
                      <span className="text-slate-600">
                        Velocity: <strong className="text-[#1D4ED8]">{donePoints}/{totalPoints} pts</strong>
                      </span>
                      <span className="text-slate-300">|</span>
                      <span className="text-emerald-700 font-medium">GitHub Sync Healthy</span>
                    </div>
                  )}

                  {concept === 'dev-command' && (
                    <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
                      <span className="text-blue-400">~/acme-tech</span>
                      <span>/</span>
                      <span className="text-slate-200">{activeProject.github.repo}</span>
                      <span className="rounded bg-blue-500/15 border border-blue-500/30 px-1.5 py-0.5 text-[10px] text-blue-300">
                        {activeProject.github.branch}
                      </span>
                    </div>
                  )}

                  {(concept === 'linear-minimal' || concept === 'human-workspace') && (
                    <span className={`text-xs ${theme.textMuted} truncate`}>
                      {concept === 'human-workspace'
                        ? `Welcome back, ${currentUser.name.split(' ')[0]} · ${activeWorkspace.name}`
                        : `${activeWorkspace.name} · ${activeProject.name}`}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCommandBarOpen(true)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs ${theme.buttonRadius} ${theme.secondaryBtn}`}
                  >
                    <Search className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">⌘K</span>
                  </button>

                  <div className="hidden sm:flex items-center -space-x-1.5 px-1">
                    {onlineMembers.map((m) => (
                      <Avatar key={m.id} member={m} size="xs" conceptId={concept} showPresence />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setNotificationsOpen(true)}
                    className={`relative p-1.5 ${theme.buttonRadius} ${theme.secondaryBtn}`}
                    aria-label="Open notifications"
                  >
                    <Bell className="h-3.5 w-3.5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </div>
              </header>
            )}

            {/* Main Screen Workspace */}
            <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">{children}</main>

            {/* Mobile Bottom Navigation Bar (390px & <768px) */}
            <nav
              className={`${
                isCompactViewport ? 'flex' : 'md:hidden flex'
              } sticky bottom-0 z-30 border-t ${theme.border} ${theme.panelBg} px-2 py-1.5 justify-around`}
              aria-label="Mobile bottom navigation"
            >
              {SCREENS.map((item) => {
                const Icon = SCREEN_ICONS[item.id];
                const active = screen === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setScreen(item.id)}
                    className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-medium ${
                      theme.buttonRadius
                    } ${active ? theme.accentText : theme.textMuted}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="truncate max-w-[60px]">{item.shortLabel.split(' ')[0]}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

