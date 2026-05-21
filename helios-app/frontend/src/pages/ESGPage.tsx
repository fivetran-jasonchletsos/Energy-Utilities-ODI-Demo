import { useEffect, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { fetchSnapshot, formatNumber, formatPct } from '../api/queries';

type Q = { quarter: string; tonnes_co2e: number };
type RPct = { quarter: string; pct: number };
type Intensity = { quarter: string; lb_per_mwh: number };
type Water = { site: string; kgal_q: number; process: string };
type Filing = { agency: string; filing: string; due: string; status: string };
type RPS = { state: string; current_pct: number; target_pct: number; target_year: number };
type ESG = {
  scope: { scope1_q: Q[]; scope2_q: Q[] };
  renewables_pct_q: RPct[];
  emissions_intensity_lb_per_mwh: Intensity[];
  water_use_by_site_kgal: Water[];
  regulatory_filings: Filing[];
  rps_targets: RPS[];
};

export default function ESGPage() {
  const [e, setE] = useState<ESG | null>(null);
  useEffect(() => { fetchSnapshot<ESG>('esg.json').then(setE).catch(() => {}); }, []);

  const combined = (e?.scope.scope1_q ?? []).map((s1, i) => ({
    quarter: s1.quarter,
    Scope1: s1.tonnes_co2e,
    Scope2: e?.scope.scope2_q[i]?.tonnes_co2e ?? 0,
  }));

  const latestRPS = e?.renewables_pct_q.slice(-1)[0]?.pct ?? 0;
  const latestIntensity = e?.emissions_intensity_lb_per_mwh.slice(-1)[0]?.lb_per_mwh ?? 0;
  const prevIntensity = e?.emissions_intensity_lb_per_mwh.slice(-5)[0]?.lb_per_mwh ?? 0;
  const intensityDelta = prevIntensity > 0 ? ((latestIntensity - prevIntensity) / prevIntensity) * 100 : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-6">
        <div className="eyebrow mb-1">ESG and Regulatory</div>
        <h1 className="text-3xl font-semibold tracking-tight">Emissions, renewables, and state-PUC reporting</h1>
        <p className="mt-3 text-[var(--ink-muted)] max-w-3xl">
          Scope 1+2 emissions, renewable share, and water use rolled up from <span className="mono">mart_emissions_quarterly</span>.
          The Arizona Corporation Commission, NM PRC, and NV PUC all read the same gold-layer files via Athena.
        </p>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="kpi-tile"><div className="kpi-label">Renewables share</div><div className="kpi-value">{formatPct(latestRPS)}</div><div className="kpi-sub">2026-Q1, target 35% by 2027</div></div>
        <div className="kpi-tile"><div className="kpi-label">Emissions intensity</div><div className="kpi-value">{latestIntensity} lb/MWh</div><div className="kpi-sub">{formatPct(intensityDelta)} YoY</div></div>
        <div className="kpi-tile"><div className="kpi-label">Scope 1 Q1</div><div className="kpi-value">{formatNumber(e?.scope.scope1_q.slice(-1)[0]?.tonnes_co2e)}</div><div className="kpi-sub">tonnes CO2e</div></div>
        <div className="kpi-tile"><div className="kpi-label">Scope 2 Q1</div><div className="kpi-value">{formatNumber(e?.scope.scope2_q.slice(-1)[0]?.tonnes_co2e)}</div><div className="kpi-sub">tonnes CO2e (purchased)</div></div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="ops-card">
          <div className="ops-card-header"><div className="eyebrow">Scope 1 + 2 emissions, quarterly</div><div className="text-sm font-semibold">Tonnes CO2e</div></div>
          <div className="p-3 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={combined} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                <XAxis dataKey="quarter" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                <YAxis tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                <Tooltip formatter={(v: any) => formatNumber(v)} contentStyle={{ fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Scope1" stackId="a" fill="#1e4380" />
                <Bar dataKey="Scope2" stackId="a" fill="#06b6d4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="ops-card">
          <div className="ops-card-header"><div className="eyebrow">Renewable share, quarterly</div><div className="text-sm font-semibold">% of net generation</div></div>
          <div className="p-3 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={e?.renewables_pct_q ?? []} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                <XAxis dataKey="quarter" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                <YAxis tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} unit="%" />
                <Tooltip formatter={(v: any) => `${v}%`} contentStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="pct" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="ops-card lg:col-span-2">
          <div className="ops-card-header"><div className="eyebrow">Emissions intensity (lb/MWh)</div><div className="text-sm font-semibold">Trend</div></div>
          <div className="p-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={e?.emissions_intensity_lb_per_mwh ?? []} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                <XAxis dataKey="quarter" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                <YAxis tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="lb_per_mwh" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="ops-card">
          <div className="ops-card-header"><div className="eyebrow">RPS progress by state</div><div className="text-sm font-semibold">Current vs target</div></div>
          <div className="p-4 space-y-4">
            {(e?.rps_targets ?? []).map((r) => {
              const pct = (r.current_pct / r.target_pct) * 100;
              return (
                <div key={r.state}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">{r.state}</span>
                    <span className="mono text-[var(--ink-muted)]">{r.current_pct}% / {r.target_pct}% by {r.target_year}</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-[var(--paper-deep)] overflow-hidden">
                    <div className="h-full bg-[var(--cyan)]" style={{ width: `${Math.min(100, pct)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="ops-card overflow-hidden">
          <div className="ops-card-header"><div className="eyebrow">Water use by generation site (kgal/Q)</div><div className="text-sm font-semibold">Cooling and washing</div></div>
          <table className="w-full text-sm">
            <thead className="bg-[var(--paper-deep)] text-[var(--ink-muted)]">
              <tr><Th>Site</Th><Th>Process</Th><Th align="right">kgal / quarter</Th></tr>
            </thead>
            <tbody>
              {(e?.water_use_by_site_kgal ?? []).map((w) => (
                <tr key={w.site} className="border-t border-[var(--hairline-soft)]">
                  <Td><span className="font-semibold">{w.site}</span></Td>
                  <Td className="text-xs text-[var(--ink-muted)]">{w.process}</Td>
                  <Td align="right" className="mono">{formatNumber(w.kgal_q)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="ops-card overflow-hidden">
          <div className="ops-card-header"><div className="eyebrow">Regulatory filings</div><div className="text-sm font-semibold">Open obligations</div></div>
          <ul className="divide-y divide-[var(--hairline-soft)]">
            {(e?.regulatory_filings ?? []).map((f, i) => (
              <li key={i} className="px-4 py-3 flex items-start gap-3">
                <span className={`status-pill ${f.status === 'Filed' ? 'ok' : f.status === 'On track' ? 'cyan' : 'warn'}`}>{f.status}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-[var(--ink-strong)]">{f.filing}</div>
                  <div className="text-xs text-[var(--ink-muted)] mt-0.5">{f.agency} · due <span className="mono">{f.due}</span></div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="ops-card p-5 bg-[var(--navy-deep)] text-white">
        <div className="eyebrow-light mb-2">Why a regulator cares about Iceberg</div>
        <p className="text-white/85 leading-relaxed">
          The Arizona Corporation Commission asks for emissions calculations going back six years, with methodology
          version tracking. Iceberg time-travel and schema versioning answer that question without restoring
          backups or running parallel systems. Same files, same lineage, signed and queryable.
        </p>
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
