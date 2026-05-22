import { useEffect, useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { fetchSnapshot, formatNumber } from '../api/queries';

type Segment = { segment: string; accounts: number; pct: number; annual_gwh: number };
type Top = { account_id: string; name: string; industry: string; state: string; peak_demand_mw: number; annual_gwh: number; rate_class: string };
type ServiceType = { type: string; pct: number };
type Customer = {
  segments: Segment[];
  service_type: ServiceType[];
  top_industrial: Top[];
  monthly_usage_gwh: { month: string; res: number; com: number; ind: number }[];
};

const SEG_COLOR = ['#06b6d4', '#0e7490', '#1e4380'];

export default function CustomerPage() {
  const [c, setC] = useState<Customer | null>(null);
  useEffect(() => { fetchSnapshot<Customer>('customer.json').then(setC).catch(() => {}); }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-6">
        <div className="eyebrow mb-1">Customers</div>
        <h1 className="text-3xl font-semibold tracking-tight">Segments, service types, and top industrials</h1>
        <p className="mt-3 text-[var(--ink-muted)] max-w-3xl">
          CIS data from SAP IS-U joined with Salesforce account hierarchy. 2.4M accounts, 27,420 industrial,
          modeled in <span className="mono">mart_customer_segments</span> and <span className="mono">mart_industrial_accounts</span>.
        </p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="ops-card">
          <div className="ops-card-header"><div className="eyebrow">Segments</div><div className="text-sm font-semibold">Accounts by class</div></div>
          <div className="p-2 h-72">
            {c && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={c.segments} dataKey="accounts" nameKey="segment" innerRadius={50} outerRadius={90} paddingAngle={2}>
                    {c.segments.map((_, i) => <Cell key={i} fill={SEG_COLOR[i]} />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => formatNumber(v)} contentStyle={{ fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} iconType="square" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="border-t border-[var(--hairline-soft)]">
            {(c?.segments ?? []).map((s, i) => (
              <div key={s.segment} className="px-4 py-2 flex items-center justify-between text-sm border-b border-[var(--hairline-soft)] last:border-0">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: SEG_COLOR[i] }} />
                  <span className="font-semibold">{s.segment}</span>
                </span>
                <span className="mono text-[var(--ink-muted)]">{formatNumber(s.accounts)} · {s.annual_gwh.toLocaleString()} GWh/yr</span>
              </div>
            ))}
          </div>
        </div>

        <div className="ops-card">
          <div className="ops-card-header"><div className="eyebrow">Service types</div><div className="text-sm font-semibold">Tariff and program mix</div></div>
          <div className="p-2 h-72">
            {c && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={c.service_type} layout="vertical" margin={{ top: 8, right: 16, bottom: 0, left: 60 }}>
                  <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono' }} />
                  <YAxis dataKey="type" type="category" tick={{ fontSize: 11 }} width={150} />
                  <Tooltip formatter={(v: any) => `${v}%`} contentStyle={{ fontSize: 12 }} />
                  <Bar dataKey="pct" fill="#06b6d4" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="ops-card">
          <div className="ops-card-header"><div className="eyebrow">Monthly usage (GWh)</div><div className="text-sm font-semibold">By segment</div></div>
          <div className="p-2 h-72">
            {c && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={c.monthly_usage_gwh} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono' }} />
                  <YAxis tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono' }} />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="res" stackId="a" fill="#06b6d4" name="Residential" />
                  <Bar dataKey="com" stackId="a" fill="#0e7490" name="Commercial" />
                  <Bar dataKey="ind" stackId="a" fill="#1e4380" name="Industrial" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>

      <section className="ops-card overflow-hidden">
        <div className="ops-card-header"><div className="eyebrow">Top 20 industrial customers</div><div className="text-sm font-semibold">By peak demand</div></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--paper-deep)] text-[var(--ink-muted)]">
              <tr>
                <Th>Account ID</Th><Th>Customer</Th><Th>Industry</Th><Th>State</Th>
                <Th align="right">Peak MW</Th><Th align="right">Annual GWh</Th><Th>Rate class</Th>
              </tr>
            </thead>
            <tbody>
              {(c?.top_industrial ?? []).map((row) => (
                <tr key={row.account_id} className="border-t border-[var(--hairline-soft)]">
                  <Td className="mono text-xs">{row.account_id}</Td>
                  <Td><span className="font-semibold">{row.name}</span></Td>
                  <Td>{row.industry}</Td>
                  <Td className="mono text-xs">{row.state}</Td>
                  <Td align="right" className="mono font-semibold">{row.peak_demand_mw}</Td>
                  <Td align="right" className="mono">{formatNumber(row.annual_gwh)}</Td>
                  <Td className="mono text-xs">{row.rate_class}</Td>
                </tr>
              ))}
            </tbody>
          </table>
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
