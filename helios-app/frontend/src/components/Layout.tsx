import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

const NAV: [string, string][] = [
  ['/', 'Grid Status'],
  ['/outages', 'Outages'],
  ['/renewables', 'Renewables'],
  ['/assets', 'Assets'],
  ['/customers', 'Customers'],
  ['/esg', 'ESG'],
  ['/architecture', 'Architecture'],
  ['/pipeline', 'Pipeline'],
  ['/policy', 'Policy'],
  ['/about', 'About'],
];

const DEMOS = [
  { key: 'tax-assessment',  name: 'Allegheny County Tax', industry: 'Public sector, property assessment',     url: 'https://fivetran-jasonchletsos.github.io/tax-assessment-databricks-demo/',  accent: '#dc2626' },
  { key: 'healthcare',      name: 'Epic Clarity',         industry: 'Healthcare, clinical analytics',         url: 'https://fivetran-jasonchletsos.github.io/Healthcare-EPIC-Snowflake-Demo/', accent: '#0d9488' },
  { key: 'finserv',         name: 'Meridian Capital',     industry: 'Financial services, wealth and banking', url: 'https://fivetran-jasonchletsos.github.io/FinServ-ODI-Demo/',               accent: '#1d4ed8' },
  { key: 'insurance',       name: 'Atlas Risk',           industry: 'Insurance, policies and claims',         url: 'https://fivetran-jasonchletsos.github.io/Insurance-ODI-Demo/',             accent: '#0369a1' },
  { key: 'media',           name: 'Lighthouse Media',     industry: 'Media, audience intelligence',           url: 'https://fivetran-jasonchletsos.github.io/Media-ODI-Demo/',                 accent: '#7c3aed' },
  { key: 'retail',          name: 'Storefront Analytics', industry: 'Retail and e-commerce',                  url: 'https://fivetran-jasonchletsos.github.io/RetailEcom-ODI-Demo/',            accent: '#ea580c' },
  { key: 'techsaas',        name: 'SaaS Pulse',           industry: 'Tech, SaaS analytics',                   url: 'https://fivetran-jasonchletsos.github.io/TechSaaS-ODI-Demo/',              accent: '#059669' },
  { key: 'supplychain',     name: 'Manifest',             industry: 'Supply chain, logistics',                url: 'https://fivetran-jasonchletsos.github.io/SupplyChain-ODI-Demo/',           accent: '#0891b2' },
  { key: 'lifesci',         name: 'Cohort',               industry: 'Life sciences, clinical research',       url: 'https://fivetran-jasonchletsos.github.io/LifeSci-ODI-Demo/',               accent: '#be185d' },
  { key: 'energy',          name: 'Helios Grid',          industry: 'Energy and utilities, grid operations',  url: 'https://fivetran-jasonchletsos.github.io/Energy-Utilities-ODI-Demo/',      accent: '#06b6d4' },
  { key: 'mission-control', name: 'Mission Control',      industry: 'Admin, governance and observability',    url: 'https://fivetran-jasonchletsos.github.io/ODI-Mission-Control/',            accent: '#22d3ee' },
];
const CURRENT_DEMO = 'energy';

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  return (
    <div className="min-h-full flex flex-col bg-[var(--paper)]">
      <div className="scada-rail" />

      <header className="bg-[var(--navy-deep)] text-white sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="flex h-16 sm:h-20 items-center justify-between gap-2 sm:gap-6">
            <Link to="/" className="flex items-center gap-3 shrink-0 min-w-0 group">
              <div className="h-10 w-10 rounded-sm flex items-center justify-center" style={{ background: 'var(--cyan)' }}>
                <HeliosMark className="h-6 w-6 text-[var(--navy-deep)]" />
              </div>
              <div className="leading-tight min-w-0">
                <div className="font-semibold text-lg sm:text-xl tracking-tight truncate">
                  Helios Grid
                </div>
                <div className="mt-0.5 text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--cyan-bright)]">
                  Grid Operations Intelligence
                </div>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-0.5 text-sm">
              {NAV.map(([to, label]) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `relative px-2.5 py-2 font-medium tracking-tight transition-colors text-[13px] ${
                      isActive ? 'text-[var(--cyan-bright)]' : 'text-white/80 hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {label}
                      {isActive && (
                        <span className="absolute left-2.5 right-2.5 -bottom-[1px] h-[2px]" style={{ background: 'var(--cyan)' }} />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-1 sm:gap-2">
              <DemoSwitcher />
              <button
                type="button"
                onClick={() => setMobileOpen((o) => !o)}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                className="lg:hidden h-9 w-9 inline-flex items-center justify-center rounded-sm text-white/80 hover:bg-white/10"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  {mobileOpen ? <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" /> : <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />}
                </svg>
              </button>
            </div>
          </div>

          {mobileOpen && (
            <div className="lg:hidden pb-4 border-t border-white/10 pt-3 space-y-3">
              <nav className="grid grid-cols-2 gap-1 text-sm">
                {NAV.map(([to, label]) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/'}
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-sm text-center font-medium border ${
                        isActive
                          ? 'bg-[var(--cyan)] text-[var(--navy-deep)] border-[var(--cyan)]'
                          : 'border-white/15 text-white/80 hover:bg-white/10'
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-[var(--hairline)] bg-[var(--navy-deep)] text-white/80 mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-sm flex items-center justify-center" style={{ background: 'var(--cyan)' }}>
                <HeliosMark className="h-4 w-4 text-[var(--navy-deep)]" />
              </div>
              <div className="font-semibold text-white">Helios Grid</div>
            </div>
            <p className="leading-relaxed text-white/60">
              Reference build for grid operations on Fivetran Open Data Infrastructure.
              Synthetic data, for ODI architecture demonstration only.
            </p>
          </div>
          <div>
            <div className="eyebrow-light mb-2">Data Pipeline</div>
            <p className="leading-relaxed text-white/70">
              SAP IS-U, OSIsoft PI, Itron AMI, Salesforce, GIS, NOAA via Fivetran into Snowflake plus Apache Iceberg, modeled by dbt (bronze, silver, gold, platinum).
            </p>
          </div>
          <div>
            <div className="eyebrow-light mb-2">Open Standards</div>
            <p className="leading-relaxed text-white/70">
              Apache Iceberg, ANSI SQL, dbt semantic layer. Snowflake, Athena, Spark, Trino read the same files. No lock-in.
            </p>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 text-[11px] text-white/50 flex flex-col sm:flex-row gap-1 sm:items-center sm:justify-between">
            <div>© 2026 Helios Grid ODI Demo, Fivetran Open Data Infrastructure</div>
            <div className="mono">SCADA snapshot 2026-05-21 06:00 MST</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function DemoSwitcher() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        title="Snowflake gold layer, switch demo"
        className="inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider border bg-[var(--cyan)]/15 text-[var(--cyan-bright)] border-[var(--cyan)]/40 hover:bg-[var(--cyan)]/25 transition-colors"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--cyan-bright)] animate-pulse" />
        Snowflake snapshot
        <svg viewBox="0 0 24 24" className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full mt-2 w-[280px] rounded-sm border border-[var(--hairline)] bg-white shadow-xl z-40 overflow-hidden">
          <div className="px-3 pt-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-muted)] border-b border-[var(--hairline)]">
            Switch demo
          </div>
          <div className="py-1 max-h-[60vh] overflow-y-auto">
            {DEMOS.map((d) => {
              const current = d.key === CURRENT_DEMO;
              const inner = (
                <div className="flex items-center gap-2.5 px-3 py-2">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: d.accent }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-[var(--ink-strong)] truncate">{d.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{d.industry}</div>
                  </div>
                  {current && (
                    <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-600 border border-slate-200">
                      Current
                    </span>
                  )}
                </div>
              );
              return current ? (
                <div key={d.key} className="opacity-60 cursor-default">{inner}</div>
              ) : (
                <a key={d.key} href={d.url} className="block hover:bg-slate-50 transition-colors" onClick={() => setOpen(false)}>{inner}</a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function HeliosMark({ className = '' }: { className?: string }) {
  // Sun-rays + grid bolt mark
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2 L12 5 M12 19 L12 22 M2 12 L5 12 M19 12 L22 12 M4.9 4.9 L7 7 M17 17 L19.1 19.1 M4.9 19.1 L7 17 M17 7 L19.1 4.9" />
      <path d="M13 9 L10.5 12.5 L12.5 12.5 L11 15" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
