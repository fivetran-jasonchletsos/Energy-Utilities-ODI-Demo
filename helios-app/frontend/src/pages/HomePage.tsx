import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { fetchSnapshot, formatMW, formatPct } from '../api/queries';

type Kpi = { key: string; label: string; value: string; sub: string };
type Summary = {
  snapshot_label: string;
  kpis: Kpi[];
  headlines: { severity: 'crit' | 'warn' | 'ok'; title: string; detail: string }[];
};
type GenSlice = { source: string; mw: number; color: string };
type LoadPoint = { hour: string; load: number | null; forecast: number };
type GridStatus = {
  load_mw: number; capacity_mw: number; reserve_margin_pct: number;
  frequency_hz: number; voltage_pu_avg: number; ace_mw: number;
  generation_mix_mw: GenSlice[]; load_curve_24h: LoadPoint[];
  interties_mw: { name: string; mw: number }[];
};

export default function HomePage() {
  const [s, setS] = useState<Summary | null>(null);
  const [g, setG] = useState<GridStatus | null>(null);
  useEffect(() => {
    fetchSnapshot<Summary>('summary.json').then(setS).catch(() => {});
    fetchSnapshot<GridStatus>('grid_status.json').then(setG).catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow mb-1">Helios Grid · Control Room</div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Real-time grid status</h1>
          <p className="mt-2 text-[var(--ink-muted)] max-w-2xl">
            Operating snapshot for 2.4M customers across Arizona, New Mexico, and southern Nevada.
            Numbers refresh every 5 minutes from Snowflake gold-layer marts built on SCADA, AMI, CIS, and GIS.
          </p>
        </div>
        <div className="text-xs text-[var(--ink-soft)] mono">{s?.snapshot_label ?? '—'}</div>
      </header>

      {/* KPI tiles */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {(s?.kpis ?? []).map((k) => (
          <div key={k.key} className={k.key === 'active_outages' || k.key === 'reserve_margin' ? 'scada-tile' : 'kpi-tile'}>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value">{k.value}</div>
            <div className="kpi-sub">{k.sub}</div>
          </div>
        ))}
      </section>

      {/* Load curve + gen mix */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="ops-card lg:col-span-2">
          <div className="ops-card-header flex items-center justify-between">
            <div>
              <div className="eyebrow">Load curve (MW)</div>
              <div className="text-sm font-semibold">24-hour actuals vs day-ahead forecast</div>
            </div>
            {g && (
              <div className="text-right">
                <div className="text-xs text-[var(--ink-soft)]">Now</div>
                <div className="mono text-lg font-semibold">{formatMW(g.load_mw)}</div>
              </div>
            )}
          </div>
          <div className="p-3 h-80">
            {g && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={g.load_curve_24h} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                  <XAxis dataKey="hour" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                  <YAxis tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} domain={['dataMin - 200', 'dataMax + 200']} />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="forecast" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.18} name="Forecast" />
                  <Area type="monotone" dataKey="load" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.35} name="Actual" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="ops-card">
          <div className="ops-card-header">
            <div className="eyebrow">Generation mix</div>
            <div className="text-sm font-semibold">Now serving load — by source (MW)</div>
          </div>
          <div className="p-2 h-80">
            {g && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={g.generation_mix_mw} dataKey="mw" nameKey="source" innerRadius={55} outerRadius={95} paddingAngle={2}>
                    {g.generation_mix_mw.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => `${v} MW`} contentStyle={{ fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} iconType="square" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>

      {/* Grid vitals + headlines */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="ops-card lg:col-span-2">
          <div className="ops-card-header flex items-center justify-between">
            <div>
              <div className="eyebrow">Operational headlines</div>
              <div className="text-sm font-semibold">Top issues — control-room desk</div>
            </div>
            <Link to="/outages" className="text-xs font-semibold text-[var(--cyan-dim)] hover:underline">All outages →</Link>
          </div>
          <ul className="divide-y divide-[var(--hairline-soft)]">
            {(s?.headlines ?? []).map((h, i) => (
              <li key={i} className="px-4 py-3 flex items-start gap-3">
                <span className={`status-pill mt-0.5 ${h.severity}`}>{h.severity === 'crit' ? 'Critical' : h.severity === 'warn' ? 'Warning' : 'OK'}</span>
                <div className="min-w-0">
                  <div className="font-semibold text-[var(--ink-strong)]">{h.title}</div>
                  <div className="text-sm text-[var(--ink-muted)] mt-0.5">{h.detail}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="ops-card">
          <div className="ops-card-header">
            <div className="eyebrow">Grid vitals</div>
            <div className="text-sm font-semibold">System readouts</div>
          </div>
          <dl className="p-4 grid grid-cols-2 gap-3 text-sm">
            <Stat label="Frequency"     value={g ? `${g.frequency_hz.toFixed(3)} Hz` : '—'} />
            <Stat label="Avg voltage"   value={g ? `${g.voltage_pu_avg.toFixed(3)} pu` : '—'} />
            <Stat label="ACE"           value={g ? `${g.ace_mw.toFixed(1)} MW` : '—'} />
            <Stat label="Reserve"       value={g ? formatPct(g.reserve_margin_pct) : '—'} />
            <Stat label="Capacity"      value={g ? formatMW(g.capacity_mw) : '—'} />
            <Stat label="Headroom"      value={g ? formatMW(g.capacity_mw - g.load_mw) : '—'} />
          </dl>
          <div className="border-t border-[var(--hairline-soft)] px-4 py-3">
            <div className="eyebrow mb-2">Interties</div>
            <ul className="space-y-1 text-sm">
              {(g?.interties_mw ?? []).map((t) => (
                <li key={t.name} className="flex justify-between mono">
                  <span className="text-[var(--ink-muted)]">{t.name}</span>
                  <span className="font-semibold">{t.mw > 0 ? '+' : ''}{t.mw} MW</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="ops-card p-5 bg-[var(--navy-deep)] text-white">
        <div className="eyebrow-light mb-2">Why this matters</div>
        <p className="text-white/80 leading-relaxed">
          Every tile and chart on this page is a query against the same gold-layer mart that the dispatch agents,
          regulatory reporting jobs, and customer-facing outage map all read. That is ODI: one set of governed
          tables in open formats, many compute engines and many agents. SCADA OT data and CIS IT data live in
          the same Iceberg lake, with Fivetran handling the ingestion and dbt handling the contract.
        </p>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-[var(--ink-soft)] font-semibold">{label}</div>
      <div className="mono text-base font-semibold text-[var(--ink-strong)]">{value}</div>
    </div>
  );
}
