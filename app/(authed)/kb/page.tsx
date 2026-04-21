import { KbList } from "./_components/kb-list";

export default function KbPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">지식 베이스</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          FAQ · 공지 · 릴리즈노트 · 운영정책 · 장애 대응 · 금지 표현. 응답 초안 grounding의 근거가 됩니다.
        </p>
      </header>
      <KbList />
    </div>
  );
}
