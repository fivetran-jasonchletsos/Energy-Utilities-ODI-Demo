import { useEffect, useState } from 'react';
import { fetchSnapshot, formatNumber } from '../api/queries';

type Connector = {
  name: string; mechanism: string; source: string; destination: string;
  tables: number; rows_24h: number; status: string; last_sync: string; lag_minutes: number;
};
type Layer = { layer: string; description: string; tables: number; rows: number; storage_tb: number; freshness_min: number };
type Incident = { time: string; connector: string; severity: string; description: string; resolved: boolean };
type Scenario = { name: string; expected_alert: string; downstream: string };
type Pipeline = {
  connectors: Connector[];
  layers: Layer[];
  incidents_24h: Incident[];
  failure_simulator: { description: string; scenarios: Scenario[] };
};
type IcebergTable = { database: string; table: string; rows: number; size_gb: number; format: string; last_updated: string };

export default function PipelinePage() {
  const [p, setP] = useState<Pipeline | null>(null);
  const [tables, setTables] = useState<IcebergTable[]>([]);
  const [simRunning, setSimRunning] = useState<string | null>(null);

  useEffect(() => {
    fetchSnapshot<Pipeline>('pipeline.json').then(setP).catch(() => {});
    fetchSnapshot<{ tables: IcebergTable[] }>('iceberg.json').then((d) => setTables(d.tables)).catch(() => {});
  }, []);

  const runScenario = (name: string) => {
    setSimRunning(name);
    setTimeout(() => setSimRunning(null), 2400);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <div className="eyebrow mb-1">Data Pipeline</div>
        <h1 className="text-3xl font-semibold tracking-tight">Connector health, dbt layers, and Iceberg lineage</h1>
        <p className="mt-3 text-[var(--ink-muted)] max-w-3xl">
          Seven Fivetran connectors bring OT and IT data into the Helios lake. dbt transforms it across four
          layers. Snowflake, Athena, and the outage agent all read the same gold and platinum tables.
        </p>
      </header>

      <section className="ops-card mb-8 overflow-hidden">
        <div className="ops-card-header">
          <div className="eyebrow">Connectors</div>
          <div className="text-sm font-semibold">Fivetran-managed ingestion</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--paper-deep)] text-[var(--ink-muted)]">
              <tr>
                <Th>Connector</Th><Th>Source</Th><Th>Mechanism</Th><Th>Destination</Th>
                <Th align="right">Tables</Th><Th align="right">Rows 24h</Th><Th align="right">Lag</Th><Th>Status</Th><Th>Last sync</Th>
              </tr>
            </thead>
            <tbody>
              {(p?.connectors ?? []).map((c) => (
                <tr key={c.name} className="border-t border-[var(--hairline-soft)]">
                  <Td><span className="font-semibold">{c.name}</span></Td>
                  <Td className="mono text-xs">{c.source}</Td>
                  <Td><span className="layer-chip cyan">{c.mechanism}</span></Td>
                  <Td className="mono text-xs">{c.destination}</Td>
                  <Td align="right" className="mono">{c.tables}</Td>
                  <Td align="right" className="mono">{formatNumber(c.rows_24h)}</Td>
                  <Td align="right" className="mono">{c.lag_minutes}m</Td>
                  <Td><span className={`status-pill ${c.status === 'Healthy' ? 'ok' : c.status === 'Degraded' ? 'warn' : 'crit'}`}>{c.status}</span></Td>
                  <Td className="mono text-xs text-[var(--ink-soft)]">{c.last_sync.replace('T',' ').replace('Z',' UTC')}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
        {(p?.layers ?? []).map((l) => (
          <div key={l.layer} className="ops-card p-4">
            <div className={`layer-chip ${l.layer.toLowerCase() === 'bronze' ? 'bronze' : l.layer.toLowerCase() === 'silver' ? 'silver' : l.layer.toLowerCase() === 'gold' ? 'gold' : 'cyan'} inline-flex mb-2`}>{l.layer}</div>
            <div className="text-sm text-[var(--ink-muted)] leading-relaxed mb-3">{l.description}</div>
            <dl className="grid grid-cols-2 gap-2 text-xs mono">
              <div><dt className="text-[var(--ink-soft)] uppercase tracking-wider">Tables</dt><dd className="font-semibold">{l.tables}</dd></div>
              <div><dt className="text-[var(--ink-soft)] uppercase tracking-wider">Rows</dt><dd className="font-semibold">{formatNumber(l.rows)}</dd></div>
              <div><dt className="text-[var(--ink-soft)] uppercase tracking-wider">Storage</dt><dd className="font-semibold">{l.storage_tb} TB</dd></div>
              <div><dt className="text-[var(--ink-soft)] uppercase tracking-wider">Freshness</dt><dd className="font-semibold">{l.freshness_min}m</dd></div>
            </dl>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="ops-card lg:col-span-2 overflow-hidden">
          <div className="ops-card-header">
            <div className="eyebrow">Iceberg tables (sample)</div>
            <div className="text-sm font-semibold">Same files, many compute engines</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--paper-deep)] text-[var(--ink-muted)]">
                <tr><Th>Database</Th><Th>Table</Th><Th align="right">Rows</Th><Th align="right">Size</Th><Th>Format</Th></tr>
              </thead>
              <tbody>
                {tables.map((t) => (
                  <tr key={`${t.database}.${t.table}`} className="border-t border-[var(--hairline-soft)]">
                    <Td className="mono text-xs">{t.database}</Td>
                    <Td className="mono text-xs">{t.table}</Td>
                    <Td align="right" className="mono">{formatNumber(t.rows)}</Td>
                    <Td align="right" className="mono">{t.size_gb} GB</Td>
                    <Td className="text-xs text-[var(--ink-soft)]">{t.format}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="ops-card">
          <div className="ops-card-header">
            <div className="eyebrow">Incidents (24h)</div>
            <div className="text-sm font-semibold">Connector and dbt</div>
          </div>
          <ul className="divide-y divide-[var(--hairline-soft)]">
            {(p?.incidents_24h ?? []).map((i, idx) => (
              <li key={idx} className="px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`status-pill ${i.severity === 'Warning' ? 'warn' : i.severity === 'Critical' ? 'crit' : 'cyan'}`}>{i.severity}</span>
                  <span className="mono text-xs text-[var(--ink-soft)]">{i.time.replace('T',' ').replace('Z',' UTC')}</span>
                </div>
                <div className="text-sm font-semibold">{i.connector}</div>
                <div className="text-xs text-[var(--ink-muted)] mt-0.5">{i.description}</div>
                {i.resolved && <div className="text-[10px] uppercase tracking-wider text-[var(--ok)] mt-1 font-semibold">Resolved</div>}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="ops-card p-5">
        <div className="eyebrow mb-1">Failure simulator</div>
        <div className="text-sm font-semibold mb-2">Inject a failure, watch the contract hold</div>
        <p className="text-sm text-[var(--ink-muted)] leading-relaxed mb-4">{p?.failure_simulator.description}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(p?.failure_simulator.scenarios ?? []).map((s) => {
            const active = simRunning === s.name;
            return (
              <div key={s.name} className={`rounded-sm border p-4 ${active ? 'border-[var(--cyan)] bg-[var(--paper-deep)]' : 'border-[var(--hairline)] bg-white'}`}>
                <div className="font-semibold text-[var(--ink-strong)]">{s.name}</div>
                <div className="text-xs text-[var(--ink-muted)] mt-2"><span className="font-semibold uppercase tracking-wider text-[10px] text-[var(--ink-soft)]">Expected alert:</span> {s.expected_alert}</div>
                <div className="text-xs text-[var(--ink-muted)] mt-2"><span className="font-semibold uppercase tracking-wider text-[10px] text-[var(--ink-soft)]">Downstream:</span> {s.downstream}</div>
                <button
                  type="button"
                  onClick={() => runScenario(s.name)}
                  className="mt-3 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-sm bg-[var(--navy-deep)] text-[var(--cyan-bright)] hover:bg-[var(--navy)] disabled:opacity-50"
                  disabled={active}
                >
                  {active ? 'Simulating…' : 'Run simulation'}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Th({ children, align }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return <th className={`px-3 py-2 text-[11px] font-semibold uppercase tracking-wider ${align === 'right' ? 'text-right' : 'text-left'}`}>{children}</th>;
}
function Td({ children, align, className = '' }: { children: React.ReactNode; align?: 'left' | 'right'; className?: string }) {
  return <td className={`px-3 py-2 ${align === 'right' ? 'text-right' : 'text-left'} ${className}`}>{children}</td>;
}
