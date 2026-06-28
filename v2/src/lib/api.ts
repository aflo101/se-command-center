/**
 * Server API client. In dev we talk to the Express server cross-origin
 * (CORS is enabled server-side); in a same-origin production build set
 * VITE_API_BASE to '' or the server URL.
 */
import type { Opportunity, Task } from '../types';

const API_BASE =
  import.meta.env.VITE_API_BASE ??
  (import.meta.env.DEV ? 'http://localhost:3001' : '');

async function req<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(API_BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) {
    let detail = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (body?.message) detail = body.message;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  return res.json() as Promise<T>;
}

function reviveOpportunity(o: any): Opportunity {
  return {
    ...o,
    lastUpdated: o.lastUpdated ? new Date(o.lastUpdated) : new Date(),
    lastValidated: o.lastValidated ? new Date(o.lastValidated) : undefined,
  };
}

export interface DashboardStats {
  activeOpportunities: number;
  totalPipeline: number;
  povsInProgress: number;
  atRisk: number;
}

export const getHealth = () => req<{ status: string; version: string }>('/health');

export const getOpportunities = async (): Promise<Opportunity[]> => {
  const data = await req<any[]>('/api/opportunities');
  return data.map(reviveOpportunity);
};

export const getOpportunity = async (id: string): Promise<Opportunity> =>
  reviveOpportunity(await req<any>(`/api/opportunities/${id}`));

export const getStats = () => req<DashboardStats>('/api/stats');

export const patchOpportunity = (id: string, body: Record<string, unknown>) =>
  req<Opportunity>(`/api/opportunities/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });

export const getOpportunityTasks = (id: string) =>
  req<Task[]>(`/api/opportunities/${id}/tasks`);

export const getTasks = () => req<Task[]>('/api/tasks');

export const setTaskCompleted = (id: string, completed: boolean) =>
  req<Task>(`/api/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ completed }),
  });

/**
 * Fire a connector/quick-action endpoint and return a human-readable result
 * message (connectors reply 503 with an explanatory message in this build).
 */
export async function callConnector(path: string, body?: unknown): Promise<string> {
  try {
    const res = await fetch(API_BASE + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    return data?.message || (res.ok ? 'Done' : `Request failed (${res.status})`);
  } catch (e) {
    return e instanceof Error ? e.message : 'Request failed';
  }
}
