import { useState, type ReactNode } from 'react';
import { useOpportunityStore } from '../../store/opportunityStore';
import {
  formatCurrency,
  healthMeta,
  signalMeta,
  docStatusMeta,
  relativeDate,
  stageLabel,
} from '../../lib/format';
import { callConnector } from '../../lib/api';
import { SFDC_BASE_URL } from '../../lib/branding';

const NDA_LABEL: Record<string, string> = {
  signed: '✅ Signed',
  pending: '⚠️ Pending',
  'not-addressed': '— Not addressed',
};

export function OpportunityPanel() {
  const opp = useOpportunityStore((s) => s.selectedOpportunity);
  const select = useOpportunityStore((s) => s.selectOpportunity);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!opp) return null;

  const health = healthMeta(opp.overallHealth);

  const runAction = async (label: string, path: string, body?: unknown) => {
    setBusy(true);
    setActionMsg(`${label}…`);
    const msg = await callConnector(path, body);
    setActionMsg(msg);
    setBusy(false);
  };

  return (
    <aside
      className="w-[380px] shrink-0 border-l border-[#1f1f2a] overflow-y-auto"
      style={{ background: 'rgba(14,14,22,0.96)' }}
    >
      {/* Header */}
      <div className="p-4 border-b border-[#1f1f2a] sticky top-0 z-10" style={{ background: 'rgba(14,14,22,0.98)' }}>
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-xl font-bold text-white leading-tight">{opp.name}</h2>
          <button
            onClick={() => select(null)}
            className="text-[#666] hover:text-white text-lg leading-none"
          >
            ×
          </button>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[10px] px-2 py-0.5 rounded uppercase tracking-wider border border-[#00ffff44] text-[#00ffff]">
            {stageLabel(opp.stage)}
          </span>
          {opp.pipelineValue > 0 && (
            <span className="text-sm font-mono text-[#22c55e]">
              {formatCurrency(opp.pipelineValue)}
            </span>
          )}
          <span className="ml-auto text-xs" style={{ color: health.color }}>
            {health.dot} {health.label} · {opp.healthScore}%
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-[#1f1f2a]">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: '🧠 Hydrate', path: '/hydrate', body: { client: opp.name, source: 'notion' } },
            { label: '☁️ Sync SF', path: '/full-hydration' },
            { label: '📅 Meeting', path: '/zoom/test' },
          ].map((a) => (
            <button
              key={a.label}
              disabled={busy}
              onClick={() => runAction(a.label, a.path, (a as any).body)}
              className="text-[11px] px-2 py-2 rounded-md border border-[#2a2a38] text-[#bbb] hover:border-[#00ffff] hover:text-white transition-colors disabled:opacity-50"
            >
              {a.label}
            </button>
          ))}
        </div>
        {actionMsg && (
          <p className="text-[11px] text-[#888] mt-2 leading-snug border-l-2 border-[#eab308] pl-2">
            {actionMsg}
          </p>
        )}
      </div>

      {/* Status */}
      <Section title="Status">
        <Field label="NDA" value={NDA_LABEL[opp.nda] || opp.nda} />
        <Field label="Engagement" value={opp.engagementLevel} />
        <Field label="Est. Close" value={opp.estimatedClose || '—'} />
        <Field label="Next Step" value={opp.nextStep || '—'} block />
        {opp.issue && <Field label="Issue" value={opp.issue} block danger />}
        <Field label="Last Updated" value={relativeDate(opp.lastUpdated)} />
      </Section>

      {/* Quick Links */}
      {(opp.sfdcOppId || opp.slackChannel) && (
        <Section title="Links">
          <div className="flex gap-2">
            {opp.sfdcOppId && (
              <a
                href={`${SFDC_BASE_URL}/${opp.sfdcOppId}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs px-3 py-1.5 rounded border border-[#2a2a38] text-[#bbb] hover:border-[#00ffff] hover:text-white"
              >
                ☁️ CRM
              </a>
            )}
            {opp.slackChannel && (
              <a
                href={`slack://channel?id=${opp.slackChannel}`}
                className="text-xs px-3 py-1.5 rounded border border-[#2a2a38] text-[#bbb] hover:border-[#00ffff] hover:text-white"
              >
                💬 Slack
              </a>
            )}
          </div>
        </Section>
      )}

      {/* Deal Health */}
      {opp.healthSignals.length > 0 && (
        <Section title="Deal Health">
          {opp.healthSignals.map((sig) => {
            const m = signalMeta(sig.status);
            return (
              <div key={sig.name} className="flex items-start gap-2 py-1" title={sig.notes || ''}>
                <span className="text-xs mt-0.5">{m.glyph}</span>
                <div className="flex-1">
                  <div className="text-xs text-[#ddd]">{sig.name}</div>
                  {sig.notes && <div className="text-[10px] text-[#777] leading-snug">{sig.notes}</div>}
                </div>
              </div>
            );
          })}
        </Section>
      )}

      {/* Depth Signals */}
      {opp.depthSignals.length > 0 && (
        <Section title="Depth Signals">
          {opp.depthSignals.map((sig) => (
            <div key={sig.name} className="flex items-center justify-between py-1">
              <span className="text-xs text-[#ddd]">{sig.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded border border-[#2a2a38] text-[#aaa]">
                {sig.value}
              </span>
            </div>
          ))}
        </Section>
      )}

      {/* Documents */}
      {opp.documents.length > 0 && (
        <Section title="Documents">
          {opp.documents.map((doc) => {
            const m = docStatusMeta(doc.status);
            return (
              <div key={doc.name} className="flex items-center gap-2 py-1">
                <span className="text-xs">{m.glyph}</span>
                <span className="text-xs text-[#ddd] flex-1">{doc.name}</span>
                <span className="text-[10px] uppercase tracking-wider" style={{ color: m.color }}>
                  {doc.status}
                </span>
              </div>
            );
          })}
        </Section>
      )}

      {/* Recent Progress */}
      {opp.recentProgress.length > 0 && (
        <Section title="Recent Progress">
          {opp.recentProgress.map((p, i) => (
            <div key={i} className="flex items-start gap-2 py-1">
              <span className="text-xs mt-0.5">
                {p.type === 'completed' ? '✅' : p.type === 'warning' ? '⚠️' : '📋'}
              </span>
              <span className="text-[11px] text-[#aaa] leading-snug">{p.text}</span>
            </div>
          ))}
        </Section>
      )}
    </aside>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="p-4 border-b border-[#1f1f2a]">
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#555] mb-2">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  block,
  danger,
}: {
  label: string;
  value: string;
  block?: boolean;
  danger?: boolean;
}) {
  if (block) {
    return (
      <div className="py-1">
        <div className="text-[10px] text-[#666] uppercase tracking-wider">{label}</div>
        <div className={`text-xs leading-snug ${danger ? 'text-[#ef4444]' : 'text-[#ddd]'}`}>
          {value}
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[10px] text-[#666] uppercase tracking-wider">{label}</span>
      <span className="text-xs text-[#ddd]">{value}</span>
    </div>
  );
}
