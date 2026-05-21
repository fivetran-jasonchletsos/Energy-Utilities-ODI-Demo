import { useEffect, useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';
import { fetchSnapshot, formatNumber } from '../api/queries';

type Outage = {
  id: string; feeder: string; area: string; customers: number; cause: string;
  started: string; etr: string; crew: string; predicted_minutes: number; ai_predicted_minutes: number;
};
type Outages = {
  active: Outage[];
  cause_breakdown_ytd: { cause: string; count: number; color: string }[];
  reliability_metrics: { saidi_ytd_min: number; saidi_target: number; saifi_ytd: number; saifi_target: number; caidi_ytd_min: number; caidi_target: number };
  saidi_trend: { month: string; saidi: number }[];
};

export default function OutagePage() {
  const [o, setO] = useState<Outages | null>(null);
  useEffect(() => { fetchSnapshot<Outages>('outages.json').then(setO).catch(() => {}); }, []);

  const totalImpacted = o?.active.reduce((s, x) => s + x.customers, 0) ?? 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-6">
        <div className="eyebrow mb-1">Outage Management</div>
        <h1 className="text-3xl font-semibold tracking-tight">Active outages and restoration</h1>
        <p className="mt-3 text-[var(--ink-muted)] max-w-3xl">
          Active outages from the OMS join AMI last-gasp messages, GIS feeder topology, NOAA weather, and the
          outage-prediction agent. The agent reads the same gold-layer marts the dispatch console reads.
        </p>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="scada-tile"><div className="kpi-label">Active outages</div><div className="kpi-value">{o?.active.length ?? '—'}</div><div className="kpi-sub">Across all regions</div></div>
        <div className="scada-tile"><div className="kpi-label">Customers impacted</div><div className="kpi-value">{formatNumber(totalImpacted)}</div><div className="kpi-sub">Across active events</div></div>
        <div className="kpi-tile"><div className="kpi-label">SAIDI YTD</div><div className="kpi-value">{o?.reliability_metrics.saidi_ytd_min ?? '—'} min</div><div className="kpi-sub">Target ≤ {o?.reliability_metrics.saidi_target ?? '—'} min</div></div>
        <div className="kpi-tile"><div className="kpi-label">SAIFI YTD</div><div className="kpi-value">{o?.reliability_metrics.saifi_ytd ?? '—'}</div><div className="kpi-sub">Target ≤ {o?.reliability_metrics.saifi_target ?? '—'}</div></div>
      </section>

      <section className="ops-card mb-6 overflow-hidden">
        <div className="ops-card-header">
          <div className="eyebrow">Active outage roster</div>
          <div className="text-sm font-semibold">Feeder, cause, ETR — and agent-predicted restoration</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--paper-deep)] text-[var(--ink-muted)]">
              <tr>
                <Th>ID</Th><Th>Feeder</Th><Th>Area</Th>
                <Th align="right">Customers</Th><Th>Cause</Th>
                <Th>Started</Th><Th>OMS ETR</Th>
                <Th align="right">Agent ETR (min)</Th><Th>Crew</Th>
              </tr>
            </thead>
            <tbody>
              {(o?.active ?? []).map((row) => (
                <tr key={row.id} className="border-t border-[var(--hairline-soft)]">
                  <Td className="mono text-xs">{row.id}</Td>
                  <Td className="mono font-semibold">{row.feeder}</Td>
                  <Td>{row.area}</Td>
                  <Td align="right" className="mono">{formatNumber(row.customers)}</Td>
                  <Td><CausePill cause={row.cause} /></Td>
                  <Td className="mono text-xs">{row.started.replace('T',' ').replace('Z',' UTC')}</Td>
                  <Td className="mono text-xs">{row.etr.replace('T',' ').replace('Z',' UTC')}</Td>
                  <Td align="right" className="mono font-semibold text-[var(--cyan-dim)]">{row.ai_predicted_minutes}</Td>
                  <Td className="mono text-xs">{row.crew}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="ops-card lg:col-span-2">
          <div className="ops-card-header"><div className="eyebrow">SAIDI trend</div><div className="text-sm font-semibold">Monthly system-wide outage duration (minutes per customer)</div></div>
          <div className="p-3 h-72">
            {o && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={o.saidi_trend} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                  <YAxis tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="saidi" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="ops-card">
          <div className="ops-card-header"><div className="eyebrow">Cause mix (YTD)</div><div className="text-sm font-semibold">Where outages come from</div></div>
          <div className="p-2 h-72">
            {o && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={o.cause_breakdown_ytd} dataKey="count" nameKey="cause" innerRadius={45} outerRadius={85} paddingAngle={2}>
                    {o.cause_breakdown_ytd.map((c, i) => <Cell key={i} fill={c.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} iconType="square" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="ops-card lg:col-span-2 p-5 bg-[var(--navy-deep)] text-white">
          <div className="eyebrow-light mb-2">Agents reading the gold layer</div>
          <p className="text-white/85 leading-relaxed text-sm">
            The Agent ETR column comes from a Snowpark model that joins <span className="mono">mart_active_outages</span>,
            <span className="mono"> mart_feeder_topology</span>, <span className="mono">mart_crew_disposition</span>, and
            the NOAA forecast cube. Predictions land back in <span className="mono">agent_outage_predictions</span> on the
            same Iceberg lake — auditable, time-traveled, and read by the dispatch portal, the customer-facing
            outage map, and the regulatory reliability report alike. One contract, many readers.
          </p>
        </div>

        <div className="ops-card p-5">
          <div className="eyebrow mb-2">Reliability scorecard</div>
          <table className="w-full text-sm mono">
            <tbody>
              <Row label="SAIDI YTD"  value={`${o?.reliability_metrics.saidi_ytd_min} min`} target={`≤ ${o?.reliability_metrics.saidi_target} min`} ok={(o?.reliability_metrics.saidi_ytd_min ?? 0) <= (o?.reliability_metrics.saidi_target ?? 0)} />
              <Row label="SAIFI YTD"  value={`${o?.reliability_metrics.saifi_ytd}`}         target={`≤ ${o?.reliability_metrics.saifi_target}`}     ok={(o?.reliability_metrics.saifi_ytd ?? 0) <= (o?.reliability_metrics.saifi_target ?? 0)} />
              <Row label="CAIDI YTD"  value={`${o?.reliability_metrics.caidi_ytd_min} min`} target={`≤ ${o?.reliability_metrics.caidi_target} min`} ok={(o?.reliability_metrics.caidi_ytd_min ?? 0) <= (o?.reliability_metrics.caidi_target ?? 0)} />
            </tbody>
          </table>
        </div>
      </section>

      <section className="ops-card">
        <div className="ops-card-header"><div className="eyebrow">Outage volume by cause (YTD)</div><div className="text-sm font-semibold">Total events</div></div>
        <div className="p-3 h-64">
          {o && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={o.cause_breakdown_ytd} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                <XAxis dataKey="cause" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                <YAxis tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="count" fill="#06b6d4" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>
    </div>
  );
}

function CausePill({ cause }: { cause: string }) {
  const map: Record<string, string> = { Weather: 'cyan', Vegetation: 'ok', Equipment: 'neutral', Animal: 'warn', Planned: 'cyan' };
  return <span className={`status-pill ${map[cause] ?? 'neutral'}`}>{cause}</span>;
}

function Row({ label, value, target, ok }: { label: string; value: string; target: string; ok: boolean }) {
  return (
    <tr className="border-b border-[var(--hairline-soft)] last:border-0">
      <td className="py-2 text-[var(--ink-muted)]">{label}</td>
      <td className="py-2 font-semibold text-right">{value}</td>
      <td className="py-2 text-right text-[var(--ink-soft)] text-xs">{target}</td>
      <td className="py-2 text-right"><span className={`status-pill ${ok ? 'ok' : 'warn'}`}>{ok ? 'On' : 'Off'}</span></td>
    </tr>
  );
}

function Th({ children, align }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return <th className={`px-3 py-2 text-[11px] font-semibold uppercase tracking-wider ${align === 'right' ? 'text-right' : 'text-left'}`}>{children}</th>;
}
function Td({ children, align, className = '' }: { children: React.ReactNode; align?: 'left' | 'right'; className?: string }) {
  return <td className={`px-3 py-2 ${align === 'right' ? 'text-right' : 'text-left'} ${className}`}>{children}</td>;
}
