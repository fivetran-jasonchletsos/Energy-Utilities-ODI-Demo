// Read static JSON snapshots produced by the dbt gold layer.
// In a real deployment these are refreshed nightly from Snowflake.

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

const cache = new Map<string, Promise<unknown>>();

export async function fetchSnapshot<T>(file: string): Promise<T> {
  const key = file;
  if (cache.has(key)) return cache.get(key) as Promise<T>;
  const p = (async () => {
    const url = `${BASE}/data/${file}`;
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
    return (await res.json()) as T;
  })();
  cache.set(key, p);
  return p;
}

export function formatMW(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return `${n.toLocaleString('en-US', { maximumFractionDigits: 0 })} MW`;
}

export function formatPct(n: number | null | undefined, digits = 1): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return `${n.toFixed(digits)}%`;
}

export function formatNumber(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return n.toLocaleString('en-US');
}
