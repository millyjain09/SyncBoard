import { ConceptId, TaskPriority, TaskStatus, TaskType } from '../types/mavericks';

export interface ConceptTheme {
  id: ConceptId;
  isDark: boolean;
  // Surfaces
  appBg: string;
  sidebarBg: string;
  sidebarText: string;
  sidebarMuted: string;
  sidebarBorder: string;
  sidebarActiveItem: string;
  headerBg: string;
  cardBg: string;
  cardHover: string;
  panelBg: string;
  panelSubtle: string;
  border: string;
  borderStrong: string;
  // Typography
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  headingStyle: string;
  // Radii & Shadows
  cardRadius: string;
  buttonRadius: string;
  inputBg: string;
  shadowCard: string;
  shadowPopover: string;
  // Buttons
  primaryBtn: string;
  secondaryBtn: string;
  ghostBtn: string;
  // Badges & Accents
  accentText: string;
  accentBgSoft: string;
  tableHeaderBg: string;
  tableRowHover: string;
  // Chart palette
  chartIdeal: string;
  chartActual: string;
  chartBarPrimary: string;
  chartBarSecondary: string;
  chartGrid: string;
  chartLabel: string;
}

export const CONCEPT_THEMES: Record<ConceptId, ConceptTheme> = {
  'linear-minimal': {
    id: 'linear-minimal',
    isDark: false,
    appBg: 'bg-[#FAFAFB]',
    sidebarBg: 'bg-[#F6F7F9]',
    sidebarText: 'text-[#111827]',
    sidebarMuted: 'text-[#6B7280]',
    sidebarBorder: 'border-[#E6E8EC]',
    sidebarActiveItem: 'bg-white text-[#111827] shadow-[0_1px_2px_rgba(16,24,40,0.06)] border border-[#E6E8EC]',
    headerBg: 'bg-white/95 backdrop-blur-sm',
    cardBg: 'bg-white',
    cardHover: 'hover:border-[#CBD2DC] hover:shadow-[0_2px_8px_rgba(16,24,40,0.06)]',
    panelBg: 'bg-white',
    panelSubtle: 'bg-[#F4F5F7]',
    border: 'border-[#E6E8EC]',
    borderStrong: 'border-[#D0D5DD]',
    textPrimary: 'text-[#111827]',
    textSecondary: 'text-[#374151]',
    textMuted: 'text-[#6B7280]',
    headingStyle: 'font-semibold tracking-[-0.02em]',
    cardRadius: 'rounded-lg',
    buttonRadius: 'rounded-md',
    inputBg: 'bg-white border-[#E2E5EB] text-[#111827] placeholder-[#9CA3AF]',
    shadowCard: 'shadow-[0_1px_2px_rgba(16,24,40,0.04)]',
    shadowPopover: 'shadow-[0_12px_32px_rgba(15,23,42,0.12)]',
    primaryBtn: 'bg-[#5E6AD2] hover:bg-[#4F5BC0] text-white shadow-[0_1px_2px_rgba(94,106,210,0.3)]',
    secondaryBtn: 'bg-white hover:bg-[#F9FAFB] text-[#111827] border border-[#E2E5EB]',
    ghostBtn: 'hover:bg-[#F3F4F6] text-[#4B5563]',
    accentText: 'text-[#5E6AD2]',
    accentBgSoft: 'bg-[#EEF0FF] text-[#4C56C0]',
    tableHeaderBg: 'bg-[#F8F9FB]',
    tableRowHover: 'hover:bg-[#F9FAFC]',
    chartIdeal: '#CBD5E1',
    chartActual: '#5E6AD2',
    chartBarPrimary: '#5E6AD2',
    chartBarSecondary: '#E2E8F0',
    chartGrid: '#EEF0F4',
    chartLabel: '#6B7280',
  },
  'dev-command': {
    id: 'dev-command',
    isDark: true,
    appBg: 'bg-[#090B10]',
    sidebarBg: 'bg-[#0D1017]',
    sidebarText: 'text-[#F1F5F9]',
    sidebarMuted: 'text-[#8B95A9]',
    sidebarBorder: 'border-[#1E2433]',
    sidebarActiveItem: 'bg-[#171E2E] text-[#60A5FA] border border-[#29354D] shadow-[0_0_0_1px_rgba(59,130,246,0.15)]',
    headerBg: 'bg-[#0D1017]/90 backdrop-blur-md',
    cardBg: 'bg-[#111520]',
    cardHover: 'hover:border-[#33415C] hover:bg-[#151A28]',
    panelBg: 'bg-[#111520]',
    panelSubtle: 'bg-[#161B28]',
    border: 'border-[#1F2638]',
    borderStrong: 'border-[#2E3852]',
    textPrimary: 'text-[#F1F5F9]',
    textSecondary: 'text-[#CBD5E1]',
    textMuted: 'text-[#8B95A9]',
    headingStyle: 'font-semibold tracking-[-0.015em]',
    cardRadius: 'rounded-lg',
    buttonRadius: 'rounded-md',
    inputBg: 'bg-[#0B0E16] border-[#252E42] text-[#F1F5F9] placeholder-[#64748B]',
    shadowCard: 'shadow-[0_2px_10px_rgba(0,0,0,0.35)]',
    shadowPopover: 'shadow-[0_20px_50px_rgba(0,0,0,0.65)]',
    primaryBtn: 'bg-[#3B82F6] hover:bg-[#2563EB] text-white shadow-[0_0_16px_rgba(59,130,246,0.28)]',
    secondaryBtn: 'bg-[#171C2B] hover:bg-[#1F263A] text-[#E2E8F0] border border-[#2A334B]',
    ghostBtn: 'hover:bg-[#192030] text-[#94A3B8]',
    accentText: 'text-[#60A5FA]',
    accentBgSoft: 'bg-[#1E293B] text-[#38BDF8] border border-[#2B3B55]',
    tableHeaderBg: 'bg-[#141926]',
    tableRowHover: 'hover:bg-[#161C2C]',
    chartIdeal: '#334155',
    chartActual: '#38BDF8',
    chartBarPrimary: '#8B5CF6',
    chartBarSecondary: '#1E293B',
    chartGrid: '#1B2232',
    chartLabel: '#94A3B8',
  },
  'human-workspace': {
    id: 'human-workspace',
    isDark: false,
    appBg: 'bg-[#FAF7F2]',
    sidebarBg: 'bg-[#F3EDE3]',
    sidebarText: 'text-[#292524]',
    sidebarMuted: 'text-[#78716C]',
    sidebarBorder: 'border-[#E6DDD0]',
    sidebarActiveItem: 'bg-[#FFFDF9] text-[#B45309] shadow-sm border border-[#EADBC8]',
    headerBg: 'bg-[#FAF7F2]/95 backdrop-blur-sm',
    cardBg: 'bg-[#FFFDF9]',
    cardHover: 'hover:border-[#D6C7B2] hover:shadow-[0_6px_18px_rgba(120,90,50,0.08)]',
    panelBg: 'bg-[#FFFDF9]',
    panelSubtle: 'bg-[#F4EFE6]',
    border: 'border-[#E7DFD3]',
    borderStrong: 'border-[#D6C9B8]',
    textPrimary: 'text-[#292524]',
    textSecondary: 'text-[#44403C]',
    textMuted: 'text-[#78716C]',
    headingStyle: 'font-bold tracking-[-0.015em] font-human',
    cardRadius: 'rounded-2xl',
    buttonRadius: 'rounded-xl',
    inputBg: 'bg-[#FFFDF9] border-[#DFD5C7] text-[#292524] placeholder-[#A8A29E]',
    shadowCard: 'shadow-[0_2px_8px_rgba(120,95,65,0.06)]',
    shadowPopover: 'shadow-[0_16px_36px_rgba(80,55,30,0.14)]',
    primaryBtn: 'bg-[#C2590A] hover:bg-[#A64A06] text-white shadow-[0_2px_6px_rgba(194,89,10,0.25)]',
    secondaryBtn: 'bg-[#FFFDF9] hover:bg-[#F5EFE6] text-[#44403C] border border-[#E2D8C8]',
    ghostBtn: 'hover:bg-[#EDE5D9] text-[#57534E]',
    accentText: 'text-[#B45309]',
    accentBgSoft: 'bg-[#FEF3C7] text-[#92400E]',
    tableHeaderBg: 'bg-[#F5EFE6]',
    tableRowHover: 'hover:bg-[#FAF5EE]',
    chartIdeal: '#D6C9B8',
    chartActual: '#D97706',
    chartBarPrimary: '#D97706',
    chartBarSecondary: '#EDE4D7',
    chartGrid: '#EFE8DC',
    chartLabel: '#78716C',
  },
  'enterprise-exec': {
    id: 'enterprise-exec',
    isDark: false,
    appBg: 'bg-[#F5F7FA]',
    sidebarBg: 'bg-[#0F1E36]',
    sidebarText: 'text-[#F8FAFC]',
    sidebarMuted: 'text-[#94A3B8]',
    sidebarBorder: 'border-[#1E3354]',
    sidebarActiveItem: 'bg-[#1D3557] text-white border-l-2 border-l-[#38BDF8]',
    headerBg: 'bg-white border-b border-[#D5DDE7]',
    cardBg: 'bg-white',
    cardHover: 'hover:border-[#94A3B8] hover:shadow-sm',
    panelBg: 'bg-white',
    panelSubtle: 'bg-[#EEF2F7]',
    border: 'border-[#D5DDE7]',
    borderStrong: 'border-[#B8C4D4]',
    textPrimary: 'text-[#0F172A]',
    textSecondary: 'text-[#334155]',
    textMuted: 'text-[#64748B]',
    headingStyle: 'font-semibold tracking-[-0.01em]',
    cardRadius: 'rounded-md',
    buttonRadius: 'rounded',
    inputBg: 'bg-white border-[#CBD5E1] text-[#0F172A] placeholder-[#94A3B8]',
    shadowCard: 'shadow-[0_1px_3px_rgba(15,23,42,0.06)]',
    shadowPopover: 'shadow-[0_12px_28px_rgba(15,23,42,0.16)]',
    primaryBtn: 'bg-[#1D4ED8] hover:bg-[#1E40AF] text-white',
    secondaryBtn: 'bg-white hover:bg-[#F8FAFC] text-[#0F172A] border border-[#CBD5E1]',
    ghostBtn: 'hover:bg-[#E2E8F0]/60 text-[#334155]',
    accentText: 'text-[#1D4ED8]',
    accentBgSoft: 'bg-[#DBEAFE] text-[#1E40AF]',
    tableHeaderBg: 'bg-[#F1F5F9]',
    tableRowHover: 'hover:bg-[#F8FAFC]',
    chartIdeal: '#94A3B8',
    chartActual: '#1D4ED8',
    chartBarPrimary: '#1D4ED8',
    chartBarSecondary: '#CBD5E1',
    chartGrid: '#E2E8F0',
    chartLabel: '#475569',
  },
  'creative-studio': {
    id: 'creative-studio',
    isDark: false,
    appBg: 'bg-[#F8F9FC]',
    sidebarBg: 'bg-white',
    sidebarText: 'text-[#18181B]',
    sidebarMuted: 'text-[#71717A]',
    sidebarBorder: 'border-[#E4E7F2]',
    sidebarActiveItem: 'bg-[#18181B] text-white shadow-[0_4px_12px_rgba(24,24,27,0.18)]',
    headerBg: 'bg-white/90 backdrop-blur-md',
    cardBg: 'bg-white',
    cardHover: 'hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(37,99,235,0.09)] hover:border-[#C7D2FE]',
    panelBg: 'bg-white',
    panelSubtle: 'bg-[#F1F3FA]',
    border: 'border-[#E4E7F2]',
    borderStrong: 'border-[#CBD5E1]',
    textPrimary: 'text-[#18181B]',
    textSecondary: 'text-[#3F3F46]',
    textMuted: 'text-[#71717A]',
    headingStyle: 'font-bold tracking-[-0.02em] font-human',
    cardRadius: 'rounded-xl',
    buttonRadius: 'rounded-full',
    inputBg: 'bg-[#F4F6FB] border-[#DFE3F0] text-[#18181B] placeholder-[#71717A]',
    shadowCard: 'shadow-[0_2px_10px_rgba(24,24,27,0.04)]',
    shadowPopover: 'shadow-[0_18px_40px_rgba(24,24,27,0.14)]',
    primaryBtn: 'bg-[#E11D48] hover:bg-[#BE123C] text-white shadow-[0_4px_12px_rgba(225,29,72,0.28)]',
    secondaryBtn: 'bg-white hover:bg-[#F4F6FB] text-[#18181B] border border-[#DFE3F0]',
    ghostBtn: 'hover:bg-[#F1F3FA] text-[#3F3F46]',
    accentText: 'text-[#E11D48]',
    accentBgSoft: 'bg-[#FFE4E6] text-[#BE123C]',
    tableHeaderBg: 'bg-[#F4F6FB]',
    tableRowHover: 'hover:bg-[#F8F9FD]',
    chartIdeal: '#CBD5E1',
    chartActual: '#E11D48',
    chartBarPrimary: '#2563EB',
    chartBarSecondary: '#E2E8F0',
    chartGrid: '#ECEFF7',
    chartLabel: '#52525B',
  },
};

