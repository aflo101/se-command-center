import { useOpportunityStore } from '../../store/opportunityStore';
import { useSettingsStore } from '../../store/settingsStore';

export function Header() {
  const load = useOpportunityStore((s) => s.loadOpportunities);
  const isLoading = useOpportunityStore((s) => s.isLoading);
  const dataSource = useSettingsStore((s) => s.dataSource);
  const setDataSource = useSettingsStore((s) => s.setDataSource);

  return (
    <header
      className="flex items-center justify-between px-6 border-b border-[#1f1f2a] relative z-20"
      style={{ height: 73, background: 'rgba(10,10,18,0.85)', backdropFilter: 'blur(8px)' }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-lg neon-glow-cyan"
          style={{ background: 'linear-gradient(135deg, rgba(0,255,255,0.15), rgba(168,85,247,0.15))' }}
        >
          ⚡
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-[0.25em] gradient-text-cyan leading-none">
            SE COMMAND
          </h1>
          <p className="text-[10px] text-[#555] uppercase tracking-[0.2em] mt-1">
            Opportunity Command Center
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setDataSource(dataSource === 'sqlite' ? 'filesystem' : 'sqlite')}
          title="Toggle data source"
          className="text-xs px-3 py-1.5 rounded-md border border-[#2a2a38] text-[#aaa] hover:border-[#00ffff] hover:text-white transition-colors"
        >
          {dataSource === 'sqlite' ? '🟢 SQLite' : '🔵 Files'}
        </button>
        <button
          onClick={() => load()}
          disabled={isLoading}
          className="text-xs px-3 py-1.5 rounded-md border border-[#2a2a38] text-[#aaa] hover:border-[#00ffff] hover:text-white transition-colors disabled:opacity-50"
        >
          <span className={isLoading ? 'inline-block animate-spin' : ''}>⟳</span> Refresh
        </button>
      </div>
    </header>
  );
}
