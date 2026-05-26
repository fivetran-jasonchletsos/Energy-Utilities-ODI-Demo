// Helios Grid — Open Data Infrastructure architecture page.
//
// Regulated electric utility: SCADA + AMI + outage + ESG. Snowflake is the
// primary engine; Athena / DuckDB / Trino / Spark stay listed as the same
// open-lake reads. Inlined Iceberg table list so the page renders without an
// API call during recordings.

import { useState, useEffect } from 'react';
import { AliveMedallion, type SourceNode, type EngineNode } from '../components/AliveMedallion';

const UTIL_SOURCES: SourceNode[] = [
  { id: 'cis',    label: 'CIS Billing',         sub: 'SQL Server log-CDC',    logo: 'sqlserver', freshness: '51s lag',  status: 'healthy', pipelineUrl: 'https://fivetran.com/dashboard/connectors/admire_jump' },
  { id: 'work',   label: 'Work Management',     sub: 'Oracle Binary Log Reader',        logo: 'oracle',    freshness: '3 min lag', status: 'healthy', pipelineUrl: 'https://fivetran.com/dashboard/connectors/cite_cotton' },
  { id: 'scada',  label: 'SCADA Telemetry',     sub: 'Grid sensor stream',     logo: 'hl7',       freshness: 'live',      status: 'healthy', streaming: true },
  { id: 'nerc',   label: 'NERC Compliance',     sub: 'Quarterly regulatory',  logo: 'cms',       freshness: '7d lag',   status: 'healthy' },
];

const UTIL_ENGINES: EngineNode[] = [
  { name: 'Snowflake', active: true,  logo: 'snowflake' },
  { name: 'Athena',                   logo: 'athena' },
  { name: 'DuckDB',                   logo: 'duckdb' },
  { name: 'Trino',                    logo: 'trino' },
  { name: 'Spark',                    logo: 'spark' },
];

const UTIL_ROLES = [
  { label: 'Grid Ops',         sub: 'load & outages' },
  { label: 'Customer Service', sub: 'billing & comms' },
  { label: 'Field Service',    sub: 'crews & SLAs' },
  { label: 'Compliance',       sub: 'NERC & PUC filings' },
];

// ─── Types (local) ──────────────────────────────────────────────────────────

interface IcebergTable {
  database: 'bronze' | 'silver' | 'gold';
  table: string;
  source_system: string;
  rows: number;
  bytes: number;
  schema_columns: number;
  partitions: string[];
  last_updated_at: string;
}

interface QueryEngine {
  name: 'Snowflake' | 'Athena' | 'DuckDB' | 'Trino' | 'Spark';
  status: 'active' | 'available' | 'demo';
  description: string;
  sample_query: string;
}

const TABLES: IcebergTable[] = [
  { database: 'bronze', table: 'bronze.cis__account',             source_system: 'sql_server · CIS Billing',   rows: 2_412_820, bytes: 1_318_440_000, schema_columns: 92,  partitions: ['ingest_date'],     last_updated_at: '2026-05-24T07:14:00Z' },
  { database: 'bronze', table: 'bronze.cis__service_point',       source_system: 'sql_server · CIS Billing',   rows: 2_482_220, bytes: 1_140_000_000, schema_columns: 64,  partitions: ['ingest_date'],     last_updated_at: '2026-05-24T07:14:00Z' },
  { database: 'bronze', table: 'bronze.cis__billing',             source_system: 'sql_server · CIS Billing',   rows: 18_142_200,bytes: 5_410_000_000, schema_columns: 71,  partitions: ['ingest_date'],     last_updated_at: '2026-05-24T07:14:00Z' },
  { database: 'bronze', table: 'bronze.cis__rate_class',          source_system: 'sql_server · CIS Billing',   rows: 1_842_200, bytes: 462_000_000,   schema_columns: 38,  partitions: ['ingest_date'],     last_updated_at: '2026-05-24T07:14:00Z' },
  { database: 'bronze', table: 'bronze.work__work_order',         source_system: 'oracle · Maximo',             rows: 864_200,   bytes: 612_000_000,   schema_columns: 84,  partitions: ['ingest_date'],     last_updated_at: '2026-05-24T07:11:00Z' },
  { database: 'bronze', table: 'bronze.work__crew_assignment',    source_system: 'oracle · Maximo',             rows: 412_820,   bytes: 224_000_000,   schema_columns: 28,  partitions: ['ingest_date'],     last_updated_at: '2026-05-24T07:11:00Z' },
  { database: 'bronze', table: 'bronze.scada__tag_values',        source_system: 'kafka · OSIsoft PI',          rows: 41_240_000,bytes: 9_810_000_000, schema_columns: 14,  partitions: ['ingest_hour'],     last_updated_at: '2026-05-24T07:12:00Z' },
  { database: 'bronze', table: 'bronze.scada__breaker_events',    source_system: 'kafka · OSIsoft PI',          rows: 184_000,   bytes: 92_000_000,    schema_columns: 22,  partitions: ['ingest_hour'],     last_updated_at: '2026-05-24T07:12:00Z' },
  { database: 'bronze', table: 'bronze.ami__meter_intervals',     source_system: 'kafka · Itron OpenWay',       rows: 57_800_000,bytes: 12_410_000_000,schema_columns: 18,  partitions: ['ingest_date'],     last_updated_at: '2026-05-24T07:13:00Z' },
  { database: 'bronze', table: 'bronze.nerc__compliance_filings', source_system: 'http · NERC',                 rows: 12_460,    bytes: 18_400_000,    schema_columns: 32,  partitions: [],                  last_updated_at: '2026-05-21T03:00:00Z' },

  { database: 'silver', table: 'silver.int_grid_load_5min',       source_system: 'dbt · merged',                rows: 8_842_200, bytes: 1_980_000_000, schema_columns: 22,  partitions: ['interval_date'],   last_updated_at: '2026-05-24T07:18:00Z' },
  { database: 'silver', table: 'silver.int_meter_intervals_hourly', source_system: 'dbt · merged',             rows: 14_412_820,bytes: 3_224_000_000, schema_columns: 18,  partitions: ['interval_date'],   last_updated_at: '2026-05-24T07:18:00Z' },
  { database: 'silver', table: 'silver.int_asset_health',         source_system: 'dbt · merged',                rows: 412_380,   bytes: 312_000_000,   schema_columns: 26,  partitions: ['region'],          last_updated_at: '2026-05-24T07:18:00Z' },
  { database: 'silver', table: 'silver.int_outages_reconciled',   source_system: 'dbt · merged',                rows: 142_200,   bytes: 184_000_000,   schema_columns: 31,  partitions: ['event_date'],      last_updated_at: '2026-05-24T07:18:00Z' },
  { database: 'silver', table: 'silver.int_billing_determinants', source_system: 'dbt · merged',                rows: 2_864_000, bytes: 1_640_000_000, schema_columns: 42,  partitions: ['billing_period'],  last_updated_at: '2026-05-24T07:18:00Z' },

  { database: 'gold',   table: 'gold.dim_service_points',         source_system: 'dbt mart',                    rows: 2_412_820, bytes: 484_000_000,   schema_columns: 38,  partitions: [],                  last_updated_at: '2026-05-24T07:22:00Z' },
  { database: 'gold',   table: 'gold.dim_assets',                 source_system: 'dbt mart',                    rows: 412_240,   bytes: 212_400_000,   schema_columns: 28,  partitions: [],                  last_updated_at: '2026-05-24T07:22:00Z' },
  { database: 'gold',   table: 'gold.dim_feeders',                source_system: 'dbt mart',                    rows: 860,       bytes: 480_000,       schema_columns: 14,  partitions: [],                  last_updated_at: '2026-05-24T07:22:00Z' },
  { database: 'gold',   table: 'gold.fct_grid_status',            source_system: 'dbt mart',                    rows: 8_842_200, bytes: 1_220_000_000, schema_columns: 24,  partitions: ['interval_month'],  last_updated_at: '2026-05-24T07:22:00Z' },
  { database: 'gold',   table: 'gold.fct_active_outages',         source_system: 'dbt mart',                    rows: 142_200,   bytes: 96_000_000,    schema_columns: 22,  partitions: ['event_month'],     last_updated_at: '2026-05-24T07:22:00Z' },
  { database: 'gold',   table: 'gold.fct_renewables_hourly',      source_system: 'dbt mart',                    rows: 1_842_200, bytes: 412_000_000,   schema_columns: 26,  partitions: ['interval_month'],  last_updated_at: '2026-05-24T07:22:00Z' },
  { database: 'gold',   table: 'gold.fct_esg_emissions',          source_system: 'dbt mart',                    rows: 412_820,   bytes: 184_000_000,   schema_columns: 18,  partitions: ['fiscal_quarter'],  last_updated_at: '2026-05-24T07:22:00Z' },
  { database: 'gold',   table: 'gold.fct_nerc_reliability',       source_system: 'dbt mart',                    rows: 184_220,   bytes: 96_000_000,    schema_columns: 31,  partitions: ['filing_quarter'],  last_updated_at: '2026-05-24T07:22:00Z' },
];

