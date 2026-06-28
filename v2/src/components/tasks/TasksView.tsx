import { useTaskStore } from '../../store/taskStore';
import { useTaskActions } from '../../hooks/useTaskActions';
import { useOpportunityStore } from '../../store/opportunityStore';
import { useSettingsStore } from '../../store/settingsStore';
import type { Task } from '../../types';

const COLUMNS: { key: string; label: string; accent: string }[] = [
  { key: 'today', label: 'Today', accent: '#eab308' },
  { key: 'this-week', label: 'This Week', accent: '#00ffff' },
  { key: 'backlog', label: 'Backlog', accent: '#a855f7' },
  { key: 'completed', label: 'Completed', accent: '#22c55e' },
];

const TYPE_GLYPH: Record<string, string> = {
  'follow-up': '↩',
  deliverable: '📦',
  internal: '🏢',
  research: '🔍',
};

export function TasksView() {
  const tasks = useTaskStore((s) => s.tasks);
  const { toggle } = useTaskActions();
  const opportunities = useOpportunityStore((s) => s.opportunities);
  const select = useOpportunityStore((s) => s.selectOpportunity);
  const setView = useSettingsStore((s) => s.setCurrentView);

  const colTasks = (key: string): Task[] =>
    key === 'completed'
      ? tasks.filter((t) => t.completed)
      : tasks.filter((t) => t.due === key && !t.completed);

  const openOpp = (clientId: string) => {
    const opp = opportunities.find(
      (o) => o.id === clientId || o.name.toLowerCase() === clientId.toLowerCase()
    );
    if (opp) {
      select(opp);
      setView('dashboard');
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold gradient-text-cyan mb-4 tracking-wider">TASKS</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const items = colTasks(col.key);
          return (
            <div key={col.key} className="rounded-xl border border-[#1f1f2a] p-2" style={{ minHeight: 200 }}>
              <div className="flex items-center justify-between px-1 py-2 mb-1 border-b border-[#1f1f2a]">
                <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: col.accent }}>
                  {col.label}
                </span>
                <span className="text-[10px] text-[#555]">{items.length}</span>
              </div>
              <div className="flex flex-col gap-2">
                {items.map((t) => (
                  <div key={t.id} className="rounded-lg border border-[#1f1f2a] p-2.5" style={{ background: '#12121a' }}>
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={t.completed}
                        onChange={() => toggle(t.id)}
                        className="mt-0.5 accent-[#00ffff] cursor-pointer"
                      />
                      <span className={`text-xs leading-snug ${t.completed ? 'line-through text-[#555]' : 'text-[#ddd]'}`}>
                        {t.description}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 pl-6 text-[10px] text-[#666]">
                      <span title={t.type}>{TYPE_GLYPH[t.type] || '•'}</span>
                      {t.opportunity && (
                        <button
                          onClick={() => openOpp(t.opportunity)}
                          className="hover:text-[#00ffff] transition-colors"
                        >
                          {t.opportunity}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="text-[10px] text-[#444] text-center py-4 italic">empty</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
