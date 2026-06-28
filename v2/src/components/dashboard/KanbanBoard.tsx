import { useState } from 'react';
import { useOpportunityStore } from '../../store/opportunityStore';
import { SE_STAGES, stageLabel, formatCurrency } from '../../lib/format';
import type { DealStage } from '../../types';
import { OpportunityCard } from './OpportunityCard';

export function KanbanBoard() {
  const opportunities = useOpportunityStore((s) => s.opportunities);
  const select = useOpportunityStore((s) => s.selectOpportunity);
  const updateStage = useOpportunityStore((s) => s.updateStage);

  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<DealStage | null>(null);

  const handleDrop = (stage: DealStage) => {
    if (dragId) {
      const opp = opportunities.find((o) => o.id === dragId);
      if (opp && opp.stage !== stage) updateStage(dragId, stage);
    }
    setDragId(null);
    setOverStage(null);
  };

  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${SE_STAGES.length}, minmax(220px, 1fr))` }}>
      {SE_STAGES.map((stage) => {
        const items = opportunities.filter((o) => o.stage === stage);
        const colValue = items.reduce((s, o) => s + (o.pipelineValue || 0), 0);
        const isOver = overStage === stage;

        return (
          <div
            key={stage}
            onDragOver={(e) => {
              e.preventDefault();
              setOverStage(stage);
            }}
            onDragLeave={() => setOverStage((s) => (s === stage ? null : s))}
            onDrop={() => handleDrop(stage)}
            className="rounded-xl p-2 transition-colors"
            style={{
              background: isOver ? '#00ffff0a' : 'transparent',
              border: `1px solid ${isOver ? '#00ffff55' : '#1f1f2a'}`,
              minHeight: 200,
            }}
          >
            <div className="flex items-center justify-between px-1 py-2 mb-1 border-b border-[#1f1f2a]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#aaa]">
                {stageLabel(stage)}
              </span>
              <span className="text-[10px] text-[#555]">
                {items.length}
                {colValue > 0 && ` · ${formatCurrency(colValue)}`}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {items.map((opp) => (
                <OpportunityCard
                  key={opp.id}
                  opp={opp}
                  dragging={dragId === opp.id}
                  onClick={() => select(opp)}
                  onDragStart={() => setDragId(opp.id)}
                  onDragEnd={() => setDragId(null)}
                />
              ))}
              {items.length === 0 && (
                <div className="text-[10px] text-[#444] text-center py-4 italic">empty</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
