import { useTaskStore } from '../../store/taskStore';

/**
 * Today's priority tasks. Hidden when there are none.
 * (Task loading is wired in Phase 3 — taskParser + useTaskActions.)
 */
export function FocusStrip() {
  // Select the stable array reference; filter in render to avoid returning a
  // new array from the selector (which would loop useSyncExternalStore).
  const tasks = useTaskStore((s) => s.tasks);
  const today = tasks.filter((t) => t.due === 'today' && !t.completed);

  if (today.length === 0) return null;

  return (
    <div className="mb-6 rounded-xl border border-[#eab30833] p-3" style={{ background: '#eab3080a' }}>
      <div className="text-[10px] uppercase tracking-[0.2em] text-[#eab308] mb-2">
        Today&apos;s Focus
      </div>
      <div className="flex flex-col gap-1">
        {today.slice(0, 5).map((t) => (
          <div key={t.id} className="text-xs text-[#ddd]">
            ◦ {t.description}
          </div>
        ))}
      </div>
    </div>
  );
}
