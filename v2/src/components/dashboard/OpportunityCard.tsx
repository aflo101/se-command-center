import type { Opportunity } from '../../types';
import { formatCurrency, healthMeta } from '../../lib/format';

interface Props {
  opp: Opportunity;
  onClick: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  dragging: boolean;
}

const ENGAGEMENT_COLOR: Record<string, string> = {
  HIGH: '#22c55e',
  MEDIUM: '#eab308',
  LOW: '#ef4444',
};

export function OpportunityCard({ opp, onClick, onDragStart, onDragEnd, dragging }: Props) {
  const health = healthMeta(opp.overallHealth);

  return (
    <div
      draggable
      onClick={onClick}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="rounded-lg border border-[#1f1f2a] p-3 cursor-pointer transition-all hover:border-[#00ffff55] hover:bg-[#15151f]"
      style={{
        background: '#12121a',
        opacity: dragging ? 0.4 : 1,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-semibold text-sm text-white leading-tight">{opp.name}</span>
        <span title={health.label} className="text-xs shrink-0" style={{ filter: 'saturate(1.4)' }}>
          {health.dot}
        </span>
      </div>

      <div className="flex items-center gap-2 mt-2">
        {opp.pipelineValue > 0 && (
          <span className="text-xs font-mono text-[#22c55e]">
            {formatCurrency(opp.pipelineValue)}
          </span>
        )}
        <span
          className="text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider"
          style={{
            color: ENGAGEMENT_COLOR[opp.engagementLevel] || '#888',
            border: `1px solid ${ENGAGEMENT_COLOR[opp.engagementLevel] || '#888'}44`,
          }}
        >
          {opp.engagementLevel}
        </span>
      </div>

      {opp.nextStep && (
        <p className="text-[11px] text-[#888] mt-2 line-clamp-2 leading-snug">
          → {opp.nextStep}
        </p>
      )}

      {opp.issue && (
        <p className="text-[11px] text-[#ef4444] mt-1.5 line-clamp-2 leading-snug">
          ⚠ {opp.issue}
        </p>
      )}

      <div className="flex items-center gap-3 mt-2 text-[10px] text-[#555]">
        {opp.documents.length > 0 && <span>📄 {opp.documents.length}</span>}
        {opp.healthSignals.length > 0 && (
          <span>🚦 {opp.healthScore}%</span>
        )}
      </div>
    </div>
  );
}
