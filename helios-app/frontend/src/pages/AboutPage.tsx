export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Canonical ODI Story block — verbatim wording, theme adapted */}
      <section className="ops-card p-6 mb-10" style={{ borderColor: 'var(--cyan)' }}>
        <div className="eyebrow mb-2">The ODI Story</div>
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--ink-strong)]">
          Data infrastructure for agents you trust.
        </h2>
        <p className="mt-3 text-[var(--ink-muted)] leading-relaxed">
          <em>"MDS was optimized for humans. ODI is designed for a future with humans and
          production agents at scale."</em> This demo is one instance of that architecture:
          Fivetran's 750+ connectors and Managed Data Lake Service (MDLS) land data into open
          table formats; dbt transformations build the governed semantic layer; multiple compute
          engines and AI agents read the same gold tables.
        </p>
        <a
          href="https://fivetran-jasonchletsos.github.io/Fivetran-Demo-Repository/story/"
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold hover:underline"
          style={{ color: 'var(--cyan-dim)' }}
        >
          Read the full ODI Story →
        </a>
      </section>

      <header className="mb-8">
        <div className="eyebrow mb-1">ODI Reference Architecture</div>
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--ink-strong)]">About Helios Grid</h1>
        <p className="mt-3 text-[var(--ink-muted)] leading-relaxed">
          Helios Grid is a synthetic regional electric utility serving 2.4M customers across Arizona,
          New Mexico, and southern Nevada. The data shown here is a reference build of the same pattern
          a real IOU would deploy: SCADA historian readings, AMI interval data, CIS billing, GIS asset
          locations, and Salesforce commercial accounts unified into a customer-owned Iceberg lake with
          dbt building the operational marts. Snowflake is the primary compute, but Athena, Trino, Spark,
          and DuckDB read the same files.
        </p>
      </header>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mb-4">What this demo shows</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PILLARS.map((p) => (
            <div key={p.title} className="ops-card p-5">
              <div className="layer-chip cyan inline-flex mb-3">{p.tag}</div>
              <h3 className="text-lg font-semibold text-[var(--ink-strong)]">{p.title}</h3>
              <p className="mt-1 text-sm text-[var(--ink-muted)] leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mb-4">The utility-specific problem</h2>
        <div className="ops-card p-5">
          <p className="text-[var(--ink-muted)] leading-relaxed">
            A utility's data sits in two worlds that almost never speak. The OT side runs the grid, OSIsoft PI,
            EMS, SCADA, with millisecond tags and air-gapped networks. The IT side runs the business, SAP IS-U
            for billing, Salesforce for commercial accounts, Maximo for work orders, GIS for assets. Outage
            response, ESG reporting, and DER integration all require both sides at once. ODI is how you bridge
            them without forcing every analyst, agent, and regulator to negotiate ten point-to-point integrations.
          </p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mb-4">Tech stack</h2>
        <div className="ops-card p-5">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {STACK.map((s) => (
              <li key={s.name} className="flex items-start gap-3">
                <div className="layer-chip silver shrink-0 mt-0.5">{s.layer}</div>
                <div className="min-w-0">
                  <div className="font-semibold text-[var(--ink-strong)]">{s.name}</div>
                  <div className="text-xs text-[var(--ink-muted)]">{s.note}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mb-4">Data sources</h2>
        <div className="space-y-3">
          {DATA_SOURCES.map((s) => (
            <article key={s.title} className="ops-card p-5">
              <div className="flex items-start gap-3">
                <span className="layer-chip bronze shrink-0">Source</span>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-[var(--ink-strong)]">{s.title}</h3>
                  <p className="mt-1 text-sm text-[var(--ink-muted)] leading-relaxed">{s.description}</p>
                  <div className="mt-2 text-xs text-[var(--ink-soft)]">
                    <span className="font-semibold uppercase tracking-wider text-[10px]">Provides:</span> {s.provides}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mb-4">ODI vs MDS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="ops-card p-5">
            <div className="eyebrow mb-2">Traditional MDS</div>
            <h3 className="text-lg font-semibold text-[var(--ink-strong)]">Warehouse-centric</h3>
            <ul className="mt-3 space-y-2 text-sm text-[var(--ink-muted)]">
              <li>• Single proprietary warehouse owns storage and compute</li>
              <li>• Data exits via expensive egress or replication</li>
              <li>• Compute engine choice locked to vendor roadmap</li>
              <li>• Customer pays for storage twice (lake plus warehouse)</li>
              <li>• Schema evolution is vendor-managed</li>
            </ul>
          </div>
          <div className="ops-card p-5" style={{ borderColor: 'var(--cyan)' }}>
            <div className="eyebrow mb-2">Open Data Infrastructure</div>
            <h3 className="text-lg font-semibold text-[var(--ink-strong)]">Open lake-centric</h3>
            <ul className="mt-3 space-y-2 text-sm text-[var(--ink)]">
              <li>• Customer owns the storage layer (S3 plus Iceberg)</li>
              <li>• Any compute engine, Snowflake, Athena, Trino, Spark, DuckDB</li>
              <li>• Catalog is open (Glue, Nessie, Polaris)</li>
              <li>• Pay once for storage, swap compute as workloads evolve</li>
              <li>• Schema evolution is in the Iceberg spec, vendor-neutral</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-10 rounded-sm bg-[var(--paper-deep)] border border-[var(--hairline)] p-5 text-sm text-[var(--ink)]">
        <div className="eyebrow mb-2" style={{ color: 'var(--warn)' }}>Disclaimer</div>
        <p className="text-[var(--ink-muted)] leading-relaxed">
          <strong className="text-[var(--ink-strong)]">All data shown is synthetic.</strong>{' '}
          Helios Grid is a fictional utility. Service-area boundaries, customer counts, outage incidents,
          generation mix, and ESG numbers are invented for the purpose of demonstrating the ODI architecture
          and are not representative of any real operator.
        </p>
      </section>
    </div>
  );
}

const PILLARS = [
  { tag: 'Pillar 1', title: 'Customer-owned storage', body: 'Every byte from SCADA, AMI, and CIS lands in the utility\'s own S3 bucket as Apache Iceberg tables. Fivetran writes; the utility reads.' },
  { tag: 'Pillar 2', title: 'Open table format',     body: 'Iceberg v2 gives ACID transactions, schema evolution (PI tag renames), time-travel queries, and partition evolution. Auditable for state-PUC.' },
  { tag: 'Pillar 3', title: 'Any compute engine',    body: 'Snowflake serves dispatch and forecasting. Athena serves regulatory reporting. Spark feeds the outage-prediction model. Same files.' },
];

const STACK = [
  { layer: 'Ingest',    name: 'Fivetran',                             note: 'Managed connectors for SAP IS-U, OSIsoft PI, Itron AMI, Salesforce, GIS, NOAA, Maximo. Schema evolution + retry built in.' },
  { layer: 'Storage',   name: 'Customer-owned S3 + Snowflake',        note: 'helios-odi-lake bucket holds bronze, silver, gold, platinum prefixes. Snowflake holds hot operational marts.' },
  { layer: 'Format',    name: 'Apache Iceberg v2',                    note: 'Parquet files, ZSTD-compressed. Glue catalog. Time-travel for after-the-fact outage forensics.' },
  { layer: 'Transform', name: 'dbt',                                  note: '184 models across bronze, silver, gold, platinum. dbt Cloud orchestrates. Source-freshness fires on connector lag.' },
  { layer: 'Query',     name: 'Snowflake (primary)',                  note: 'Operational marts queried by ops portal and forecasting service.' },
  { layer: 'Query',     name: 'AWS Athena (regulatory)',              note: 'Long-horizon ESG and PUC queries against the same Iceberg files. No data copy.' },
  { layer: 'Agents',    name: 'Custom outage agent + dbt-wizard',      note: 'Read the platinum agent_* tables. Same governance as the human portal.' },
  { layer: 'Frontend',  name: 'React 19, Vite, Tailwind, Recharts',   note: 'Static SPA on GitHub Pages. Reads JSON snapshots produced by the dbt gold layer.' },
];

const DATA_SOURCES = [
  { title: 'SAP IS-U — Customer Information System and billing', description: 'Helios runs SAP IS-U for the CIS and billing engine. Customer master, service points, rate classes, billing determinants, payment history.', provides: 'Customer master, billing usage, service-point geography' },
  { title: 'OSIsoft PI System — SCADA historian',                 description: 'Every breaker, transformer, and feeder publishes interval tags into the PI historian. The OT network is air-gapped; Fivetran reads from the read-only PI Web API replica.', provides: 'Grid load, voltage, frequency, breaker state, generator output' },
  { title: 'Itron OpenWay — AMI smart meter data',                description: 'Roughly 2.4M smart meters reporting 15-minute interval data. Used for outage detection (last-gasp messages), demand response settlement, and rate-design analytics.', provides: 'Meter intervals, last-gasp, demand response events' },
  { title: 'Salesforce — Commercial customer accounts',           description: 'Industrial and commercial customer relationships, rate negotiations, account team assignments, and large-customer outage notifications.', provides: 'Industrial accounts, commercial contacts, rate-case history' },
  { title: 'Esri ArcGIS — Asset locations',                       description: 'Authoritative GIS for poles, conductors, transformers, substations, right-of-way, and vegetation-management polygons.', provides: 'Asset geometry, feeder topology, vegetation polygons' },
  { title: 'NOAA NDFD — Weather and load forecast inputs',        description: 'Public NWS / NDFD gridded weather forecasts feed the day-ahead load forecast and the wildfire / vegetation risk model.', provides: 'Temperature, wind, humidity, lightning forecasts' },
  { title: 'IBM Maximo — Work orders and inspections',            description: 'Field crew dispatch, planned maintenance, asset inspection results, and post-event restoration tracking.', provides: 'Work orders, inspections, crew time, restoration logs' },
];