const ENGINES: QueryEngine[] = [
  {
    name: 'Snowflake',
    status: 'active',
    description: 'Primary engine for the gold layer. Reads Iceberg externals through Polaris catalog; auto-suspends between queries. Where the ops portal, the load-forecast estimator, and Cortex Analyst all land.',
    sample_query: `SELECT
  f.feeder_id, f.region,
  s.peak_mw_24h, s.avg_voltage,
  o.outage_count_30d, o.saidi_minutes
FROM gold.dim_feeders          f
JOIN gold.fct_grid_status      s USING (feeder_id)
JOIN gold.fct_active_outages   o USING (feeder_id)
WHERE s.peak_mw_24h >= 80
  AND o.saidi_minutes >= 30
ORDER BY o.saidi_minutes DESC
LIMIT 50;`,
  },
  {
    name: 'Athena',
    status: 'available',
    description: 'Serverless reads against the same Iceberg gold tables via Glue. Useful for PUC / NERC ad-hoc filings that should not pay for warehouse time.',
    sample_query: `SELECT region, COUNT(*) AS outages_30d
FROM gold.fct_active_outages
WHERE event_date >= current_date - interval '30' day
GROUP BY region
ORDER BY outages_30d DESC;`,
  },
  {
    name: 'DuckDB',
    status: 'available',
    description: 'Engineer\'s laptop. Same Iceberg tables, queried directly from S3 with the iceberg extension. Tiny ad-hoc joins without spinning up anything.',
    sample_query: `INSTALL iceberg;
LOAD iceberg;

SELECT *
FROM iceberg_scan('s3://helios-odi-lake/gold/fct_active_outages/')
WHERE cause_code IN ('VEG','EQUIP_FAIL')
LIMIT 100;`,
  },
  {
    name: 'Trino',
    status: 'available',
    description: 'Federated engine that joins the lake to other relational sources (ISO settlement systems, GIS replicas) without copying data first.',
    sample_query: `SELECT a.region, AVG(a.health_score) AS avg_health
FROM iceberg.gold.dim_assets a
JOIN postgres.gis.feeder_topology g
  ON g.feeder_id = a.feeder_id
WHERE a.asset_class = 'transformer'
GROUP BY a.region;`,
  },
  {
    name: 'Spark',
    status: 'available',
    description: 'Distributed compute for load-forecast ML training and large SCADA cohort joins. Reads the same Iceberg tables via the spark-iceberg runtime.',
    sample_query: `df = spark.read.format("iceberg")\\
  .load("gold.fct_grid_status")
df.groupBy("region", "interval_month")\\
  .agg({"peak_mw_24h": "avg"})\\
  .show()`,
  },
];

const ENGINE_COLORS: Record<QueryEngine['name'], string> = {
  Snowflake: '#29b5e8',
  Athena:    '#b8975c',
  DuckDB:    '#0b2545',
  Trino:     '#1d4e89',
  Spark:     '#b45309',
};

// ─── Number formatters ──────────────────────────────────────────────────────

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatBytes(b: number): string {
  if (b >= 1_000_000_000) return `${(b / 1_000_000_000).toFixed(2)} GB`;
  if (b >= 1_000_000)     return `${(b / 1_000_000).toFixed(1)} MB`;
  if (b >= 1_000)         return `${(b / 1_000).toFixed(1)} KB`;
  return `${b} B`;
}

// =============================================================================
// Page
// =============================================================================

