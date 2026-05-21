export default function ArchitecturePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <div className="eyebrow mb-1">Reference Architecture</div>
        <h1 className="text-3xl font-semibold tracking-tight">ODI for a regulated electric utility</h1>
        <p className="mt-3 text-[var(--ink-muted)] max-w-3xl">
          Helios Grid bridges OT (SCADA, PI historian) and IT (CIS, CRM, GIS, work orders) into a single
          customer-owned Iceberg lake on S3, modeled by dbt and queried by Snowflake, Athena, and AI agents.
        </p>
      </header>

      <section className="ops-card p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-stretch">
          <Box title="Sources" subtitle="OT + IT" color="#475569" items={[
            'OSIsoft PI System',
            'SAP IS-U (CIS/billing)',
            'Itron OpenWay AMI',
            'Salesforce',
            'Esri ArcGIS',
            'NOAA NDFD',
            'IBM Maximo',
          ]} />
          <Arrow label="Fivetran" />
          <Box title="Lake" subtitle="Customer-owned S3" color="#0a1f3a" items={[
            'Apache Iceberg v2',
            'AWS Glue catalog',
            'helios-odi-lake bucket',
            'bronze · silver · gold · platinum',
          ]} dark />
          <Arrow label="dbt" />
          <Box title="Compute" subtitle="Many engines" color="#06b6d4" items={[
            'Snowflake (ops)',
            'AWS Athena (PUC reporting)',
            'Spark (forecast model)',
            'Trino / DuckDB (ad-hoc)',
          ]} />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Data sources, in detail</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SOURCES.map((s) => (
            <article key={s.name} className="ops-card p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-[var(--ink-strong)]">{s.name}</h3>
                <span className={`status-pill ${s.layer === 'OT' ? 'warn' : 'cyan'}`}>{s.layer}</span>
              </div>
              <p className="text-sm text-[var(--ink-muted)] mt-2">{s.detail}</p>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div><dt className="text-[var(--ink-soft)] uppercase tracking-wider">Mechanism</dt><dd className="mono font-semibold">Fivetran</dd></div>
                <div><dt className="text-[var(--ink-soft)] uppercase tracking-wider">Cadence</dt><dd className="mono font-semibold">{s.cadence}</dd></div>
                <div><dt className="text-[var(--ink-soft)] uppercase tracking-wider">Tables</dt><dd className="mono font-semibold">{s.tables}</dd></div>
                <div><dt className="text-[var(--ink-soft)] uppercase tracking-wider">Daily rows</dt><dd className="mono font-semibold">{s.rows}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">dbt model layers</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {LAYERS.map((l) => (
            <div key={l.layer} className="ops-card p-4">
              <div className={`layer-chip ${l.chip} inline-flex mb-2`}>{l.layer}</div>
              <div className="text-sm text-[var(--ink-muted)] leading-relaxed">{l.desc}</div>
              <ul className="mt-3 text-xs space-y-1 text-[var(--ink-soft)] mono">
                {l.examples.map((e) => <li key={e}>• {e}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="ops-card p-6 bg-[var(--navy-deep)] text-white">
        <div className="eyebrow-light mb-2">Why open table format matters here</div>
        <p className="text-white/85 leading-relaxed">
          Utility regulators routinely ask "what did the grid look like at 02:14:36 MST on the night of the storm?"
          With Iceberg time-travel the ops team can answer that without restoring backups. ESG audits run against
          the same files the dispatch agents see. And when the state PUC mandates a new emissions calculation
          methodology, the schema evolves in place — no expensive backfill, no parallel system.
        </p>
      </section>
    </div>
  );
}

function Box({ title, subtitle, items, color, dark }: { title: string; subtitle: string; items: string[]; color: string; dark?: boolean }) {
  return (
    <div className={`md:col-span-2 rounded-md p-4 border ${dark ? 'text-white' : ''}`} style={{ background: dark ? color : '#fff', borderColor: color }}>
      <div className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: dark ? '#22d3ee' : color }}>{subtitle}</div>
      <div className={`text-base font-semibold mt-0.5 ${dark ? 'text-white' : 'text-[var(--ink-strong)]'}`}>{title}</div>
      <ul className={`mt-3 space-y-1 text-xs mono ${dark ? 'text-white/80' : 'text-[var(--ink-muted)]'}`}>
        {items.map((i) => <li key={i}>{i}</li>)}
      </ul>
    </div>
  );
}

