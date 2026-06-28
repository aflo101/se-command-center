/**
 * Data-source readiness hook.
 *
 * SQLite mode (default): pings the server /health to determine availability;
 * `readIntelligenceFiles` loads opportunities from the API.
 *
 * Filesystem mode: retained as a future option (File System Access API). Not
 * the active path in this build — see CONNECTORS.md / project.md.
 */
import { useCallback, useEffect, useState } from 'react';
import { useOpportunityStore } from '../store/opportunityStore';
import { useSettingsStore } from '../store/settingsStore';
import { useTaskStore } from '../store/taskStore';
import * as api from '../lib/api';

export function useFileSystem() {
  const dataSource = useSettingsStore((s) => s.dataSource);
  const loadOpportunities = useOpportunityStore((s) => s.loadOpportunities);
  const loadTasks = useTaskStore((s) => s.loadTasks);
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);

  // Probe the server when in SQLite mode.
  useEffect(() => {
    if (dataSource !== 'sqlite') {
      setApiAvailable(null);
      return;
    }
    let cancelled = false;
    setApiAvailable(null);
    api
      .getHealth()
      .then(() => !cancelled && setApiAvailable(true))
      .catch(() => !cancelled && setApiAvailable(false));
    return () => {
      cancelled = true;
    };
  }, [dataSource]);

  const readIntelligenceFiles = useCallback(async () => {
    if (dataSource === 'sqlite') {
      await Promise.all([loadOpportunities(), loadTasks()]);
    }
  }, [dataSource, loadOpportunities, loadTasks]);

  const isSupported =
    dataSource === 'sqlite'
      ? true
      : typeof window !== 'undefined' && 'showDirectoryPicker' in window;

  // In SQLite mode there is no directory permission to grant.
  const hasPermission = dataSource === 'sqlite';

  const isReady =
    dataSource === 'sqlite' ? apiAvailable === true : hasPermission;

  return {
    hasPermission,
    isSupported,
    readIntelligenceFiles,
    dataSource,
    apiAvailable,
    isReady,
  };
}
