import { useOpportunityStore } from '../../store/opportunityStore';
import { formatCurrency } from '../../lib/format';

export function StatsGrid() {
  const opps = useOpportunityStore((s) => s.opportunities);

  const pipeline = opps.reduce((sum, o) => sum + (o.pipelineValue || 0), 0);
  const tiles = [
    { label: 'Active Opportunities', value: String(opps.length), accent: '#00ffff' },
    { label: 'Pipeline Value', value: formatCurrency(pipeline), accent: '#22c55e' },
    {
      label: 'POVs in Progress',
      value: String(opps.filter((o) => o.stage === '3 POV/Validation').length),
      accent: '#a855f7',
    },
    {
      label: 'At Risk',
      value: String(opps.filter((o) => o.overallHealth === 'at-risk').length),
      accent: '#ef4444',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {tiles.map((t) => (
        <div
          key={t.label}
          className="rounded-xl border border-[#1f1f2a] p-4 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #12121a, #0e0e16)' }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{ background: `linear-gradient(90deg, ${t.accent}, transparent)` }}
          />
          <div className="text-3xl font-bold" style={{ color: t.accent }}>
            {t.value}
          </div>
          <div className="text-[11px] text-[#777] uppercase tracking-wider mt-1">
            {t.label}
          </div>
        </div>
      ))}
    </div>
  );
}
