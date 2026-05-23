/*
 * DbtWizardPage — dbt-wizard hub page for Helios Energy.
 *
 * Route: /dbt-wizard
 *
 * Ported from Healthcare-EPIC-Snowflake-Demo/OdiDbtWizardPage — Helios Energy flavor.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const CANNED_QUESTIONS = [
  'Why are tier-2 substations in the West service territory showing 38% more momentary-interruption events vs East, after we rolled out the new IEDs?',
  'Which feeders in the North territory have the highest SAIDI contribution this quarter, and how does it trend month-over-month?',
  'Show momentary vs sustained outage ratio by substation tier for the last four quarters — where are the worst recloser cycle counts?',
];

const PILLARS = [
  {
    layer: 'Ingestion + MDLS',
    vendor: 'Fivetran',
    accent: '#0073EA',
    tag: 'connectors',
    what: '750+ managed connectors plus a custom Connector SDK for the long tail. Lands every source into Managed Data Lake Service as Apache Iceberg, in customer-owned S3.',
    inBuild: 'Helios Energy runs OSIsoft PI for SCADA, Itron for AMI, SAP IS-U for CIS, and Salesforce for customer ops. Fivetran connectors replicate all four source systems — plus GIS and NOAA weather — on a continuous cadence into the shared lake, in the same open format.',
  },
  {
    layer: 'Open Lake',
    vendor: 'Iceberg on S3',
    accent: '#7C3AED',
    tag: 'storage',
    what: 'Open table format. Customer-owned storage. Snapshot isolation, schema evolution, time travel, multi-engine reads. The bytes belong to the utility, not the engine.',
    inBuild: 'When dbt-wizard\'s Worker sub-agent materializes the new gold.fct_outage_by_substation_tier_quarter table, it writes Parquet files into the shared gold S3 prefix. No second copy. No publish step. Any downstream consumer — Snowflake, PUC reporting pipelines, outage prediction models — resolves the new asset on its next read.',
  },
  {
    layer: 'Medallion + Build-time AI',
    vendor: 'dbt Labs + dbt-wizard',
    accent: '#FF694A',
    tag: 'transform',
    what: 'Bronze, silver, gold transformations with declarative SQL. Lineage, tests, freshness SLAs, semantic models. dbt-wizard adds four sub-agents that author new models into the project using the same tools an analytics engineer uses.',
    inBuild: 'The VP of Grid Operations asks why tier-2 substations in the West territory show 38% more momentary interruptions after the IED rollout. No gold model covers that grain. dbt-wizard\'s four sub-agents surface the upstreams, author the SQL, write the tests, and materialize the asset in 90 seconds.',
  },
  {
    layer: 'Compute over Iceberg',
    vendor: 'Snowflake',
    accent: '#29B5E8',
    tag: 'engine',
    what: 'Reads Iceberg tables directly via external tables and Polaris catalog. Runs the dbt-wizard warehouse for dbt_show and the materialization step. Independently scaled micro-warehouses.',
    inBuild: 'Worker spins up an XS warehouse for the dbt_show slice, validates the proposed quarterly substation-tier grain against the outage event and IED event tables, then materializes the new table to the gold prefix. Total compute footprint: a few seconds of XS warehouse time.',
  },
];

const PROPERTIES = [
  {
    title: 'Speed',
    claim: 'Ninety seconds from question to production model.',
    proof: 'Manual build of the same model: three to five days. The bottleneck is not SQL — it is the round-trip from VP question to backlog to scope to author to test to PR. dbt-wizard collapses every step into a single sub-agent chain. The model exists before the PUC filing window closes.',
  },
  {
    title: 'Governance',
    claim: 'Every dbt-wizard model gets tests, lineage, and ownership.',
    proof: 'The output is not a SQL snippet pasted into a notebook. It is a dbt model with a schema contract, column-level tests, a combination uniqueness test, declared upstreams, an owner tag, and an ai_built tag. The new outage-by-tier table passes the same governance bar every other gold table in the medallion passes.',
  },
  {
    title: 'Reusability',
    claim: 'The new model is a first-class citizen for every downstream consumer.',
    proof: 'Downstream consumers read it on their next pass. PUC reporting pipelines can pin to it. Outage prediction models can join to it. Other dbt models can ref() it. Iceberg readers — Snowflake, Trino, Spark, DuckDB — can all query it. The model is not stuck inside the tool that built it.',
  },
  {
    title: 'Openness',
    claim: 'The model is Iceberg on S3, queryable by any engine.',
    proof: 'No lock-in on the build-time tool. No lock-in on the run-time engine. The bytes sit in the utility\'s S3 bucket in an open table format. Swap dbt-wizard tomorrow for a different build-time agent and the materialized table still works. Swap Snowflake for Trino and the table still works.',
  },
];

export default function DbtWizardPage() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState(CANNED_QUESTIONS[0]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10 max-w-3xl">
        <div className="eyebrow mb-1 text-[var(--cyan)]">Build-time AI · Grid Operations Reference</div>
        <h1 className="text-[2rem] sm:text-[2.4rem] font-semibold tracking-tight text-[var(--ink-strong)]">
          dbt-wizard: the build-time layer
        </h1>
        <p className="mt-3 text-[var(--ink-muted)] leading-relaxed">
          Any downstream consumer can only read gold models that already exist. When the VP of Grid Operations
          asks a question the gold layer does not yet answer, dbt-wizard's four sub-agents author the
          missing model — tested, lineage-tracked, materialized — in under ninety seconds. Every
          downstream reader picks it up on its next pass.
        </p>
      </header>

      {/* Stats strip */}
      <section className="mb-10 ops-card p-5 sm:p-6">
        <div className="flex items-baseline justify-between flex-wrap gap-2 mb-4">
          <div className="eyebrow">The scenario that motivates this page</div>
        </div>
        <div
          className="mb-5 rounded-lg border border-[var(--hairline)] p-4"
          style={{ borderLeft: '4px solid var(--cyan)', background: 'rgba(6,182,212,0.04)' }}
        >
          <p className="text-[var(--ink)] leading-relaxed">
            The VP asks: "Why are tier-2 substations in the West territory showing 38% more momentary-interruption
            events after the IED rollout?" There is no{' '}
            <code className="font-mono text-[12px] bg-white border border-[var(--hairline)] px-1.5 py-0.5 rounded">
              gold.fct_outage_by_substation_tier_quarter
            </code>{' '}
            table. Without dbt-wizard, the answer is three to five days away — past the PUC filing window.
            With dbt-wizard, the answer is ninety seconds away.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Stat big="24" small="dbt models · bronze to silver to gold" />
          <Stat big="90s"  small="dbt-wizard build · question to production model" />
          <Stat big="3–5 d" small="Manual equivalent · backlog to PR" />
        </div>
      </section>

      {/* Four layers */}
      <section className="mb-12">
        <div className="eyebrow mb-2">Four layers. One loop.</div>
        <h2 className="text-2xl font-semibold text-[var(--ink-strong)] pb-3 mb-6 border-b-2 border-[var(--hairline)]">
          What each layer contributes
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PILLARS.map((p, i) => (
            <div key={p.vendor} className="ops-card relative flex flex-col" style={{ minHeight: '420px', borderTop: `3px solid ${p.accent}` }}>
              <div className="p-5 flex-1 flex flex-col">
                <div className="text-[11px] font-mono uppercase tracking-wider mb-2" style={{ color: 'var(--ink-soft)' }}>
                  0{i + 1} · {p.tag}
                </div>
                <div className="eyebrow mb-1" style={{ color: 'var(--ink-muted)' }}>{p.layer}</div>
                <div className="text-xl font-semibold mb-4" style={{ color: p.accent }}>{p.vendor}</div>
                <div className="text-[11px] font-mono uppercase tracking-wider mb-1" style={{ color: 'var(--ink-soft)' }}>What it does</div>
                <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--ink)' }}>{p.what}</p>
                <div className="text-[11px] font-mono uppercase tracking-wider mb-1" style={{ color: 'var(--ink-soft)' }}>At Helios Energy</div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-muted)' }}>{p.inBuild}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Four sub-agents */}
      <section className="mb-12 ops-card p-6">
        <div className="eyebrow mb-2">The four sub-agents</div>
        <h2 className="text-xl font-semibold text-[var(--ink-strong)] mb-4">
          How dbt-wizard authors a model in under ninety seconds
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { num: '01', name: 'Explorer', tools: 'dbt status, dbt search', job: 'Maps what already exists in the project. Finds upstream tables that cover outage events, substation tier, IED firmware, and territory classification. Returns a list of candidate gold tables the Worker can join.' },
            { num: '02', name: 'Summary', tools: 'dbt describe, dbt lineage', job: 'Documents the schema and lineage of the candidate tables. Confirms grain, null rates, and join keys. Catches a firmware-version edge case before the Worker writes a single line of SQL.' },
            { num: '03', name: 'Worker', tools: 'dbt warehouse, dbt_show, file edit', job: 'Writes the SQL and runs a dbt_show slice against a live XS warehouse. Validates the proposed quarterly substation-tier grain, checks row counts, and edits the model file into the project.' },
            { num: '04', name: 'Verification', tools: 'dbt test, dbt docs generate', job: 'Writes the schema YAML, adds uniqueness on (substation_id, tier, service_territory, quarter) and not-null tests, runs the full test suite, and confirms the materialized table is queryable. Tags the model ai_built and assigns ownership.' },
          ].map((a) => (
            <div key={a.num} className="ops-card p-4" style={{ borderTop: '3px solid var(--cyan)' }}>
              <div className="font-mono text-xs text-[var(--ink-soft)] mb-1">{a.num}</div>
              <div className="text-lg font-semibold text-[var(--ink-strong)] mb-1">{a.name}</div>
              <div className="text-[11px] font-mono uppercase tracking-wider mb-2 text-[var(--cyan)]">{a.tools}</div>
              <p className="text-xs text-[var(--ink-muted)] leading-relaxed">{a.job}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Four properties */}
      <section className="mb-12">
        <div className="eyebrow mb-2">Four properties</div>
        <h2 className="text-xl font-semibold text-[var(--ink-strong)] pb-3 mb-6 border-b-2 border-[var(--hairline)]">
          What dbt-wizard gives the lake that no other build-time tool can
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {PROPERTIES.map((c, i) => (
            <div key={c.title} className="ops-card p-5 border-l-4" style={{ borderLeftColor: 'var(--cyan)' }}>
              <div className="flex items-baseline gap-3 mb-2">
                <div className="font-mono text-xs text-[var(--ink-soft)]">0{i + 1}</div>
                <div className="text-lg font-semibold text-[var(--ink-strong)]">{c.title}</div>
              </div>
              <div className="text-sm font-semibold mb-2 text-[var(--cyan)]">{c.claim}</div>
              <p className="text-sm leading-relaxed text-[var(--ink-muted)]">{c.proof}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Try the live build */}
      <section className="mb-12 ops-card p-6 border-l-4" style={{ borderLeftColor: 'var(--cyan)' }}>
        <div className="eyebrow mb-2 text-[var(--cyan)]">Try the live build</div>
        <h2 className="text-xl font-semibold text-[var(--ink-strong)] mb-3">
          Watch dbt-wizard author the model in real time
        </h2>
        <p className="text-sm text-[var(--ink-muted)] max-w-2xl leading-relaxed mb-5">
          Select a question below or write your own, then submit to watch Explorer, Summary,
          Worker, and Verification play out — narration, SQL, YAML, lineage and all tool calls — live.
        </p>

        <div className="flex flex-col gap-2 mb-4">
          {CANNED_QUESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setQuestion(q)}
              className="text-left rounded-sm px-4 py-3 text-sm border transition-colors"
              style={{
                background: question === q ? 'rgba(6,182,212,0.06)' : 'var(--paper-deep)',
                borderColor: question === q ? 'var(--cyan)' : 'var(--hairline)',
                color: question === q ? 'var(--cyan)' : 'var(--ink-muted)',
                fontFamily: '"IBM Plex Mono", monospace',
              }}
            >
              {q}
            </button>
          ))}
        </div>

        <div className="mb-4">
          <label className="eyebrow block mb-1.5">Or write your own question</label>
          <textarea
            rows={3}
            value={question}
            onChange={e => setQuestion(e.target.value)}
            className="w-full rounded-sm px-3 py-2 text-sm border resize-none"
            style={{
              background: 'var(--card)',
              borderColor: 'var(--hairline)',
              color: 'var(--ink)',
              fontFamily: '"IBM Plex Mono", monospace',
              outline: 'none',
            }}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={!question.trim()}
            onClick={() => navigate('/wizard-live', { state: { question } })}
            className="inline-flex items-center gap-2 rounded-sm font-semibold text-sm px-5 py-2.5 transition-opacity disabled:opacity-40"
            style={{ background: 'var(--cyan)', color: 'var(--navy-deep)' }}
          >
            Watch live build
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </button>
          <Link
            to="/grid-scenario"
            className="inline-flex items-center gap-2 rounded-sm font-semibold text-sm px-5 py-2.5 border border-[var(--cyan)] text-[var(--cyan)] hover:bg-[rgba(6,182,212,0.06)] transition-colors"
          >
            See the scenario framing
          </Link>
        </div>
      </section>

      {/* Closing banner */}
      <section className="rounded-sm p-8" style={{ background: 'var(--navy-deep)', color: '#fff' }}>
        <div className="text-xs font-mono uppercase tracking-[0.18em] mb-3 opacity-70">The loop, in one sentence</div>
        <p className="text-xl sm:text-2xl leading-snug mb-6">
          <span style={{ color: '#0073EA' }}>Fivetran lands it.</span>{' '}
          <span style={{ color: '#FF694A' }}>dbt governs it.</span>{' '}
          <span style={{ color: '#FF694A' }}>dbt-wizard authors it.</span>{' '}
          <span style={{ color: '#7C3AED' }}>Iceberg owns it.</span>{' '}
          <span style={{ color: '#29B5E8' }}>Snowflake reads it.</span>
        </p>
        <p className="text-sm opacity-70 max-w-2xl mb-6">
          Build-time AI on the same lake as every downstream reader. dbt-wizard authors the model.
          Any engine that speaks Iceberg reads it. No integration handoff. No second copy of the data.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/pipeline"
            className="inline-flex items-center gap-2 rounded-sm font-semibold text-sm px-5 py-3 hover:opacity-95 transition-opacity"
            style={{ background: 'var(--cyan)', color: 'var(--navy-deep)' }}
          >
            See the pipeline
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            to="/about"
            className="inline-flex items-center gap-2 rounded-sm font-semibold text-sm bg-white/5 border border-white/20 px-5 py-3 hover:bg-white/10 transition-colors"
          >
            Architecture overview
          </Link>
        </div>
      </section>
    </div>
  );
}

function Stat({ big, small }: { big: string; small: string }) {
  return (
    <div>
      <div className="font-semibold" style={{ fontSize: 30, color: 'var(--cyan)', lineHeight: 1.05, letterSpacing: '-0.01em' }}>
        {big}
      </div>
      <div className="mt-1 font-mono uppercase tracking-[0.16em]" style={{ fontSize: 10.5, color: 'var(--ink-muted)', lineHeight: 1.35 }}>
        {small}
      </div>
    </div>
  );
}