function Arrow({ label }: { label: string }) {
  return (
    <div className="md:col-span-1 flex flex-col items-center justify-center text-center py-2">
      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--cyan-dim)] mb-1">{label}</div>
      <svg viewBox="0 0 60 24" className="w-full max-w-[80px]" fill="none" stroke="#06b6d4" strokeWidth="2">
        <path d="M2 12 L52 12" />
        <path d="M44 4 L52 12 L44 20" />
      </svg>
    </div>
  );
}

const SOURCES = [
  { name: 'OSIsoft PI System',     layer: 'OT', detail: 'SCADA historian. ~2.8B tag values per day across breakers, transformers, generators, and weather stations.', cadence: '5-second polled', tables: '38',  rows: '41.2M' },
  { name: 'Itron OpenWay AMI',     layer: 'OT', detail: 'Smart-meter intervals from 2.4M meters. Last-gasp messages feed outage detection.',                       cadence: '15-minute',     tables: '24',  rows: '57.8M' },
  { name: 'SAP IS-U',              layer: 'IT', detail: 'Customer information system, billing determinants, rate classes, service-point geometry.',                 cadence: 'CDC streaming',  tables: '142', rows: '4.8M'  },
  { name: 'Salesforce',            layer: 'IT', detail: 'Commercial and industrial customer accounts, account team assignments, large-customer outage notifications.',cadence: '5-minute',      tables: '86',  rows: '98K'   },
  { name: 'Esri ArcGIS',           layer: 'IT', detail: 'Asset locations, feeder topology, right-of-way polygons, vegetation management areas.',                    cadence: 'Hourly',         tables: '16',  rows: '125K'  },
  { name: 'NOAA NDFD',             layer: 'IT', detail: 'National Weather Service gridded forecasts (temperature, wind, humidity, lightning) for load forecasting.',cadence: 'Hourly',         tables: '8',   rows: '486K'  },
  { name: 'IBM Maximo',            layer: 'IT', detail: 'Work orders, planned maintenance, inspections, crew time tracking, post-event restoration logs.',          cadence: '15-minute',     tables: '41',  rows: '72K'   },
  { name: 'Internal storm desk',   layer: 'IT', detail: 'Operator annotations, switching orders, customer outage reports. Loaded via Fivetran CSV / SFTP.',         cadence: 'Hourly',         tables: '12',  rows: '8.4K'  },
];

const LAYERS = [
  { layer: 'Bronze',  chip: 'bronze', desc: 'Raw landings from Fivetran. Untransformed, source-typed, partition-by-load-day.',         examples: ['raw_pi_scada_intervals', 'raw_sap_isu_billing', 'raw_ami_meter_intervals'] },
  { layer: 'Silver',  chip: 'silver', desc: 'Conformed, deduped, joined. Unifies asset IDs across PI, GIS, and Maximo.',                examples: ['int_grid_load_5min', 'int_meter_intervals_hourly', 'int_asset_health'] },
  { layer: 'Gold',    chip: 'gold',   desc: 'Operational marts. What the ops portal, dispatch tools, and BI dashboards read.',           examples: ['mart_grid_status', 'mart_active_outages', 'mart_renewables_hourly'] },
  { layer: 'Platinum',chip: 'cyan',   desc: 'Agent-facing semantic + governed regulatory cubes. Strict contracts, signed for PUC use.',  examples: ['agent_grid_state', 'agent_outage_predictions', 'reg_puc_reliability'] },
];
