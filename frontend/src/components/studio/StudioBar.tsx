import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Laptop,
  Monitor,
  Shield,
  Smartphone,
  Sparkles,
  Tablet,
  WifiOff,
} from 'lucide-react';
import { useMavericks } from '../../state/MavericksContext';
import { CONCEPTS, SCREENS } from '../../themes/concepts';
import { Role, SystemStateMode, ViewportPreset } from '../../types/mavericks';

export const StudioBar: React.FC = () => {
  const {
    concept,
    setConcept,
    screen,
    setScreen,
    viewport,
    setViewport,
    activeRole,
    setActiveRole,
    systemState,
    setSystemState,
  } = useMavericks();

  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <div className="fixed bottom-3 right-3 z-50">
        <button
          onClick={() => setCollapsed(false)}
          className="flex items-center gap-2 rounded-full bg-slate-900 px-3.5 py-2 text-xs font-medium text-white shadow-xl ring-1 ring-white/15 hover:bg-slate-800 transition"
        >
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          <span>Design Studio ({CONCEPTS.find((c) => c.id === concept)?.number})</span>
          <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
        </button>
      </div>
    );
  }

  return (
    <div
      className="sticky top-0 z-40 border-b border-slate-800 bg-[#0B0F19] text-slate-200 px-3 py-1.5 shadow-md"
      style={{ backgroundColor: '#0B0F19', color: '#E2E8F0' }}
    >
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-2">
        {/* Brand & Concept Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex items-center gap-1.5 pr-2 border-r border-slate-800">
            <span
              className="inline-flex h-5 w-5 items-center justify-center rounded bg-indigo-500 text-[10px] font-bold text-white"
              style={{ backgroundColor: '#6366F1', color: '#FFFFFF' }}
            >
              M
            </span>
            <span className="text-xs font-semibold tracking-tight text-white">
              Mavericks Studio
            </span>
            <span className="hidden 2xl:inline rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">
              5 Concepts × 5 Screens
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1" role="tablist" aria-label="Design concepts">
            {CONCEPTS.map((c) => {
              const active = concept === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setConcept(c.id)}
                  title={`${c.name} (${c.inspiration})`}
                  style={
                    active
                      ? { backgroundColor: '#4F46E5', color: '#FFFFFF', borderColor: '#6366F1' }
                      : { backgroundColor: '#131926', color: '#CBD5E1', borderColor: '#263044' }
                  }
                  className={`group flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium border transition ${
                    active
                      ? 'bg-indigo-600 text-white shadow-sm border-indigo-500'
                      : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 hover:text-white border-slate-800'
                  }`}
                >
                  <span className="font-mono text-[10px] opacity-75">{c.number}</span>
                  <span>{c.shortName}</span>
                  <span className="hidden sm:flex items-center gap-0.5 ml-0.5">
                    {c.palettePreview.slice(0, 3).map((hex, i) => (
                      <span
                        key={i}
                        className="h-2 w-2 rounded-full border border-white/20"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Controls: Screen Quick Switch, Viewport, Role, System State */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Screen Switcher */}
          <div className="hidden lg:flex items-center gap-0.5 rounded-md bg-slate-900 p-0.5 border border-slate-800">
            {SCREENS.map((s) => (
              <button
                key={s.id}
                onClick={() => setScreen(s.id)}
                className={`rounded px-2 py-1 text-[11px] font-medium transition ${
                  screen === s.id
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s.shortLabel}
              </button>
            ))}
          </div>

          {/* Viewport Switcher */}
          <div className="hidden md:flex items-center gap-0.5 rounded-md bg-slate-900 p-0.5 border border-slate-800">
            {(
              [
                { id: 'fluid', label: 'Full', icon: null },
                { id: '1440', label: '1440', icon: Monitor },
                { id: '1280', label: '1280', icon: Laptop },
                { id: '768', label: '768', icon: Tablet },
                { id: '390', label: '390', icon: Smartphone },
              ] as Array<{ id: ViewportPreset; label: string; icon: React.ComponentType<{ className?: string }> | null }>
            ).map((vp) => {
              const Icon = vp.icon;
              return (
                <button
                  key={vp.id}
                  onClick={() => setViewport(vp.id)}
                  title={`Preview ${vp.label} viewport`}
                  className={`flex items-center gap-1 rounded px-1.5 py-1 text-[10px] font-medium transition ${
                    viewport === vp.id
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {Icon && <Icon className="h-3 w-3" />}
                  <span>{vp.label}</span>
                </button>
              );
            })}
          </div>

          {/* Role Preview Selector */}
          <label className="flex items-center gap-1 rounded-md bg-slate-900 px-2 py-1 border border-slate-800 text-[11px]">
            <Shield className="h-3 w-3 text-emerald-400" />
            <span className="text-slate-400 hidden sm:inline">Role:</span>
            <select
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value as Role)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
              aria-label="Preview role permissions"
            >
              <option value="OWNER" className="bg-slate-900">OWNER</option>
              <option value="ADMIN" className="bg-slate-900">ADMIN</option>
              <option value="MEMBER" className="bg-slate-900">MEMBER</option>
              <option value="GUEST" className="bg-slate-900">GUEST</option>
            </select>
          </label>

          {/* System State Simulator */}
          <label className="flex items-center gap-1 rounded-md bg-slate-900 px-2 py-1 border border-slate-800 text-[11px]">
            {systemState === 'offline' && <WifiOff className="h-3 w-3 text-amber-400" />}
            <span className="text-slate-400 hidden sm:inline">State:</span>
            <select
              value={systemState}
              onChange={(e) => setSystemState(e.target.value as SystemStateMode)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
              aria-label="System feedback state"
            >
              <option value="normal" className="bg-slate-900">Live</option>
              <option value="loading" className="bg-slate-900">Loading / Skeleton</option>
              <option value="offline" className="bg-slate-900">Offline / Reconnect</option>
              <option value="empty" className="bg-slate-900">Empty State</option>
            </select>
          </label>

          <button
            onClick={() => setCollapsed(true)}
            title="Minimize Studio Bar"
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

