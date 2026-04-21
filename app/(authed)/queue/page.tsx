import { QueueTable } from "./_components/queue-table";

export default function QueuePage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">검수 큐</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          사람 검수가 필요한 건만 모아서 봅니다. 위험도 ↓ · 오래된 것 먼저.
        </p>
      </header>
      <QueueTable />
    </div>
  );
}
