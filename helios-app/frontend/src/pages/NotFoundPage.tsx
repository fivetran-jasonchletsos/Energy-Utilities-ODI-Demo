import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <div className="eyebrow mb-2">404</div>
      <h1 className="text-3xl font-semibold mb-2">Feeder not found</h1>
      <p className="text-[var(--ink-muted)] mb-6">That page is not energized. Head back to the control room.</p>
      <Link to="/" className="inline-block px-4 py-2 rounded-sm bg-[var(--navy-deep)] text-[var(--cyan-bright)] font-semibold text-sm hover:bg-[var(--navy)]">Back to grid status</Link>
    </div>
  );
}
