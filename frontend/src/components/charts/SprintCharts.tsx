import React from 'react';
import { CONCEPT_THEMES } from '../../themes/conceptTokens';
import { ConceptId, Sprint } from '../../types/mavericks';

export const BurndownChart: React.FC<{
  sprint: Sprint;
  conceptId: ConceptId;
}> = ({ sprint, conceptId }) => {
  const theme = CONCEPT_THEMES[conceptId];
  const data = sprint.burndown;
  if (!data || data.length === 0) return null;

  const width = 460;
  const height = 210;
  const padL = 34;
  const padR = 16;
  const padT = 18;
  const padB = 28;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const maxVal = Math.max(...data.map((d) => Math.max(d.ideal, d.actual ?? 0)), 36);

  const xPos = (i: number) => padL + (i / (data.length - 1)) * plotW;
  const yPos = (v: number) => padT + plotH - (v / maxVal) * plotH;

  const idealPoints = data.map((d, i) => `${xPos(i)},${yPos(d.ideal)}`).join(' ');
  const actualData = data.filter((d) => d.actual !== null);
  const actualPoints = actualData
    .map((d) => {
      const idx = data.indexOf(d);
      return `${xPos(idx)},${yPos(d.actual as number)}`;
    })
    .join(' ');

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h4 className={`text-xs font-semibold ${theme.textPrimary}`}>Sprint Burndown</h4>
          <p className={`text-[11px] ${theme.textMuted}`}>Remaining story points vs ideal pace</p>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className={`inline-flex items-center gap-1.5 ${theme.textMuted}`}>
            <span className="h-0.5 w-3.5 border-t-2 border-dashed" style={{ borderColor: theme.chartIdeal }} />
            Ideal
          </span>
          <span className={`inline-flex items-center gap-1.5 ${theme.textPrimary} font-medium`}>
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: theme.chartActual }} />
            Actual
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = padT + plotH * t;
          const label = Math.round(maxVal * (1 - t));
          return (
            <g key={t}>
              <line x1={padL} y1={y} x2={width - padR} y2={y} stroke={theme.chartGrid} strokeWidth="1" />
              <text
                x={padL - 8}
                y={y + 3}
                textAnchor="end"
                fontSize="10"
                fill={theme.chartLabel}
                className="font-mono"
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* Ideal dashed line */}
        <polyline
          fill="none"
          stroke={theme.chartIdeal}
          strokeWidth="2"
          strokeDasharray="5 4"
          points={idealPoints}
        />

        {/* Actual solid line */}
        <polyline
          fill="none"
          stroke={theme.chartActual}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={actualPoints}
        />

        {actualData.map((d) => {
          const idx = data.indexOf(d);
          const cx = xPos(idx);
          const cy = yPos(d.actual as number);
          return (
            <g key={d.day}>
              <circle
                cx={cx}
                cy={cy}
                r="4"
                fill={theme.isDark ? '#111520' : '#FFFFFF'}
                stroke={theme.chartActual}
                strokeWidth="2.2"
              />
              <title>{`${d.day}: ${d.actual} pts remaining (ideal ${d.ideal})`}</title>
            </g>
          );
        })}

        {data.map((d, i) => (
          <text
            key={d.day}
            x={xPos(i)}
            y={height - 6}
            textAnchor="middle"
            fontSize="10"
            fill={theme.chartLabel}
          >
            {d.day}
          </text>
        ))}
      </svg>
    </div>
  );
};

export const VelocityChart: React.FC<{
  sprint: Sprint;
  conceptId: ConceptId;
}> = ({ sprint, conceptId }) => {
  const theme = CONCEPT_THEMES[conceptId];
  const data = sprint.velocityHistory;
  if (!data || data.length === 0) return null;

  const width = 460;
  const height = 210;
  const padL = 34;
  const padR = 16;
  const padT = 18;
  const padB = 28;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const maxVal = Math.max(...data.map((d) => Math.max(d.committed, d.completed)), 40);

  const slotW = plotW / data.length;
  const barW = Math.min(20, slotW * 0.28);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h4 className={`text-xs font-semibold ${theme.textPrimary}`}>Team Velocity</h4>
          <p className={`text-[11px] ${theme.textMuted}`}>Committed vs delivered points across sprints</p>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className={`inline-flex items-center gap-1.5 ${theme.textMuted}`}>
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: theme.chartBarSecondary }} />
            Committed
          </span>
          <span className={`inline-flex items-center gap-1.5 ${theme.textPrimary} font-medium`}>
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: theme.chartBarPrimary }} />
            Completed
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = padT + plotH * t;
          const label = Math.round(maxVal * (1 - t));
          return (
            <g key={t}>
              <line x1={padL} y1={y} x2={width - padR} y2={y} stroke={theme.chartGrid} strokeWidth="1" />
              <text
                x={padL - 8}
                y={y + 3}
                textAnchor="end"
                fontSize="10"
                fill={theme.chartLabel}
                className="font-mono"
              >
                {label}
              </text>
            </g>
          );
        })}

        {data.map((d, i) => {
          const cx = padL + i * slotW + slotW / 2;
          const hCommitted = (d.committed / maxVal) * plotH;
          const hCompleted = (d.completed / maxVal) * plotH;
          const radius = conceptId === 'enterprise-exec' ? 2 : 4;
          return (
            <g key={d.sprintName}>
              <rect
                x={cx - barW - 2}
                y={padT + plotH - hCommitted}
                width={barW}
                height={hCommitted}
                rx={radius}
                fill={theme.chartBarSecondary}
              >
                <title>{`${d.sprintName} Committed: ${d.committed} pts`}</title>
              </rect>
              <rect
                x={cx + 2}
                y={padT + plotH - hCompleted}
                width={barW}
                height={hCompleted}
                rx={radius}
                fill={theme.chartBarPrimary}
              >
                <title>{`${d.sprintName} Completed: ${d.completed} pts`}</title>
              </rect>
              <text
                x={cx}
                y={height - 6}
                textAnchor="middle"
                fontSize="10"
                fill={theme.chartLabel}
              >
                {d.sprintName.replace(' (Live)', '*')}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

