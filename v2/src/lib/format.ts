import type { DealStage, HealthStatus } from '../types';

/** SE pipeline stages, in board order. */
export const SE_STAGES: DealStage[] = [
  '0 Incoming',
  '1 Discovery',
  '2 Scoping',
  '3 POV/Validation',
  '4 Tech Win/Negotiate',
];

/** Short label for a stage (drops the leading number). */
export function stageLabel(stage: DealStage): string {
  return stage.replace(/^\d+\s/, '');
}

/** Compact currency: $1.5M, $450K, $0. */
export function formatCurrency(n: number): string {
  if (!n) return '$0';
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `$${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n}`;
}

export interface HealthMeta {
  label: string;
  color: string;
  dot: string;
}

export function healthMeta(h: HealthStatus): HealthMeta {
  switch (h) {
    case 'healthy':
      return { label: 'Healthy', color: '#22c55e', dot: '🟢' };
    case 'at-risk':
      return { label: 'At Risk', color: '#ef4444', dot: '🔴' };
    default:
      return { label: 'Attention', color: '#eab308', dot: '🟡' };
  }
}

/** Map a single signal status to a color + glyph. */
export function signalMeta(status: string): { color: string; glyph: string } {
  switch (status) {
    case 'positive':
      return { color: '#22c55e', glyph: '✅' };
    case 'negative':
      return { color: '#ef4444', glyph: '❌' };
    case 'warning':
      return { color: '#eab308', glyph: '⚠️' };
    default:
      return { color: '#666', glyph: '—' };
  }
}

export function docStatusMeta(status: string): { color: string; glyph: string } {
  switch (status) {
    case 'complete':
      return { color: '#22c55e', glyph: '✅' };
    case 'in-progress':
      return { color: '#00ffff', glyph: '📋' };
    default:
      return { color: '#eab308', glyph: '⚠️' };
  }
}

export function relativeDate(d: Date | string | undefined): string {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
