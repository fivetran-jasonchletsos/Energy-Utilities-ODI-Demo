import { useEffect, useMemo, useState } from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, CartesianGrid } from 'recharts';
import { fetchSnapshot, formatNumber } from '../api/queries';

type Asset = {
  asset_id: string; type: string; substation: string; region: string;
  capacity_mva: number; age_years: number; health_score: number; priority: string;
  last_inspection: string; replacement_cost_usd: number;
};
type AssetData = {
  summary: { total_assets: number; critical_count: number; high_count: number; medium_count: number; low_count: number; avg_age: number; avg_health: number; replacement_capex_top50_usd: number };
  assets: Asset[];
};

const PRIORITY_COLOR: Record<string, string> = { Critical: '#b91c1c', High: '#f59e0b', Medium: '#06b6d4', Low: '#15803d' };

export default function AssetsPage() {
  const [d, setD] = useState<AssetData | null>(null);
  const [filter, setFilter] = useState<string>('All');
  useEffect(() => { fetchSnapshot<AssetData>('assets.json').then(setD).catch(() => {}); }, []);

  const filtered = useMemo(() => {
    if (!d) return [];
    return filter === 'All' ? d.assets : d.assets.filter((a) => a.priority === filter);
  }, [d, filter]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-6">
        <div className="eyebrow mb-1">Asset Health</div>
        <h1 className="text-3xl font-semibold tracking-tight">Transformers, substations, and replacement priority</h1>
        <p className="mt-3 text-[var(--ink-muted)] max-w-3xl">
          200 substation and distribution assets ranked by health score. Joins PI thermal trends, Maximo
          inspection results, GIS location, and historical failure data into <span className="mono">int_asset_health</span>.
        </p>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="scada-tile"><div className="kpi-label">Critical assets</div><div className="kpi-value">{d?.summary.critical_count ?? '—'}</div><div className="kpi-sub">Replacement within 12 months</div></div>
        <div className="kpi-tile"><div className="kpi-label">High priority</div><div className="kpi-value">{d?.summary.high_count ?? '—'}</div><div className="kpi-sub">24–36 month plan</div></div>
        <div className="kpi-tile"><div className="kpi-label">Avg fleet age</div><div className="kpi-value">{d?.summary.avg_age ?? '—'} yr</div><div className="kpi-sub">Avg health {d?.summary.avg_health ?? '—'}</div></div>
        <div className="kpi-tile"><div className="kpi-label">Top-50 CapEx</div><div className="kpi-value">${formatNumber(Math.round((d?.summary.replacement_capex_top50_usd ?? 0) / 1_000_000))}M</div><div className="kpi-sub">Replacement estimate</div></div>
      </section>

      <section className="ops-card mb-6">
        <div className="ops-card-header"><div className="eyebrow">Health vs age</div><div className="text-sm font-semibold">All assets, colored by replacement priority</div></div>
        <div className="p-3 h-80">
          {d && (
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                <XAxis dataKey="age_years"    name="Age"    type="number" unit=" yr" tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono' }} />
                <YAxis dataKey="health_score" name="Health" type="number" domain={[0, 100]} tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono' }} />
                <ZAxis dataKey="capacity_mva" range={[40, 240]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ fontSize: 12 }} />
                {(['Critical', 'High', 'Medium', 'Low'] as const).map((p) => (
                  <Scatter key={p} name={p} data={d.assets.filter((a) => a.priority === p)} fill={PRIORITY_COLOR[p]} />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section className="ops-card overflow-hidden">
        <div className="ops-card-header flex items-center justify-between">
          <div>
            <div className="eyebrow">Asset roster</div>
            <div className="text-sm font-semibold">Ordered by health score, worst first</div>
          </div>
          <div className="flex gap-1 text-xs">
            {(['All', 'Critical', 'High', 'Medium', 'Low'] as const).map((p) => (
              <button key={p} onClick={() => setFilter(p)} className={`px-2.5 py-1 rounded-sm border ${filter === p ? 'bg-[var(--navy-deep)] text-[var(--cyan-bright)] border-[var(--navy-deep)]' : 'border-[var(--hairline)] text-[var(--ink-muted)] hover:bg-[var(--paper-deep)]'}`}>{p}</button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--paper-deep)] text-[var(--ink-muted)] sticky top-0">
              <tr>
                <Th>Asset ID</Th><Th>Type</Th><Th>Substation</Th>
                <Th align="right">MVA</Th><Th align="right">Age</Th>
                <Th align="right">Health</Th><Th>Priority</Th>
                <Th>Last inspection</Th><Th align="right">Repl. cost</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 80).map((a) => (
                <tr key={a.asset_id} className="border-t border-[var(--hairline-soft)]">
                  <Td className="mono text-xs">{a.asset_id}</Td>
                  <Td>{a.type}</Td>
                  <Td>{a.substation}</Td>
                  <Td align="right" className="mono">{a.capacity_mva}</Td>
                  <Td align="right" className="mono">{a.age_years}</Td>
                  <Td align="right"><HealthBar value={a.health_score} /></Td>
                  <Td><span className={`status-pill ${a.priority === 'Critical' ? 'crit' : a.priority === 'High' ? 'warn' : a.priority === 'Medium' ? 'cyan' : 'ok'}`}>{a.priority}</span></Td>
                  <Td className="mono text-xs">{a.last_inspection}</Td>
                  <Td align="right" className="mono">${formatNumber(a.replacement_cost_usd)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 80 && (
          <div className="px-4 py-2 text-xs text-[var(--ink-soft)] border-t border-[var(--hairline-soft)]">
            Showing 80 of {formatNumber(filtered.length)} assets. Full list lives in <span className="mono">mart_asset_health</span> on the gold layer.
          </div>
        )}
      </section>
    </div>
  );
}

function HealthBar({ value }: { value: number }) {
  const color = value < 35 ? '#b91c1c' : value < 55 ? '#f59e0b' : value < 75 ? '#06b6d4' : '#15803d';
  return (
    <div className="inline-flex items-center gap-2 justify-end w-full">
      <div className="w-16 h-1.5 rounded-full bg-[var(--paper-deep)] overflow-hidden">
        <div className="h-full" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="mono font-semibold tabular text-xs">{value.toFixed(0)}</span>
    </div>
  );
}

function Th({ children, align }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return <th className={`px-3 py-2 text-[11px] font-semibold uppercase tracking-wider ${align === 'right' ? 'text-right' : 'text-left'}`}>{children}</th>;
}
function Td({ children, align, className = '' }: { children: React.ReactNode; align?: 'left' | 'right'; className?: string }) {
  return <td className={`px-3 py-2 ${align === 'right' ? 'text-right' : 'text-left'} ${className}`}>{children}</td>;
}
