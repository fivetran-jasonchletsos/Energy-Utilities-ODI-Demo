import { useEffect, useMemo, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, BarChart, Bar } from 'recharts';
import { fetchSnapshot, formatNumber } from '../api/queries';

type SiteHour = { ts: string; mw: number; forecast_mw: number };
type Site = { site: string; kind: 'Solar' | 'Wind'; capacity_mw: number; region: string; hourly: SiteHour[] };
type Curtailment = { date: string; site: string; mwh: number; reason: string; cost_usd: number };
type Summary = {
  total_capacity_mw: number; rolling_7d_actual_gwh: number; rolling_7d_forecast_gwh: number;
  forecast_delta_pct: number; curtailment_7d_mwh: number; curtailment_7d_cost_usd: number;
};
type Renewables = { sites: Site[]; curtailment_events: Curtailment[]; summary: Summary };

export default function RenewablesPage() {
  const [r, setR] = useState<Renewables | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  useEffect(() => { fetchSnapshot<Renewables>('renewables.json').then(setR).catch(() => {}); }, []);
  useEffect(() => { if (r && !selected) setSelected(r.sites[0].site); }, [r, selected]);

  const site = useMemo(() => r?.sites.find((s) => s.site === selected) ?? null, [r, selected]);

  // System-wide hourly aggregation
  const aggHourly = useMemo(() => {
    if (!r) return [];
    const map = new Map<string, { ts: string; solar: number; wind: number; forecast: number }>();
    for (const s of r.sites) {
      for (const h of s.hourly) {
        const entry = map.get(h.ts) ?? { ts: h.ts, solar: 0, wind: 0, forecast: 0 };
        if (s.kind === 'Solar') entry.solar += h.mw;
        else entry.wind += h.mw;
        entry.forecast += h.forecast_mw;
        map.set(h.ts, entry);
      }
    }
    return Array.from(map.values()).map((d) => ({
      hour: d.ts.slice(5, 13).replace('T', ' '),
      Solar: Math.round(d.solar),
      Wind: Math.round(d.wind),
      Forecast: Math.round(d.forecast),
    }));
  }, [r]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-6">
        <div className="eyebrow mb-1">Renewables</div>
        <h1 className="text-3xl font-semibold tracking-tight">Solar and wind production, forecast delta, curtailment</h1>
        <p className="mt-3 text-[var(--ink-muted)] max-w-3xl">
          Seven sites across the Sonoran, Mojave, and Sangre de Cristo regions. Production from PI, dispatch
          forecast from the load-forecast model, curtailment from the EMS log — joined in <span className="mono">mart_renewables_hourly</span>.
        </p>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="kpi-tile"><div className="kpi-label">Installed capacity</div><div className="kpi-value">{formatNumber(r?.summary.total_capacity_mw)} MW</div><div className="kpi-sub">{r?.sites.length ?? 0} sites</div></div>
        <div className="kpi-tile"><div className="kpi-label">7-day production</div><div className="kpi-value">{r?.summary.rolling_7d_actual_gwh ?? '—'} GWh</div><div className="kpi-sub">Forecast {r?.summary.rolling_7d_forecast_gwh ?? '—'} GWh</div></div>
        <div className="kpi-tile"><div className="kpi-label">Forecast delta</div><div className="kpi-value">{r ? (r.summary.forecast_delta_pct > 0 ? '+' : '') + r.summary.forecast_delta_pct + '%' : '—'}</div><div className="kpi-sub">Actual vs forecast, 7d</div></div>
        <div className="scada-tile"><div className="kpi-label">Curtailment 7d</div><div className="kpi-value">{r?.summary.curtailment_7d_mwh ?? '—'} MWh</div><div className="kpi-sub">${formatNumber(r?.summary.curtailment_7d_cost_usd)} cost</div></div>
      </section>

      <section className="ops-card mb-6">
        <div className="ops-card-header"><div className="eyebrow">System renewable output, last 7 days (MW, hourly)</div><div className="text-sm font-semibold">Solar + wind + day-ahead forecast envelope</div></div>
        <div className="p-3 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={aggHourly} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono' }} interval={11} />
              <YAxis tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono' }} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="Forecast" stroke="#94a3b8" strokeWidth={1.5} dot={false} strokeDasharray="3 3" />
              <Line type="monotone" dataKey="Solar"    stroke="#fbbf24" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Wind"     stroke="#22d3ee" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="ops-card lg:col-span-2">
          <div className="ops-card-header flex items-center justify-between">
            <div>
              <div className="eyebrow">Per-site detail</div>
              <div className="text-sm font-semibold">{site?.site ?? '—'}</div>
            </div>
            <select
              value={selected ?? ''}
              onChange={(e) => setSelected(e.target.value)}
              className="text-xs mono border border-[var(--hairline)] rounded-sm px-2 py-1 bg-white"
            >
              {(r?.sites ?? []).map((s) => <option key={s.site} value={s.site}>{s.kind} · {s.site}</option>)}
            </select>
          </div>
          <div className="p-3 h-72">
            {site && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={site.hourly.map((h) => ({ hour: h.ts.slice(5, 13).replace('T', ' '), Actual: h.mw, Forecast: h.forecast_mw }))} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono' }} interval={11} />
                  <YAxis tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono' }} />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="Forecast" stroke="#94a3b8" strokeWidth={1.5} dot={false} strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="Actual"   stroke={site.kind === 'Solar' ? '#f59e0b' : '#06b6d4'} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="ops-card">
          <div className="ops-card-header"><div className="eyebrow">Site roster</div><div className="text-sm font-semibold">Capacity by site</div></div>
          <ul className="divide-y divide-[var(--hairline-soft)]">
            {(r?.sites ?? []).map((s) => (
              <li key={s.site} className="px-4 py-2.5 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-[var(--ink-strong)] truncate">{s.site}</div>
                  <div className="text-xs text-[var(--ink-soft)] truncate">{s.region}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`status-pill ${s.kind === 'Solar' ? 'warn' : 'cyan'}`}>{s.kind}</span>
                  <span className="mono font-semibold text-sm">{s.capacity_mw} MW</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="ops-card mb-6 overflow-hidden">
        <div className="ops-card-header"><div className="eyebrow">Curtailment events (7d)</div><div className="text-sm font-semibold">Energy not delivered, with cause</div></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--paper-deep)] text-[var(--ink-muted)]">
              <tr><Th>Date</Th><Th>Site</Th><Th align="right">MWh</Th><Th>Reason</Th><Th align="right">Cost</Th></tr>
            </thead>
            <tbody>
              {(r?.curtailment_events ?? []).map((c, i) => (
                <tr key={i} className="border-t border-[var(--hairline-soft)]">
                  <Td className="mono text-xs">{c.date}</Td>
                  <Td>{c.site}</Td>
                  <Td align="right" className="mono font-semibold">{c.mwh}</Td>
                  <Td className="text-xs">{c.reason}</Td>
                  <Td align="right" className="mono">${formatNumber(c.cost_usd)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="ops-card">
        <div className="ops-card-header"><div className="eyebrow">Curtailment MWh by site (7d)</div><div className="text-sm font-semibold">Where the loss concentrates</div></div>
        <div className="p-3 h-64">
          {r && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={r.curtailment_events} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                <XAxis dataKey="site" tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono' }} />
                <YAxis tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono' }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="mwh" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          )}
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
