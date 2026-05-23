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
                  <XAxis dataKey="hour" tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono' }} />
                  <YAxis tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono' }} domain={['dataMin - 200', 'dataMax + 200']} />
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

      {/* dbt-wizard hero section */}
      <section
        className="rounded-lg border border-[var(--hairline)] p-6 sm:p-8"
        style={{ borderLeft: '5px solid var(--cyan)', background: 'rgba(6,182,212,0.04)' }}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-8">
            <div className="eyebrow mb-2 text-[var(--cyan)]">dbt-wizard · Build-time AI</div>
            <h2 className="text-2xl sm:text-3xl font-semibold leading-tight text-[var(--ink-strong)]">
              Gold model missing? Build it in 90 seconds.
            </h2>
            <p className="mt-3 text-sm text-[var(--ink-muted)] leading-relaxed max-w-2xl">
              The VP of Grid Operations asks: "Why are tier-2 substations in the West territory showing
              38% more momentary-interruption events after the IED rollout?"
              No <span className="font-mono text-xs">gold.fct_outage_by_substation_tier_quarter</span> exists.
              PUC filing window in 16 hours. Manual build ETA: 3–5 days.
              dbt-wizard ETA: 90 seconds. <strong className="text-[var(--ink-strong)]">$2.7M PUC penalty exposure.</strong>
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/grid-scenario"
                className="inline-flex items-center gap-2 rounded-sm font-semibold text-sm px-4 py-2.5 hover:opacity-95 transition-opacity"
                style={{ background: 'var(--cyan)', color: 'var(--navy-deep)' }}
              >
                See the scenario
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                to="/wizard-live"
                className="inline-flex items-center gap-2 rounded-sm font-semibold text-sm px-4 py-2.5 border border-[var(--cyan)] text-[var(--cyan)] hover:bg-[rgba(6,182,212,0.06)] transition-colors"
              >
                Watch live build
              </Link>
              <Link
                to="/dbt-wizard"
                className="inline-flex items-center gap-2 rounded-sm font-semibold text-sm px-4 py-2.5 border border-[var(--hairline)] text-[var(--ink-muted)] hover:bg-[var(--paper-deep)] transition-colors"
              >
                How it works
              </Link>
            </div>
          </div>
          <div className="md:col-span-4 grid grid-cols-2 gap-3">
            <WizardStat value="90s" label="dbt-wizard build" />
            <WizardStat value="3–5d" label="Manual equivalent" />
            <WizardStat value="$2.7M" label="PUC penalty at risk" />
            <WizardStat value="9" label="Tests auto-written" />
          </div>
        </div>
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

function WizardStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-md border border-[var(--hairline)] bg-white p-3">
      <div className="text-2xl font-semibold text-[var(--cyan)] tabular leading-none">{value}</div>
      <div className="text-[11px] text-[var(--ink-muted)] mt-1.5 leading-snug">{label}</div>
    </div>
  );
}
