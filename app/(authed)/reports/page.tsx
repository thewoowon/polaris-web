import { ReportsTable } from "./_components/reports-table";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          생성된 앱 리뷰 인텔리전스 리포트를 관리합니다.
        </p>
      </header>
      <ReportsTable />
    </div>
  );
}
