import { create } from 'zustand';
import type { Opportunity, DealStage } from '../types';
import * as api from '../lib/api';

interface OpportunityState {
  opportunities: Opportunity[];
  selectedOpportunity: Opportunity | null;
  isLoading: boolean;
  error: string | null;

  loadOpportunities: () => Promise<void>;
  selectOpportunity: (opp: Opportunity | null) => void;
  updateStage: (id: string, stage: DealStage) => Promise<void>;
}

export const useOpportunityStore = create<OpportunityState>((set, get) => ({
  opportunities: [],
  selectedOpportunity: null,
  isLoading: false,
  error: null,

  loadOpportunities: async () => {
    set({ isLoading: true, error: null });
    try {
      const opportunities = await api.getOpportunities();
      set({ opportunities, isLoading: false });
      // Keep the open panel in sync with refreshed data.
      const sel = get().selectedOpportunity;
      if (sel) {
        const updated = opportunities.find((o) => o.id === sel.id) || null;
        set({ selectedOpportunity: updated });
      }
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : 'Failed to load opportunities',
        isLoading: false,
      });
    }
  },

  selectOpportunity: (opp) => set({ selectedOpportunity: opp }),

  updateStage: async (id, stage) => {
    // Optimistic update.
    set((s) => ({
      opportunities: s.opportunities.map((o) =>
        o.id === id ? { ...o, stage } : o
      ),
      selectedOpportunity:
        s.selectedOpportunity?.id === id
          ? { ...s.selectedOpportunity, stage }
          : s.selectedOpportunity,
    }));
    try {
      await api.patchOpportunity(id, { stage });
    } catch {
      // Roll back by reloading authoritative data.
      await get().loadOpportunities();
    }
  },
}));
