import { create } from 'zustand';
import type { AppView } from '../types';

type DataSource = 'sqlite' | 'filesystem';

interface SettingsState {
  currentView: AppView;
  sidebarCollapsed: boolean;
  viewMode: 'kanban' | 'table';
  dataSource: DataSource;

  setCurrentView: (view: AppView) => void;
  toggleSidebar: () => void;
  setViewMode: (mode: 'kanban' | 'table') => void;
  setDataSource: (source: DataSource) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  currentView: 'dashboard',
  sidebarCollapsed: false,
  viewMode: 'kanban',
  dataSource: 'sqlite',

  setCurrentView: (currentView) => set({ currentView }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setViewMode: (viewMode) => set({ viewMode }),
  setDataSource: (dataSource) => set({ dataSource }),
}));
