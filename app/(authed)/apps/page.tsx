import { Suspense } from "react";

import { AppsTable } from "./_components/apps-table";

export default function AppsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Apps</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          분석 대상 앱과 경쟁사 앱을 관리합니다.
        </p>
      </header>
      <Suspense>
        <AppsTable />
      </Suspense>
    </div>
  );
}
