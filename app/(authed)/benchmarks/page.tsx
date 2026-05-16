import { BenchmarkRunner } from "./_components/benchmark-runner";

export default function BenchmarksPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Benchmarks</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Target 앱과 경쟁사를 비교 분석합니다.
        </p>
      </header>
      <BenchmarkRunner />
    </div>
  );
}