export default function ArchitecturePage() {
  const [activeEngine, setActiveEngine] = useState<QueryEngine>(ENGINES[0]);

  const byLayer = (l: 'bronze' | 'silver' | 'gold') => TABLES.filter((t) => t.database === l);
  const layerStats = (l: 'bronze' | 'silver' | 'gold') => {
    const t = byLayer(l);
    return { tables: t.length, rows: t.reduce((s, r) => s + r.rows, 0), bytes: t.reduce((s, r) => s + r.bytes, 0) };
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 border-b border-[var(--hairline)] pb-6">
        <div className="eyebrow mb-1">Open Data Infrastructure</div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--ink-strong)]">
          One lake. Every engine. The whole grid story.
        </h1>
        <p className="mt-3 text-[var(--ink-muted)] max-w-3xl leading-relaxed">
          Helios Grid treats <em>storage</em>, <em>catalog</em>, and <em>compute</em> as three
          independently swappable layers. Iceberg is the storage spec. Glue is the catalog.
          Snowflake, Athena, DuckDB, Trino, and Spark can all read the same tables &mdash; no copy,
          no extract, no proprietary format between the SCADA tag and the regulator.
        </p>
      </header>

      <ThroughputHero />

      <section className="ops-card p-6 sm:p-8 mb-8" style={cardStyle}>
        <div className="eyebrow mb-1">Data Flow</div>
        <h2 className="text-2xl font-semibold text-[var(--ink-strong)] mb-6">
          From CIS, Maximo, SCADA, and NERC filings to one governed gold layer
        </h2>

        <AliveMedallion
          sources={UTIL_SOURCES}
          bronze={{ ...layerStats('bronze'), trend: [180, 195, 210, 222, 240, 255, 270] }}
          silver={{ ...layerStats('silver'), trend: [120, 130, 142, 155, 168, 180, 192] }}
          gold={{   ...layerStats('gold'),   trend: [80, 88, 95, 104, 112, 124, 138] }}
          engines={UTIL_ENGINES}
          roles={UTIL_ROLES}
          accent="#06b6d4"
        />

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[var(--ink-muted)]">
          <LayerDetail layer="bronze" stats={layerStats('bronze')} desc="Raw rows landed by Fivetran. 1:1 with source. CDC kept current within five minutes; SCADA Kafka stream lands sub-second." />
          <LayerDetail layer="silver" stats={layerStats('silver')} desc="Conformed dims and facts. Asset IDs reconciled across PI, GIS, CIS, and Maximo." />
          <LayerDetail layer="gold"   stats={layerStats('gold')}   desc="Business-ready marts + the dbt semantic layer. What every grid-ops surface reads." />
        </div>
      </section>

      <SchemaEvolutionTicker />
      <CostPanel />
      <FailureRecoveryPanel />
      <DataContractsPanel />
      <LineagePanel />

      <section className="ops-card overflow-hidden mb-8" style={cardStyle}>
        <header className="ops-card-header" style={cardHeaderStyle}>
          <div className="eyebrow">Compute is a choice</div>
          <h2 className="text-xl font-semibold text-[var(--ink-strong)] mt-0.5">
            Same Iceberg tables. Five engines. One query at a time.
          </h2>
          <p className="text-sm text-[var(--ink-muted)] mt-1">
            Pick a query engine &mdash; the SQL barely changes, but the operational, cost, and
            governance profile shifts dramatically. That choice belongs to the utility, not the vendor.
          </p>
        </header>

        <div className="px-5 pt-4 flex flex-wrap gap-2">
          {ENGINES.map((e) => (
            <button
              key={e.name}
              onClick={() => setActiveEngine(e)}
              className="px-3 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider border transition-all"
              style={
                activeEngine.name === e.name
                  ? { background: ENGINE_COLORS[e.name], borderColor: ENGINE_COLORS[e.name], color: '#ffffff' }
                  : { background: '#ffffff', color: 'var(--ink-muted)', borderColor: 'var(--hairline)' }
              }
            >
              {e.name}
              {e.status === 'active' && <span className="ml-1.5 text-[9px] opacity-80">● ACTIVE</span>}
              {e.status === 'demo'   && <span className="ml-1.5 text-[9px] opacity-60">DEMO</span>}
            </button>
          ))}
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2">
            <div className="text-[10px] uppercase tracking-wider text-[var(--ink-soft)] font-semibold mb-2">Query</div>
            <pre className="rounded-sm p-4 text-[11.5px] leading-relaxed overflow-x-auto font-mono" style={{ background: '#0a1f3a', color: '#e6f7fb' }}>
              <code>{activeEngine.sample_query}</code>
            </pre>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[var(--ink-soft)] font-semibold mb-2">Why this engine</div>
            <p className="text-sm text-[var(--ink-strong)] leading-relaxed">{activeEngine.description}</p>
            <div className="mt-4 pt-4 border-t border-[var(--hairline-soft)]">
              <div className="text-[10px] uppercase tracking-wider text-[var(--ink-soft)] font-semibold mb-1">Status</div>
              <div className="text-sm font-semibold" style={{ color: activeEngine.status === 'active' ? '#16a34a' : '#6b7280' }}>
                {activeEngine.status === 'active' ? '● Primary engine — powers this site' : 'Compatible and ready to wire in'}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ops-card overflow-hidden mb-8" style={cardStyle}>
        <header className="ops-card-header" style={cardHeaderStyle}>
          <div className="eyebrow">Iceberg Catalog</div>
          <h2 className="text-xl font-semibold text-[var(--ink-strong)] mt-0.5">
            Every table on the lake, registered in AWS Glue
          </h2>
          <p className="text-sm text-[var(--ink-muted)] mt-1">
            Open metadata. Every engine reads the same schema, the same partition layout, the same
            row counts &mdash; without anyone owning the "source of truth" exclusively.
          </p>
        </header>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
            <thead className="border-b border-[var(--hairline)]" style={{ background: 'var(--paper-deep)' }}>
              <tr>
                <Th>Layer</Th>
                <Th>Table</Th>
                <Th>Source</Th>
                <Th align="right">Rows</Th>
                <Th align="right">Size</Th>
                <Th align="right">Columns</Th>
                <Th>Partitions</Th>
                <Th align="right">Updated</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--hairline-soft)]">
              {TABLES.map((t) => (
                <tr key={`${t.database}.${t.table}`} className="hover:bg-[var(--paper-deep)] cursor-default">
                  <td className="px-4 py-2.5"><LayerChip layer={t.database} /></td>
                  <td className="px-4 py-2.5 font-mono text-[12px] text-[var(--ink-strong)]">{t.table}</td>
                  <td className="px-4 py-2.5 text-xs text-[var(--ink-muted)] font-mono">{t.source_system}</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-[var(--ink-strong)]">{formatNumber(t.rows)}</td>
                  <td className="px-4 py-2.5 text-right text-[var(--ink-strong)]">{formatBytes(t.bytes)}</td>
                  <td className="px-4 py-2.5 text-right text-[var(--ink-muted)]">{t.schema_columns}</td>
                  <td className="px-4 py-2.5 text-xs text-[var(--ink-muted)] font-mono">
                    {t.partitions.length ? t.partitions.join(', ') : <span className="text-[var(--ink-soft)]">—</span>}
                  </td>
                  <td className="px-4 py-2.5 text-right text-xs text-[var(--ink-muted)] font-mono">
                    {new Date(t.last_updated_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="ops-card overflow-hidden mb-8" style={cardStyle}>
        <header className="ops-card-header flex items-start justify-between gap-4" style={cardHeaderStyle}>
          <div>
            <div className="eyebrow" style={{ color: '#FF694A' }}>Data Quality · dbt Labs</div>
            <h2 className="text-xl font-semibold text-[var(--ink-strong)] mt-0.5">
              Every table tested. Every run. Same lake.
            </h2>
            <p className="text-sm text-[var(--ink-muted)] mt-1">
              Tests defined in dbt Labs run on every build, against the same Iceberg tables every
              engine reads. Failures block promotion to the next layer &mdash; bad data never
              reaches the control room. Paired with the Great Expectations checkpoints below:
              GX runs suite-based expectations against raw landings; dbt enforces SQL-native
              contracts across bronze, silver, and gold.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white shrink-0" style={{ background: '#FF694A' }}>
            dbt Labs
          </div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--hairline-soft)]">
          {[
            { layer: 'bronze' as const, tests: 24, passing: 24, monitors: ['freshness', 'volume', 'schema drift'],                                       color: '#b45309' },
            { layer: 'silver' as const, tests: 62, passing: 61, monitors: ['nulls', 'uniqueness', 'referential', 'accepted values'],                     color: '#6b7280' },
            { layer: 'gold'   as const, tests: 44, passing: 44, monitors: ['NERC CIP-tagged columns', 'feeder reconciliation', 'meter-billing match'],   color: '#06b6d4' },
          ].map((q) => {
            const ok = q.passing === q.tests;
            return (
              <div key={q.layer} className="p-5">
                <div className="flex items-center justify-between">
                  <LayerChip layer={q.layer} />
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: ok ? '#16a34a' : '#dc2626' }}>
                    {ok ? '● all passing' : `● ${q.tests - q.passing} warn`}
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <div className="text-3xl font-semibold text-[var(--ink-strong)]" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {q.passing}<span className="text-[var(--ink-soft)]">/{q.tests}</span>
                  </div>
                  <div className="text-xs text-[var(--ink-muted)]">tests · last run 12m ago</div>
                </div>
                <ul className="mt-3 space-y-1.5 text-xs text-[var(--ink-muted)]">
                  {q.monitors.map((m) => (
                    <li key={m} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full inline-block" style={{ background: q.color }} />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
        <div className="px-5 py-3 border-t border-[var(--hairline-soft)] flex items-center justify-between text-[11px] text-[var(--ink-soft)]" style={{ background: 'var(--paper-deep)' }}>
          <span className="font-mono">130 tests · 129 passing · 1 warn · 0 errors</span>
          <span className="uppercase tracking-wider font-semibold">dbt build · merged into Fivetran</span>
        </div>
      </section>

      <GreatExpectationsPanel />

      <BeforeAfterPanel />
    </div>
  );
}

// =============================================================================
// Helpers — shared styles + sub-components
// =============================================================================

const cardStyle = {
  background: '#ffffff',
  border: '1px solid var(--hairline)',
  borderRadius: '4px',
};

const cardHeaderStyle = {
  padding: '20px',
  borderBottom: '1px solid var(--hairline-soft)',
};

function Th({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <th className={`px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-soft)] ${align === 'right' ? 'text-right' : 'text-left'}`}>
      {children}
    </th>
  );
}

function LayerChip({ layer }: { layer: 'bronze' | 'silver' | 'gold' }) {
  const styles: Record<typeof layer, { bg: string; fg: string; border: string }> = {
    bronze: { bg: '#fef3c7', fg: '#92400e', border: '#b45309' },
    silver: { bg: '#f3f4f6', fg: '#374151', border: '#6b7280' },
    gold:   { bg: '#ecfeff', fg: '#0e7490', border: '#06b6d4' },
  };
  const s = styles[layer];
  return (
    <span className="inline-block text-[9px] font-bold uppercase tracking-[0.15em] px-1.5 py-0.5 rounded-sm border"
          style={{ background: s.bg, color: s.fg, borderColor: s.border }}>
      {layer}
    </span>
  );
}

function LayerDetail({ layer, stats, desc }: { layer: 'bronze' | 'silver' | 'gold'; stats: { tables: number; rows: number; bytes: number }; desc: string }) {
  return (
    <div className="border border-[var(--hairline)] rounded-sm p-3 bg-white">
      <div className="flex items-center justify-between mb-2">
        <LayerChip layer={layer} />
        <span className="text-[10px] text-[var(--ink-soft)] font-mono">{stats.tables} table{stats.tables === 1 ? '' : 's'}</span>
      </div>
      <div className="text-sm font-bold text-[var(--ink-strong)]" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {formatNumber(stats.rows)} rows · {formatBytes(stats.bytes)}
      </div>
      <div className="text-[11px] text-[var(--ink-muted)] mt-1 leading-snug">{desc}</div>
    </div>
  );
}

// =============================================================================
// ThroughputHero
// =============================================================================
function ThroughputHero() {
  const [rowsToday, setRowsToday] = useState(54_182_017);
  useEffect(() => {
    const id = setInterval(() => setRowsToday((n) => n + 60 + Math.floor(Math.random() * 90)), 600);
    return () => clearInterval(id);
  }, []);
  const trend = [38.2, 41.4, 44.6, 48.5, 50.7, 52.0, 54.18];
  return (
    <section className="mb-8 grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-3 sm:gap-4">
      <div className="ops-card p-5 sm:p-6 relative overflow-hidden" style={cardStyle}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 100% 0%, rgba(6,182,212,0.14), transparent 60%)' }} />
        <div className="relative">
          <div className="eyebrow" style={{ color: '#06b6d4' }}>● Live</div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[var(--ink-soft)] font-semibold">
            Rows in motion today
          </div>
          <div className="mt-2 font-semibold leading-none text-[var(--ink-strong)]"
               style={{ fontSize: 44, fontVariantNumeric: 'tabular-nums' }}>
            {rowsToday.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-[var(--ink-muted)]">across 4 sources · 23 Iceberg tables · CDC + SCADA Kafka stream</div>
        </div>
      </div>
      <Kpi label="SCADA freshness · p50" value="0.8s" sub="OSIsoft PI · Kafka stream" />
      <Kpi label="Bronze → Gold lag · p99" value="5 min" sub="Within 10-min SLO" />
      <Kpi label="Connector uptime · 90d" value="99.98%" sub={<Sparklike values={trend} />} />
    </section>
  );
}

function Kpi({ label, value, sub }: { label: string; value: string; sub: React.ReactNode }) {
  return (
    <div className="ops-card p-4 sm:p-5" style={cardStyle}>
      <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--ink-soft)] font-semibold">{label}</div>
      <div className="mt-1.5 font-semibold leading-none text-[var(--ink-strong)]"
           style={{ fontSize: 30, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
      <div className="mt-2 text-xs text-[var(--ink-muted)]">{sub}</div>
    </div>
  );
}

function Sparklike({ values }: { values: number[] }) {
  const max = Math.max(...values), min = Math.min(...values);
  const rng = max - min || 1;
  const w = 80, h = 18;
  const stepX = w / (values.length - 1);
  const pts = values.map((v, i) => `${(i * stepX).toFixed(1)},${(h - ((v - min) / rng) * h).toFixed(1)}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke="#06b6d4" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

// =============================================================================
// SchemaEvolutionTicker
// =============================================================================
const EVO_EVENTS = [
  { ts: '2026-05-24 06:14', op: 'ADD COLUMN renewable_pct',              table: 'bronze.scada__tag_values',       ms: 38, models: 4 },
  { ts: '2026-05-23 22:01', op: 'RENAME COLUMN cust_id → service_point_id', table: 'bronze.cis__service_point',  ms: 22, models: 6 },
  { ts: '2026-05-22 14:47', op: 'WIDEN INT → BIGINT meter_reading_wh',    table: 'silver.int_meter_intervals_hourly', ms: 41, models: 2 },
  { ts: '2026-05-21 09:30', op: 'ADD COLUMN nerc_critical_flag',          table: 'gold.dim_assets',                ms: 19, models: 8 },
  { ts: '2026-05-20 18:09', op: 'DROP COLUMN deprecated_cause_code',      table: 'bronze.scada__breaker_events',   ms: 28, models: 3 },
];
function SchemaEvolutionTicker() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((n) => (n + 1) % EVO_EVENTS.length), 4200);
    return () => clearInterval(id);
  }, []);
  const e = EVO_EVENTS[idx];
  return (
    <section className="mb-8 ops-card p-5 overflow-hidden relative" style={{ ...cardStyle, background: 'linear-gradient(90deg, #fff 0%, #f8fafc 100%)' }}>
      <div className="absolute top-0 right-0 bottom-0 w-1.5" style={{ background: 'linear-gradient(180deg, #06b6d4, #0a1f3a)' }} />
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="eyebrow" style={{ color: '#0e7490' }}>Iceberg · Schema evolution</div>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm" style={{ color: '#0e7490', background: '#ecfeff', border: '1px solid #a5f3fc' }}>
            ● Live feed
          </span>
        </div>
        <div className="font-mono text-[10px] text-[var(--ink-soft)]">last 5 schema changes</div>
      </div>
      <div className="mt-3 flex items-center gap-3 flex-wrap" style={{ fontVariantNumeric: 'tabular-nums' }}>
        <span className="font-mono text-[11px] text-[var(--ink-soft)]">{e.ts}</span>
        <span className="font-mono text-[13px] font-semibold text-[var(--ink-strong)]">{e.op}</span>
        <span className="font-mono text-[12px] text-[var(--ink-muted)]">on {e.table}</span>
      </div>
      <div className="mt-2 flex items-center gap-4 text-[12px] text-[var(--ink-muted)] flex-wrap">
        <span><strong className="text-[var(--ink-strong)]">{e.ms} ms</strong> · metadata-only operation</span>
        <span>•</span>
        <span>0 data rewritten · 0 downtime</span>
        <span>•</span>
        <span><strong className="text-[var(--ink-strong)]">{e.models}</strong> downstream dbt models auto-revalidated</span>
      </div>
      <div className="mt-3 text-[11px] text-[var(--ink-soft)] leading-relaxed">
        Apache Iceberg treats schema changes as table metadata, not file rewrites. The Modern Data Stack equivalent —
        an Oracle <code className="font-mono">ALTER TABLE ADD COLUMN</code> on a 57 M-row AMI table — locks the
        table for ~9 minutes during the rewrite. Same change in Iceberg: <strong>milliseconds, no lock</strong>.
      </div>
    </section>
  );
}

// =============================================================================
// CostPanel
// =============================================================================
function CostPanel() {
  return (
    <section className="mb-8 ops-card overflow-hidden" style={cardStyle}>
      <header className="ops-card-header" style={cardHeaderStyle}>
        <div className="flex items-baseline justify-between gap-4 flex-wrap">
          <div>
            <div className="eyebrow" style={{ color: '#0e7490' }}>FinOps</div>
            <h2 className="text-xl font-semibold text-[var(--ink-strong)] mt-0.5">
              What this costs to run, every day
            </h2>
            <p className="text-sm text-[var(--ink-muted)] mt-1 max-w-3xl">
              Storage and compute billed separately. Storage is essentially free at this scale; compute scales
              with workload because Snowflake warehouses auto-suspend when no one is reading.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white shrink-0" style={{ background: '#06b6d4' }}>
            −71% vs legacy
          </div>
        </div>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[var(--hairline-soft)]">
        <CostTile label="Storage · per day"   value="$1.84"  sub="6.8 TB across bronze/silver/gold · S3 Standard-IA" color="#16a34a" />
        <CostTile label="Compute · per day"   value="$6.42"  sub="Snowflake XS auto-suspend · dbt cloud · Athena ad-hoc" color="#06b6d4" />
        <CostTile label="Per-1k rows landed"  value="$0.0009" sub="All-in CDC + transform + serve"                  color="#0a1f3a" />
        <CostTile label="Equivalent MDS"      value="$28.10" sub="Internal benchmark · same data, warehouse-resident" color="#dc2626" />
      </div>
      <div className="px-5 py-3 border-t border-[var(--hairline-soft)] flex items-center justify-between text-[11px] text-[var(--ink-soft)] bg-[var(--paper-deep)]">
        <span>Compute curve: 65% of spend is the 7 AM–10 AM dispatch window. Idle hours bill at zero.</span>
        <span className="uppercase tracking-wider font-semibold">Cost-attribution: per-warehouse + per-dbt-model</span>
      </div>
    </section>
  );
}

function CostTile({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="p-5">
      <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--ink-soft)] font-semibold">{label}</div>
      <div className="mt-2 font-semibold leading-none" style={{ fontSize: 30, color, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
      <div className="mt-2 text-xs text-[var(--ink-muted)] leading-snug">{sub}</div>
    </div>
  );
}

// =============================================================================
// FailureRecoveryPanel
// =============================================================================
function FailureRecoveryPanel() {
  return (
    <section className="mb-8 ops-card overflow-hidden" style={cardStyle}>
      <header className="ops-card-header" style={cardHeaderStyle}>
        <div className="eyebrow" style={{ color: '#b45309' }}>Resilience · Recovery</div>
        <h2 className="text-xl font-semibold text-[var(--ink-strong)] mt-0.5">
          What happens when a connector fails
        </h2>
        <p className="text-sm text-[var(--ink-muted)] mt-1 max-w-3xl">
          Every Fivetran connector has automatic retry with exponential backoff; failed rows land in a
          dead-letter queue for replay; dbt builds gate gold on green silver. Below: the last 30 days.
        </p>
      </header>
      <div className="grid grid-cols-2 md:grid-cols-4 divide-y-0 md:divide-x divide-[var(--hairline-soft)]">
        <RecoveryTile label="Retry policy"          big="exp 5×"  sub="2s · 8s · 30s · 2m · 8m, then DLQ" />
        <RecoveryTile label="Dead-letter · current" big="22"      sub="rows held · 18 AMI dupe-key, 4 NERC late-arrive" color="#b45309" />
        <RecoveryTile label="MTTR · last 30d"       big="4 min"   sub="median · max 18 min during PI cert rotation" />
        <RecoveryTile label="Last incident"         big="6 d ago" sub="Replayed automatically in 2 min, zero data loss" color="#16a34a" />
      </div>
    </section>
  );
}

function RecoveryTile({ label, big, sub, color = 'var(--ink-strong)' }: { label: string; big: string; sub: string; color?: string }) {
  return (
    <div className="p-5">
      <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--ink-soft)] font-semibold">{label}</div>
      <div className="mt-1.5 font-semibold leading-none" style={{ fontSize: 26, color, fontVariantNumeric: 'tabular-nums' }}>
        {big}
      </div>
      <div className="mt-2 text-xs text-[var(--ink-muted)] leading-snug">{sub}</div>
    </div>
  );
}

// =============================================================================
// DataContractsPanel — NERC CIP + SOC 2 governance for a regulated utility
// =============================================================================
function DataContractsPanel() {
  return (
    <section className="mb-8 ops-card overflow-hidden" style={cardStyle}>
      <header className="ops-card-header flex items-start justify-between gap-4" style={cardHeaderStyle}>
        <div>
          <div className="eyebrow" style={{ color: '#0e7490' }}>Data Contracts · NERC CIP &amp; SOC 2</div>
          <h2 className="text-xl font-semibold text-[var(--ink-strong)] mt-0.5">
            Customer PII and BES cyber data never leave the lake without a policy
          </h2>
          <p className="text-sm text-[var(--ink-muted)] mt-1 max-w-3xl">
            Every column with customer PII or NERC CIP-tagged grid telemetry is tagged at ingest.
            Row-level access scopes by service territory. Column masking on SSN, address, account.
            Every read goes to an audit log.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white shrink-0" style={{ background: '#0a1f3a' }}>
          NERC CIP
        </div>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-[var(--hairline-soft)]">
        <div className="p-5">
          <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--ink-soft)] font-semibold mb-3">Policy coverage</div>
          <ul className="space-y-2 text-sm">
            <Policy label="PII / BES-cyber columns tagged" value="38 columns across 11 tables" />
            <Policy label="Row-level access policy"        value="service_territory_id scoped per role" />
            <Policy label="Column masking on read"         value="ssn · address · phone · account_number · meter_serial" />
            <Policy label="Audit log destination"          value="CloudTrail → S3 (7y) → Iceberg audit table" />
            <Policy label="De-identification path"         value="gold.fct_research_loadshapes uses NERC Safe Harbor de-id" />
          </ul>
        </div>
        <div className="p-5">
          <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--ink-soft)] font-semibold mb-3">Sample contract · gold.dim_service_points</div>
          <pre className="font-mono text-[11.5px] leading-relaxed overflow-x-auto rounded-sm p-3" style={{ background: '#0a1f3a', color: '#e6f7fb' }}><code>{`columns:
  - name: service_point_id
    tests: [unique, not_null]
    meta: { contains_pii: true, mask_policy: "tokenise" }
  - name: account_number
    tests: [not_null]
    meta: { contains_pii: true, mask_policy: "redact_full" }
  - name: service_address
    meta: { contains_pii: true, mask_policy: "city_only" }
  - name: service_territory_id
    tests: [relationships: dim_feeders]
    meta: { rls_partition_key: true }`}</code></pre>
        </div>
      </div>
    </section>
  );
}

function Policy({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-1.5 inline-block w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#0e7490' }} />
      <div className="flex-1">
        <span className="text-[var(--ink-strong)] font-semibold">{label}</span>
        <span className="text-[var(--ink-muted)]"> · {value}</span>
      </div>
    </li>
  );
}

// =============================================================================
// GreatExpectationsPanel — Fivetran-stewarded OSS data-quality gate
// =============================================================================
interface GxSuite {
  suite: string;
  table: string;
  layer: 'bronze' | 'silver' | 'gold';
  expectations: number;
  passing: number;
  last_run: string;
  why: string;
}

const GX_SUITES: GxSuite[] = [
  { suite: 'helios.ami.intervals.ranges',         table: 'bronze.ami__meter_intervals',     layer: 'bronze', expectations: 19, passing: 19, last_run: '07:13:12', why: 'kwh_delivered >= 0 · interval spike < 10× rolling-30d mean per meter · interval_end - interval_start == 15min · meter_id resolves to dim_service_points' },
  { suite: 'helios.scada.tag_values.bounds',      table: 'bronze.scada__tag_values',        layer: 'bronze', expectations: 16, passing: 16, last_run: '07:12:48', why: 'voltage_pu between 0.85 and 1.15 · tag_quality in OSIsoft PI quality codes · timestamp_utc monotonic per tag · feeder_id references dim_feeders' },
  { suite: 'helios.cis.billing.completeness',     table: 'bronze.cis__billing',             layer: 'bronze', expectations: 14, passing: 14, last_run: '07:14:22', why: 'account_id never null · billing_period_end > billing_period_start · rate_class in CIS rate-tariff value-set · total_due == sum(line_items)' },
  { suite: 'helios.scada.breaker_events.referential', table: 'bronze.scada__breaker_events', layer: 'bronze', expectations: 13, passing: 12, last_run: '07:12:51', why: 'event_type in {TRIP, RECLOSE, LOCKOUT, MANUAL_OPEN, MANUAL_CLOSE} · feeder_id references dim_feeders · cleared_at >= occurred_at · cause_code in NERC TADS taxonomy' },
  { suite: 'helios.silver.grid_load.continuity',  table: 'silver.int_grid_load_5min',       layer: 'silver', expectations: 17, passing: 17, last_run: '07:18:14', why: 'no 5-min gaps per feeder over 24h · load_mw between 0 and substation nameplate · sum(feeder_load) within 2% of substation total · region in service-territory geo bounds' },
  { suite: 'helios.silver.outages.referential',   table: 'silver.int_outages_reconciled',   layer: 'silver', expectations: 15, passing: 15, last_run: '07:18:33', why: 'one row per outage_event_id · customers_affected references dim_service_points · restoration_at >= reported_at · cause_code in NERC TADS set' },
  { suite: 'helios.gold.grid_status.contract',    table: 'gold.fct_grid_status',            layer: 'gold',   expectations: 18, passing: 18, last_run: '07:22:09', why: 'feeder_id unique within interval · peak_mw_24h <= feeder rating · saidi/saifi computed within 0.1% tolerance · region geo bounds match service territory' },
  { suite: 'helios.gold.nerc.compliance_tags',    table: 'gold.fct_nerc_reliability',       layer: 'gold',   expectations: 14, passing: 14, last_run: '07:22:21', why: 'NERC CIP tier tag present for BES assets · filing_quarter in {Q1-Q4} · reliability_metric in approved-metric set · reporter_id matches FERC-registered entity' },
  { suite: 'helios.gold.esg.emissions',           table: 'gold.fct_esg_emissions',          layer: 'gold',   expectations: 12, passing: 12, last_run: '07:22:35', why: 'scope in {1, 2, 3} · co2e_tonnes >= 0 · fiscal_quarter aligns with reporting calendar · facility_id resolves to dim_assets' },
];

function GreatExpectationsPanel() {
  const totals = GX_SUITES.reduce(
    (a, s) => ({ exp: a.exp + s.expectations, pass: a.pass + s.passing, suites: a.suites + 1 }),
    { exp: 0, pass: 0, suites: 0 },
  );
  const warns = totals.exp - totals.pass;

  return (
    <section className="mb-8 ops-card overflow-hidden" style={cardStyle}>
      <header className="ops-card-header flex items-start justify-between gap-4" style={cardHeaderStyle}>
        <div>
          <div className="eyebrow" style={{ color: '#9a3412' }}>Data Quality · Great Expectations</div>
          <h2 className="text-xl font-semibold text-[var(--ink-strong)] mt-0.5">
            Validation runs on Bronze before anything reaches Silver.
          </h2>
          <p className="text-sm text-[var(--ink-muted)] mt-1 max-w-3xl">
            Expectation suites define what "valid" looks like for each Helios table — AMI interval
            sanity (no negative kWh, no impossible spikes), SCADA per-unit voltage bounds, NERC
            compliance tags on every BES asset, time-series continuity across 5-minute feeder load.
            A failed expectation blocks promotion. Same lake, same Iceberg snapshots, just gated.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <div className="inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white" style={{ background: '#9a3412' }}>
            GX Core · OSS
          </div>
          <div className="text-[10px] text-[var(--ink-soft)] font-mono">Fivetran-stewarded</div>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 divide-y-0 md:divide-x divide-[var(--hairline-soft)]">
        <RecoveryTile label="Expectation suites"     big={String(totals.suites)} sub="across bronze · silver · gold layers" />
        <RecoveryTile label="Expectations · today"   big={`${totals.pass}/${totals.exp}`} sub={`${warns} warn · 0 errors · gates Silver promotion`} color={warns ? '#b45309' : '#16a34a'} />
        <RecoveryTile label="Checkpoint cadence"     big="every sync" sub="triggered by Fivetran sync-complete · runs before dbt build" />
        <RecoveryTile label="Failed-expectation queue" big="3 rows" sub="breaker-event cause_code outside NERC TADS taxonomy · held in dlq.gx_quarantine · auto-retried after suite update" color="#b45309" />
      </div>

      <div className="overflow-x-auto border-t border-[var(--hairline-soft)]">
        <table className="min-w-full text-sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
          <thead className="border-b border-[var(--hairline)]" style={{ background: 'var(--paper-deep)' }}>
            <tr>
              <Th>Layer</Th>
              <Th>Suite</Th>
              <Th>Table under test</Th>
              <Th align="right">Expectations</Th>
              <Th align="right">Last run</Th>
              <Th>What it asserts</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--hairline-soft)]">
            {GX_SUITES.map((s) => {
              const ok = s.passing === s.expectations;
              return (
                <tr key={s.suite} className="hover:bg-[var(--paper-deep)] cursor-default">
                  <td className="px-4 py-2.5"><LayerChip layer={s.layer} /></td>
                  <td className="px-4 py-2.5 font-mono text-[12px] text-[var(--ink-strong)]">{s.suite}</td>
                  <td className="px-4 py-2.5 text-xs text-[var(--ink-muted)] font-mono">{s.table}</td>
                  <td className="px-4 py-2.5 text-right font-semibold" style={{ color: ok ? '#16a34a' : '#b45309' }}>
                    {s.passing}/{s.expectations}
                    {!ok && <span className="ml-1 text-[10px] uppercase tracking-wider">warn</span>}
                  </td>
                  <td className="px-4 py-2.5 text-right text-xs text-[var(--ink-muted)] font-mono">{s.last_run}</td>
                  <td className="px-4 py-2.5 text-xs text-[var(--ink)] leading-snug max-w-md">{s.why}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-[var(--hairline-soft)] border-t border-[var(--hairline-soft)]">
        <div className="p-5">
          <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--ink-soft)] font-semibold mb-3">Sample expectation suite · helios.ami.intervals.ranges</div>
          <pre className="font-mono text-[11.5px] leading-relaxed overflow-x-auto rounded-sm p-3" style={{ background: '#0b2545', color: '#e6e9f0' }}><code>{`# helios_ami_intervals_ranges.yml
expectation_suite_name: helios.ami.intervals.ranges
data_asset_name: bronze.ami__meter_intervals

expectations:
  - expectation_type: expect_column_values_to_not_be_null
    kwargs: { column: meter_id }
  - expectation_type: expect_column_values_to_be_between
    kwargs: { column: kwh_delivered, min_value: 0, max_value: 200 }
  - expectation_type: expect_column_pair_values_a_to_be_less_than_b
    kwargs: { column_A: interval_start, column_B: interval_end }
  - expectation_type: expect_column_values_to_be_in_set
    kwargs:
      column: interval_minutes
      value_set: [5, 15, 30, 60]
  - expectation_type: expect_column_values_to_match_regex
    kwargs: { column: meter_id, regex: "^HEL-[0-9]{10}$" }
  - expectation_type: expect_table_row_count_to_be_between
    kwargs: { min_value: 40000000, max_value: 80000000 }
`}</code></pre>
        </div>
        <div className="p-5">
          <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--ink-soft)] font-semibold mb-3">How this fits the stack</div>
          <ul className="space-y-2.5 text-sm">
            <Policy label="Fivetran moves" value="CIS, Maximo, SCADA tag stream, AMI meter intervals, and NERC filings into Bronze (Iceberg)" />
            <Policy label="Great Expectations validates" value="Bronze landings against suites before Silver promotion" />
            <Policy label="dbt transforms" value="Silver + Gold marts; dbt tests assert SQL-level constraints" />
            <Policy label="Failed rows" value="route to dlq.gx_quarantine on the same lake; retried after suite update" />
            <Policy label="Open source" value="GX Core remains community-driven; Fivetran funds maintenance, ecosystem, and engineering investment" />
            <Policy label="Community" value="github.com/great-expectations/great_expectations · thousands of teams use GX outside Fivetran's customer base" />
          </ul>
          <div className="mt-4 pt-3 border-t border-[var(--hairline-soft)] text-[11px] text-[var(--ink-soft)] leading-relaxed">
            On May 13, 2026 Fivetran announced it is becoming steward of the Great Expectations open
            source community and the GX Core project, supporting ongoing maintenance, ecosystem
            integrations, and community engagement. Same open project, backed by sustained engineering.
          </div>
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// BeforeAfterPanel
// =============================================================================
function BeforeAfterPanel() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="ops-card p-6 border-l-4" style={{ ...cardStyle, borderLeftColor: '#dc2626' }}>
        <div className="eyebrow" style={{ color: '#dc2626' }}>Before · Modern Data Stack</div>
        <h3 className="mt-1 text-xl font-semibold text-[var(--ink-strong)]">16 hops · 3 copies of the bytes</h3>
        <pre className="font-mono text-[10.5px] leading-relaxed mt-4 p-3 rounded-sm overflow-x-auto" style={{ background: '#fef2f2', color: '#7f1d1d', border: '1px solid #fecaca' }}>{`Source → SFTP → Stitch → Snowflake (raw)
       → dbt → Snowflake (silver) → Snowflake (gold)
       → Census reverse-ETL → Hightouch → ESG vendor
       → PUC filing extract → Looker MV → analyst laptop`}</pre>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div><div className="text-[var(--ink-soft)] text-xs">Copies of the data</div><div className="text-2xl font-semibold text-[var(--ink-strong)]">3</div></div>
          <div><div className="text-[var(--ink-soft)] text-xs">Avg end-to-end latency</div><div className="text-2xl font-semibold text-[var(--ink-strong)]">18 hr</div></div>
          <div><div className="text-[var(--ink-soft)] text-xs">Daily run-rate</div><div className="text-2xl font-semibold text-[var(--ink-strong)]">$28.10</div></div>
          <div><div className="text-[var(--ink-soft)] text-xs">Schema change</div><div className="text-lg font-semibold text-[var(--ink-strong)]">9-min lock</div></div>
        </div>
      </div>
      <div className="ops-card p-6 border-l-4" style={{ ...cardStyle, borderLeftColor: '#06b6d4' }}>
        <div className="eyebrow" style={{ color: '#0e7490' }}>After · Open Data Infrastructure</div>
        <h3 className="mt-1 text-xl font-semibold text-[var(--ink-strong)]">5 hops · 1 copy of the bytes</h3>
        <pre className="font-mono text-[10.5px] leading-relaxed mt-4 p-3 rounded-sm overflow-x-auto" style={{ background: '#ecfeff', color: '#0a3548', border: '1px solid #a5f3fc' }}>{`Source → Fivetran CDC + Kafka → Iceberg bronze
       → dbt → Iceberg silver
       → dbt → Iceberg gold
       ↳ Snowflake · Athena · DuckDB · Trino · Spark
         (all reading the same bytes, no copies)`}</pre>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div><div className="text-[var(--ink-soft)] text-xs">Copies of the data</div><div className="text-2xl font-semibold" style={{ color: '#06b6d4' }}>1</div></div>
          <div><div className="text-[var(--ink-soft)] text-xs">Avg end-to-end latency</div><div className="text-2xl font-semibold" style={{ color: '#06b6d4' }}>5 min</div></div>
          <div><div className="text-[var(--ink-soft)] text-xs">Daily run-rate</div><div className="text-2xl font-semibold" style={{ color: '#06b6d4' }}>$8.26</div></div>
          <div><div className="text-[var(--ink-soft)] text-xs">Schema change</div><div className="text-lg font-semibold" style={{ color: '#06b6d4' }}>milliseconds</div></div>
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// LineagePanel — pick any gold model, see its upstream silver + bronze.
// =============================================================================
type LineageEdge = { from: string; to: string; tests?: string[] };

const LINEAGE_MAP: Record<string, { silver: string[]; bronze: string[]; edges: LineageEdge[]; story: string }> = {
  'gold.fct_active_outages': {
    silver: ['silver.int_outages_reconciled', 'silver.int_asset_health'],
    bronze: ['bronze.scada__breaker_events', 'bronze.ami__meter_intervals', 'bronze.work__work_order'],
    story:  'Outage facts reconciling SCADA breaker trips, AMI last-gasp messages, and Maximo dispatch tickets. Drives the live outage map and SAIDI / SAIFI reporting.',
    edges: [
      { from: 'bronze.scada__breaker_events', to: 'silver.int_outages_reconciled',  tests: ['not-null event_id'] },
      { from: 'bronze.ami__meter_intervals',  to: 'silver.int_outages_reconciled',  tests: ['streaming · 0.8 s p99'] },
      { from: 'bronze.work__work_order',      to: 'silver.int_outages_reconciled' },
      { from: 'silver.int_outages_reconciled', to: 'gold.fct_active_outages' },
      { from: 'silver.int_asset_health',       to: 'gold.fct_active_outages' },
    ],
  },
  'gold.fct_grid_status': {
    silver: ['silver.int_grid_load_5min'],
    bronze: ['bronze.scada__tag_values', 'bronze.cis__service_point'],
    story:  'Five-minute grid load aggregates joined to service-point geometry. Feeds the operations portal and the load-forecast model.',
    edges: [
      { from: 'bronze.scada__tag_values',   to: 'silver.int_grid_load_5min', tests: ['kafka · 5 s p99'] },
      { from: 'bronze.cis__service_point',  to: 'silver.int_grid_load_5min' },
      { from: 'silver.int_grid_load_5min',  to: 'gold.fct_grid_status' },
    ],
  },
  'gold.fct_nerc_reliability': {
    silver: ['silver.int_outages_reconciled', 'silver.int_billing_determinants'],
    bronze: ['bronze.nerc__compliance_filings', 'bronze.cis__billing'],
    story:  'NERC TPL-001 / TADS-style reliability metrics joined to billing determinants. The quarterly PUC filing comes off this table directly.',
    edges: [
      { from: 'bronze.nerc__compliance_filings', to: 'silver.int_outages_reconciled' },
      { from: 'bronze.cis__billing',             to: 'silver.int_billing_determinants' },
      { from: 'silver.int_outages_reconciled',   to: 'gold.fct_nerc_reliability' },
      { from: 'silver.int_billing_determinants', to: 'gold.fct_nerc_reliability' },
    ],
  },
  'gold.dim_service_points': {
    silver: ['silver.int_billing_determinants'],
    bronze: ['bronze.cis__service_point'],
    story:  'Master service-point dimension. PII-tagged, masked on read by role.',
    edges: [
      { from: 'bronze.cis__service_point',       to: 'silver.int_billing_determinants' },
      { from: 'silver.int_billing_determinants', to: 'gold.dim_service_points' },
    ],
  },
};

function LineagePanel() {
  const goldOptions = Object.keys(LINEAGE_MAP);
  const [selected, setSelected] = useState<string>(goldOptions[0]);
  const lin = LINEAGE_MAP[selected];

  const BX = 20, MX = 320, RX = 620;
  const COL_W = 280;
  const ROW_H = 38, ROW_GAP = 8;
  const maxRows = Math.max(lin.bronze.length, lin.silver.length, 1);
  const HEIGHT = Math.max(maxRows * (ROW_H + ROW_GAP) + 40, 240);

  const bronzeY = (i: number) => 30 + i * (ROW_H + ROW_GAP);
  const silverY = (i: number) => 30 + i * (ROW_H + ROW_GAP);
  const goldY = (HEIGHT - ROW_H) / 2;

  const nodeOf = (name: string): { x: number; y: number; w: number; h: number } | null => {
    const bi = lin.bronze.indexOf(name);
    if (bi >= 0) return { x: BX, y: bronzeY(bi), w: COL_W, h: ROW_H };
    const si = lin.silver.indexOf(name);
    if (si >= 0) return { x: MX, y: silverY(si), w: COL_W, h: ROW_H };
    if (name === selected) return { x: RX, y: goldY, w: COL_W, h: ROW_H };
    return null;
  };

  return (
    <section className="mb-8 ops-card overflow-hidden" style={cardStyle}>
      <header className="ops-card-header" style={cardHeaderStyle}>
        <div className="flex items-baseline justify-between gap-4 flex-wrap">
          <div>
            <div className="eyebrow" style={{ color: '#FF694A' }}>dbt · Column-level lineage</div>
            <h2 className="text-xl font-semibold text-[var(--ink-strong)] mt-0.5">
              Pick any gold model. See exactly where its bytes come from.
            </h2>
            <p className="text-sm text-[var(--ink-muted)] mt-1 max-w-3xl">
              dbt emits lineage as a side-effect of build. Every join, every transformation, every test
              is documented automatically. Click a gold model below to trace upstream &mdash; bronze
              landings to silver intermediates to the gold mart.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white shrink-0" style={{ background: '#FF694A' }}>
            dbt Labs
          </div>
        </div>
      </header>

      <div className="px-5 pt-4 flex flex-wrap gap-2">
        {goldOptions.map((g) => (
          <button
            key={g}
            onClick={() => setSelected(g)}
            className="px-3 py-2 rounded-sm text-[11.5px] font-mono border transition-all"
            style={
              selected === g
                ? { background: '#06b6d4', borderColor: '#06b6d4', color: '#fff' }
                : { background: '#fff', borderColor: 'var(--hairline)', color: 'var(--ink-muted)' }
            }
          >
            {g}
          </button>
        ))}
      </div>

      <div className="p-5">
        <p className="text-sm text-[var(--ink-strong)] mb-4 italic">{lin.story}</p>

        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${RX + COL_W + 20} ${HEIGHT}`} className="w-full" style={{ minWidth: 880, maxHeight: 360 }}>
            <defs>
              <marker id="lin-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 z" fill="#FF694A" />
              </marker>
            </defs>

            <text x={BX}        y={18} fontSize="10" fontWeight="700" fill="#826b3f" letterSpacing="1.6">BRONZE · raw</text>
            <text x={MX}        y={18} fontSize="10" fontWeight="700" fill="#374151" letterSpacing="1.6">SILVER · conformed</text>
            <text x={RX}        y={18} fontSize="10" fontWeight="700" fill="#0e7490" letterSpacing="1.6">GOLD · selected</text>

            {lin.edges.map((e, i) => {
              const a = nodeOf(e.from);
              const b = nodeOf(e.to);
              if (!a || !b) return null;
              const x1 = a.x + a.w, y1 = a.y + a.h / 2;
              const x2 = b.x,         y2 = b.y + b.h / 2;
              const mid = (x1 + x2) / 2;
              const d = `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`;
              return (
                <g key={i}>
                  <path d={d} fill="none" stroke="#FF694A" strokeWidth="1.6" strokeLinecap="round" markerEnd="url(#lin-arrow)" opacity="0.75" />
                  <circle r="2.5" fill="#FF694A">
                    <animateMotion dur={`${2.0 + i * 0.18}s`} repeatCount="indefinite" path={d} />
                    <animate attributeName="opacity" values="0;1;1;0" dur={`${2.0 + i * 0.18}s`} repeatCount="indefinite" />
                  </circle>
                  {e.tests && (
                    <g transform={`translate(${mid - 38}, ${(y1 + y2) / 2 - 8})`}>
                      <rect width="76" height="14" rx="3" fill="#FF694A" />
                      <text x="38" y="10" textAnchor="middle" fontSize="8.5" fontWeight="800" fill="#fff" letterSpacing="0.4">
                        {e.tests[0]}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {lin.bronze.map((t, i) => (
              <g key={t} transform={`translate(${BX}, ${bronzeY(i)})`}>
                <rect width={COL_W} height={ROW_H} rx="4" fill="#fef3c7" stroke="#b45309" strokeWidth="1" />
                <text x="12" y="14" fontSize="9" fontWeight="800" fill="#826b3f" letterSpacing="1.4">BRONZE</text>
                <text x="12" y="28" fontSize="11" fontWeight="700" fill="#0b1220" fontFamily="ui-monospace, monospace">{t}</text>
              </g>
            ))}

            {lin.silver.map((t, i) => (
              <g key={t} transform={`translate(${MX}, ${silverY(i)})`}>
                <rect width={COL_W} height={ROW_H} rx="4" fill="#f3f4f6" stroke="#6b7280" strokeWidth="1" />
                <text x="12" y="14" fontSize="9" fontWeight="800" fill="#374151" letterSpacing="1.4">SILVER</text>
                <text x="12" y="28" fontSize="11" fontWeight="700" fill="#0b1220" fontFamily="ui-monospace, monospace">{t}</text>
              </g>
            ))}

            <g transform={`translate(${RX}, ${goldY})`}>
              <rect width={COL_W} height={ROW_H} rx="4" fill="#ecfeff" stroke="#06b6d4" strokeWidth="2" />
              <text x="12" y="14" fontSize="9" fontWeight="800" fill="#0e7490" letterSpacing="1.4">GOLD</text>
              <text x="12" y="28" fontSize="11" fontWeight="700" fill="#0b1220" fontFamily="ui-monospace, monospace">{selected}</text>
            </g>
          </svg>
        </div>

        <div className="mt-4 flex items-center gap-4 text-[11px] text-[var(--ink-soft)] flex-wrap">
          <span className="inline-flex items-center gap-1.5"><span className="inline-block w-3 h-0.5" style={{ background: '#FF694A' }} /> dbt transformation (auto-emitted)</span>
          <span>•</span>
          <span><strong className="text-[var(--ink-strong)]">{lin.edges.length}</strong> column-level edges traced</span>
          <span>•</span>
          <span><strong className="text-[var(--ink-strong)]">{lin.bronze.length + lin.silver.length + 1}</strong> dbt models in the lineage graph</span>
          <span>•</span>
          <span>Lineage runs at every build · zero manual upkeep</span>
        </div>
      </div>
    </section>
  );
}
