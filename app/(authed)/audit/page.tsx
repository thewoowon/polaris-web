import { AuditList } from "./_components/audit-list";

export default function AuditPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">감사 로그</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          모든 자동 결정과 사람의 개입 기록. 블루프린트 §19 · §24 — 고위험 자동게시가 왜 일어났는지,
          누가 뒤집었는지 추적합니다.
        </p>
      </header>
      <AuditList />
    </div>
  );
}