export function getPriorityBadgeStyle(priority: TaskPriority, isDark: boolean) {
  if (isDark) {
    switch (priority) {
      case 'URGENT':
        return 'bg-rose-500/15 text-rose-300 border border-rose-500/30';
      case 'HIGH':
        return 'bg-amber-500/15 text-amber-300 border border-amber-500/30';
      case 'MEDIUM':
        return 'bg-sky-500/15 text-sky-300 border border-sky-500/30';
      case 'LOW':
        return 'bg-slate-500/15 text-slate-300 border border-slate-500/30';
    }
  }
  switch (priority) {
    case 'URGENT':
      return 'bg-rose-50 text-rose-700 border border-rose-200';
    case 'HIGH':
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'MEDIUM':
      return 'bg-sky-50 text-sky-700 border border-sky-200';
    case 'LOW':
      return 'bg-slate-100 text-slate-600 border border-slate-200';
  }
}

export function getTypeStripeColor(type: TaskType): string {
  switch (type) {
    case 'FEATURE':
      return 'border-l-[#2563EB]';
    case 'BUG':
      return 'border-l-[#E11D48]';
    case 'TASK':
      return 'border-l-[#10B981]';
    case 'CHORE':
      return 'border-l-[#8B5CF6]';
  }
}

export function getStatusPillStyle(status: TaskStatus, isDark: boolean): string {
  if (isDark) {
    switch (status) {
      case 'BACKLOG':
        return 'bg-slate-800 text-slate-300 border border-slate-700';
      case 'TODO':
        return 'bg-blue-500/15 text-blue-300 border border-blue-500/30';
      case 'IN_PROGRESS':
        return 'bg-violet-500/15 text-violet-300 border border-violet-500/30';
      case 'TESTING':
        return 'bg-amber-500/15 text-amber-300 border border-amber-500/30';
      case 'DONE':
        return 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30';
    }
  }
  switch (status) {
    case 'BACKLOG':
      return 'bg-slate-100 text-slate-700 border border-slate-200';
    case 'TODO':
      return 'bg-blue-50 text-blue-700 border border-blue-200';
    case 'IN_PROGRESS':
      return 'bg-violet-50 text-violet-700 border border-violet-200';
    case 'TESTING':
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'DONE':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  }
}

