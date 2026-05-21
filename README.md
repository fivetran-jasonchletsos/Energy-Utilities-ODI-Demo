# Energy & Utilities ODI Demo — Helios Grid

A reference build of Fivetran's Open Data Infrastructure (ODI) for a regional electric utility.
The fictional **Helios Grid** serves 2.4M customers across Arizona, New Mexico, and southern Nevada
with a ~30% renewables mix.

**Live demo:** https://fivetran-jasonchletsos.github.io/Energy-Utilities-ODI-Demo/

## What it shows

- **Grid Status** — real-time load curve, generation mix, headlines from the control-room desk
- **Outages** — active outage roster with agent-predicted restoration times, SAIDI / SAIFI / CAIDI scorecards
- **Renewables** — solar + wind production by site, 7-day forecast delta, curtailment events
- **Assets** — 200 transformer / substation assets ranked by health score, replacement CapEx
- **Customers** — residential / commercial / industrial segment mix, top 20 industrial accounts
- **ESG** — Scope 1+2 emissions quarterly, renewables share, RPS progress, state-PUC filings
- **Architecture / Pipeline / Policy** — the ODI reference architecture, Fivetran connector health,
  dbt layer freshness, and a brief on bridging OT and IT in a regulated utility.

## Architecture

Sources land through Fivetran into a customer-owned Iceberg lake. dbt builds the bronze, silver,
gold, and platinum layers. Snowflake, Athena, Spark, and Cortex agents read the same files.

- **Sources** — SAP IS-U (CIS, billing), OSIsoft PI System (SCADA historian), Itron OpenWay (AMI),
  Salesforce (commercial CRM), Esri ArcGIS (asset locations), NOAA NDFD (forecasts), IBM Maximo
  (work orders)
- **Ingest** — Fivetran managed connectors. Schema evolution, retry, lag observability.
- **Lake** — customer-owned S3 bucket, Apache Iceberg v2, AWS Glue catalog.
- **Transform** — dbt across four layers (bronze, silver, gold, platinum).
- **Compute** — Snowflake (ops), Athena (regulatory), Spark (ML), DuckDB (ad-hoc). Same files.

## Run locally

```
cd helios-app/frontend
npm install
npm run dev
```

Local preview at root path: `VITE_BASE=/ npm run dev`.

## Deploy

GitHub Actions builds on push to `main` (paths: `helios-app/**`) and publishes to GitHub Pages.

## Disclaimer

All data shown is synthetic. Helios Grid is a fictional utility. Customer counts, outage incidents,
generation mix, and ESG numbers are invented for demonstrating the ODI architecture and are not
representative of any real operator.
