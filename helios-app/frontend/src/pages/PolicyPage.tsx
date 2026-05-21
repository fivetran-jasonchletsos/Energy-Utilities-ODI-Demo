export default function PolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <div className="eyebrow mb-1">Policy Brief</div>
        <h1 className="text-3xl font-semibold tracking-tight">Why utility data is fragmented, and how ODI bridges it</h1>
      </header>

      <section className="ops-card p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">The OT-IT split</h2>
        <p className="text-[var(--ink-muted)] leading-relaxed">
          Electric utilities run two parallel data worlds. <strong>Operational technology (OT)</strong> covers
          SCADA, EMS, the PI historian, protective relays, and the AMI head-end. The OT network is air-gapped,
          read-only from the outside, audited under NERC CIP. Its job is to keep the lights on. <strong>Information
          technology (IT)</strong> covers CIS (SAP IS-U), CRM (Salesforce), GIS (Esri), work-management (Maximo),
          and finance. Its job is to run the business. Historically, these two worlds talked through nightly
          batch exports and a small army of Excel macros.
        </p>
      </section>

      <section className="ops-card p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">Why the split is now a problem</h2>
        <ul className="space-y-3 text-[var(--ink-muted)] leading-relaxed">
          <li><strong className="text-[var(--ink-strong)]">Outage response.</strong> Modern outage prediction needs SCADA telemetry, AMI last-gasps, GIS feeder topology, and the CRM-side commercial impact list — joined in seconds.</li>
          <li><strong className="text-[var(--ink-strong)]">DER integration.</strong> Net-metered solar, EV charging, and large-customer demand response straddle OT (the kW) and IT (the contract). Forecasting and settlement need both.</li>
          <li><strong className="text-[var(--ink-strong)]">ESG and PUC reporting.</strong> State commissions ask for Scope 1+2 quarterly, emissions intensity, and renewable-portfolio compliance — all of which require generation telemetry joined to fuel-mix accounting.</li>
          <li><strong className="text-[var(--ink-strong)]">AI agents.</strong> An outage-prediction agent has to read the same time-traveled, governed data the regulator audits. Otherwise the operator is left explaining the gap between two numbers in two systems.</li>
        </ul>
      </section>

      <section className="ops-card p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">How ODI bridges it</h2>
        <p className="text-[var(--ink-muted)] leading-relaxed mb-3">
          The Helios pattern lands every source — OT and IT — through Fivetran into a single customer-owned
          Iceberg lake. dbt builds the bronze, silver, gold, and platinum layers as a contract. From there:
        </p>
        <ul className="space-y-2 text-[var(--ink-muted)] leading-relaxed">
          <li>• Snowflake serves the dispatch portal and the day-ahead forecast.</li>
          <li>• Athena serves the long-horizon PUC and ESG queries on the same files.</li>
          <li>• Spark trains the outage-prediction model and writes back to <span className="mono">agent_outage_predictions</span>.</li>
          <li>• The customer-facing outage map reads the same gold layer.</li>
          <li>• Auditors get time-travel queries instead of a backup-restore project.</li>
        </ul>
      </section>

      <section className="ops-card p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">Why "Fivetran" is the right ingestion label</h2>
        <p className="text-[var(--ink-muted)] leading-relaxed">
          A utility's ingest layer needs to handle CDC from SAP, the PI Web API, Itron's OpenWay, Salesforce,
          Esri ArcGIS, NOAA, and Maximo — without one of those connectors being the bottleneck. Fivetran's
          managed connectors handle the auth, schema evolution, retry, and lag observability so the data team
          can focus on the dbt models, not the pipes. PI-tag rename? Schema evolves. SAP downtime? Auto-retry.
          NOAA endpoint flap? Connector status goes Degraded and the dbt source-freshness check fires.
        </p>
      </section>

      <section className="ops-card p-6 bg-[var(--navy-deep)] text-white">
        <div className="eyebrow-light mb-2">Bottom line</div>
        <p className="text-white/85 leading-relaxed">
          ODI does not replace SCADA, CIS, or the regulator's auditor. It gives the utility one open lake those
          systems all agree on — so the operator, the agent, and the regulator are reading the same truth.
        </p>
      </section>
    </div>
  );
}
