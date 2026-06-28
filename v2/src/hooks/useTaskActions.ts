/**
 * Task toggle with optimistic update + server persistence.
 * (In SQLite mode this PATCHes /api/tasks/:id; the original filesystem mode
 *  wrote back to tasks.md — a future filesystem-mode concern.)
 */
import { useCallback } from 'react';
import { useTaskStore } from '../store/taskStore';
import * as api from '../lib/api';

export function useTaskActions() {
  const toggleLocal = useTaskStore((s) => s.toggleTask);
  const tasks = useTaskStore((s) => s.tasks);

  const toggle = useCallback(
    async (id: string) => {
      const current = tasks.find((t) => t.id === id);
      const next = !current?.completed;
      toggleLocal(id); // optimistic
      try {
        await api.setTaskCompleted(id, next);
      } catch {
        toggleLocal(id); // revert on failure
      }
    },
    [tasks, toggleLocal]
  );

  return { toggle };
}
