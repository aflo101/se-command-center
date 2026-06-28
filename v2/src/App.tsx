import { useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { StatsGrid } from './components/dashboard/StatsGrid';
import { FocusStrip } from './components/dashboard/FocusStrip';
import { KanbanBoard } from './components/dashboard/KanbanBoard';
import { OpportunityPanel } from './components/opportunity/OpportunityPanel';
import { TasksView } from './components/tasks/TasksView';
import { useFileSystem } from './hooks/useFileSystem';
import { useOpportunityStore } from './store/opportunityStore';
import { useSettingsStore } from './store/settingsStore';

function App() {
  const { hasPermission, isSupported, readIntelligenceFiles, dataSource, apiAvailable, isReady } = useFileSystem();
  const { opportunities, isLoading, error } = useOpportunityStore();
  const currentView = useSettingsStore((state) => state.currentView);

  // Auto-load when ready (SQLite: API available, Filesystem: permission granted)
  useEffect(() => {
    if (isReady) {
      readIntelligenceFiles();
    }
  }, [isReady, readIntelligenceFiles]);

  const renderMainContent = () => {
    // Browser Support Warning (only for filesystem mode)
    if (dataSource === 'filesystem' && !isSupported) {
      return (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-red-400 mb-1">Browser Not Supported</h3>
          <p className="text-sm text-slate-300">
            SE Command Center requires the File System Access API. Please use Google Chrome or Microsoft Edge.
          </p>
        </div>
      );
    }

    // Error Display
    if (error) {
      return (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-red-400 mb-1">Error</h3>
          <p className="text-sm text-slate-300">{error}</p>
        </div>
      );
    }

    // SQLite mode: waiting for API
    if (dataSource === 'sqlite' && apiAvailable === null) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-4">⚡</div>
            <p className="text-[#666] text-sm uppercase tracking-wider">Connecting to server...</p>
          </div>
        </div>
      );
    }

    // SQLite mode: API not available
    if (dataSource === 'sqlite' && apiAvailable === false) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <div className="text-6xl mb-4">🔌</div>
          <h2 className="text-2xl font-semibold mb-2 gradient-text-cyan">Server Offline</h2>
          <p className="text-[#666] mb-6 max-w-md">
            The SE Command server is not running. Start it with:
          </p>
          <code className="bg-[#12121a] border border-[#333] px-4 py-2 rounded font-mono text-sm mb-4 text-[#00ffff]">
            cd ~/Desktop/work/se-command/v2 && npm run dev
          </code>
          <p className="text-sm text-[#444]">
            Or switch to filesystem mode in settings.
          </p>
        </div>
      );
    }

    // Filesystem mode: Welcome State
    if (dataSource === 'filesystem' && !hasPermission) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <div className="text-6xl mb-4">📁</div>
          <h2 className="text-2xl font-semibold mb-2 gradient-text-cyan">Welcome</h2>
          <p className="text-[#666] mb-6 max-w-md">
            Select your clients directory to load opportunity intelligence files.
          </p>
          <p className="text-sm text-[#444]">
            Click "Select Directory" in the header to begin.
          </p>
        </div>
      );
    }

    // Loading State (only show for dashboard, tasks load independently)
    if (isLoading && currentView === 'dashboard') {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-4">⚡</div>
            <p className="text-[#666] text-sm uppercase tracking-wider">Loading intel...</p>
          </div>
        </div>
      );
    }

    // Empty State (only for dashboard view)
    if (opportunities.length === 0 && currentView === 'dashboard') {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-semibold mb-2 gradient-text-cyan">No Intel Found</h2>
          <p className="text-[#666] max-w-md">
            No intelligence.md files found. Create one using the /intel skill.
          </p>
        </div>
      );
    }

    // Render based on currentView
    switch (currentView) {
      case 'tasks':
        return <TasksView />;
      case 'dashboard':
      default:
        return (
          <>
            <FocusStrip />
            <StatsGrid />
            <KanbanBoard />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen text-white relative" style={{ background: '#0a0a12' }}>
      {/* Grid background */}
      <div className="grid-bg" />

      <Header />

      <div className="flex h-[calc(100vh-73px)] relative z-10">
        <Sidebar />

        <main className="flex-1 p-6 overflow-y-auto">
          {renderMainContent()}
        </main>

        <OpportunityPanel />
      </div>
    </div>
  );
}

export default App;
