import Link from 'next/link';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper px-4 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent-soft text-accent-deep dark:text-accent">
        <Compass className="h-7 w-7" />
      </span>
      <h1 className="text-xl font-bold text-ink">این صفحه پیدا نشد</h1>
      <p className="max-w-md text-sm leading-7 text-ink-3">
        نشانی مورد نظر در دوره وجود ندارد. از نقشه دوره فصل مورد نظرت را پیدا کن.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-accent-solid px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-accent-deep"
      >
        بازگشت به نقشه دوره
      </Link>
    </div>
  );
}
