import { create } from 'zustand';
import type { Task } from '../types';
import * as api from '../lib/api';

interface TaskState {
  tasks: Task[];
  highlightedTaskId: string | null;
  loadTasks: () => Promise<void>;
  setTasks: (tasks: Task[]) => void;
  toggleTask: (id: string) => void;
  setHighlightedTask: (id: string | null) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  highlightedTaskId: null,
  loadTasks: async () => {
    try {
      const tasks = await api.getTasks();
      set({ tasks });
    } catch {
      /* tasks are non-critical; leave existing state */
    }
  },
  setTasks: (tasks) => set({ tasks }),
  toggleTask: (id) =>
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ),
    })),
  setHighlightedTask: (highlightedTaskId) => set({ highlightedTaskId }),
}));
