import { IngestionCard } from "./_components/ingestion-card";
import { PolicyRulesEditor } from "./_components/policy-rules-editor";
import { PolicyRulesViewer } from "./_components/policy-rules-viewer";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">설정</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          리뷰 수집, 정책 룰, 팀, 임계치. 편집 UI는 단계적으로 붙입니다.
        </p>
      </header>
      <IngestionCard />
      <PolicyRulesViewer />
      <PolicyRulesEditor />
    </div>
  );
}
