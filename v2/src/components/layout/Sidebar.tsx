import { useSettingsStore } from '../../store/settingsStore';
import { useTaskStore } from '../../store/taskStore';
import type { AppView } from '../../types';

interface NavItem {
  key: AppView;
  label: string;
  icon: string;
}

const ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: '◧' },
  { key: 'tasks', label: 'Tasks', icon: '✓' },
];

export function Sidebar() {
  const currentView = useSettingsStore((s) => s.currentView);
  const setCurrentView = useSettingsStore((s) => s.setCurrentView);
  const collapsed = useSettingsStore((s) => s.sidebarCollapsed);
  const toggle = useSettingsStore((s) => s.toggleSidebar);
  const pending = useTaskStore((s) => s.tasks.filter((t) => !t.completed).length);

  return (
    <nav
      className={`${collapsed ? 'w-16' : 'w-52'} shrink-0 border-r border-[#1f1f2a] p-3 flex flex-col gap-1 transition-all`}
      style={{ background: 'rgba(18,18,26,0.4)' }}
    >
      {ITEMS.map((item) => {
        const active = currentView === item.key;
        return (
          <button
            key={item.key}
            onClick={() => setCurrentView(item.key)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
              active
                ? 'text-white bg-[#00ffff10] border border-[#00ffff40]'
                : 'text-[#888] border border-transparent hover:text-white hover:bg-[#ffffff08]'
            }`}
          >
            <span className="text-base w-5 text-center" style={{ color: active ? '#00ffff' : undefined }}>
              {item.icon}
            </span>
            {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
            {!collapsed && item.key === 'tasks' && pending > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#eab30822] text-[#eab308] border border-[#eab30855]">
                {pending}
              </span>
            )}
          </button>
        );
      })}

      <button
        onClick={toggle}
        className="mt-auto text-[#555] hover:text-[#00ffff] text-xs px-3 py-2 transition-colors text-left"
      >
        {collapsed ? '»' : '« Collapse'}
      </button>
    </nav>
  );
}
