import { ConceptId, ScreenId } from '../types/mavericks';

export interface ConceptDefinition {
  id: ConceptId;
  number: string;
  name: string;
  shortName: string;
  inspiration: string;
  tagline: string;
  palettePreview: [string, string, string, string];
  isDark: boolean;
  fontClass: string;
}

export const CONCEPTS: ConceptDefinition[] = [
  {
    id: 'linear-minimal',
    number: '01',
    name: 'Linear Minimal Pro',
    shortName: 'Minimal Pro',
    inspiration: 'Linear · Raycast · Superhuman',
    tagline: 'Hairline precision, whisper-quiet light surfaces, monospace IDs',
    palettePreview: ['#FAFAFB', '#FFFFFF', '#5E6AD2', '#111827'],
    isDark: false,
    fontClass: 'font-sans',
  },
  {
    id: 'dev-command',
    number: '02',
    name: 'Dark Developer Command Center',
    shortName: 'Dev Command',
    inspiration: 'Vercel · Raycast Dark · Terminal',
    tagline: 'Midnight surfaces, electric blue & violet telemetry, code-first GitHub sync',
    palettePreview: ['#090B10', '#111520', '#3B82F6', '#8B5CF6'],
    isDark: true,
    fontClass: 'font-sans',
  },
  {
    id: 'human-workspace',
    number: '03',
    name: 'Human-Centered Collaborative Workspace',
    shortName: 'Human Workspace',
    inspiration: 'Notion · Asana · Warm Studio',
    tagline: 'Warm ivory & sand surfaces, approachable copy, friendly team presence',
    palettePreview: ['#FAF7F2', '#F2EDE4', '#D97706', '#292524'],
    isDark: false,
    fontClass: 'font-human',
  },
  {
    id: 'enterprise-exec',
    number: '04',
    name: 'Enterprise Executive Edition',
    shortName: 'Enterprise Exec',
    inspiration: 'Enterprise SaaS · Governance & BI',
    tagline: 'Authoritative navy rail, structured high-density grids, audit-ready analytics',
    palettePreview: ['#0F1E36', '#F5F7FA', '#1D4ED8', '#0F172A'],
    isDark: false,
    fontClass: 'font-sans',
  },
  {
    id: 'creative-studio',
    number: '05',
    name: 'Creative Collaboration Studio',
    shortName: 'Creative Studio',
    inspiration: 'Modern Product Studios · Figma',
    tagline: 'Gallery canvas, color-coded task stripes, tactile springs & progress rings',
    palettePreview: ['#F8F9FC', '#FFFFFF', '#E11D48', '#2563EB'],
    isDark: false,
    fontClass: 'font-human',
  },
];

export const SCREENS: Array<{ id: ScreenId; number: string; label: string; shortLabel: string }> = [
  { id: 'board', number: '01', label: 'Project Kanban Board', shortLabel: 'Kanban Board' },
  { id: 'task', number: '02', label: 'Task Details / Issue View', shortLabel: 'Task Details' },
  { id: 'sprint', number: '03', label: 'Sprint & Analytics', shortLabel: 'Sprints' },
  { id: 'timesheet', number: '04', label: 'Weekly Timesheet', shortLabel: 'Timesheet' },
  { id: 'team', number: '05', label: 'Team & Permissions', shortLabel: 'Team & RBAC' },
];

