import { SummaryCards } from "./_components/summary-cards";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">대시보드</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          VOC 파이프라인의 현재 상태를 확인합니다.
        </p>
      </header>
      <SummaryCards />
    </div>
  );
}
