import { Card, CardBody } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">설정</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          계정, 팀, 정책 룰, 템플릿. 단계별로 채워집니다.
        </p>
      </header>
      <Card>
        <CardBody>
          <p className="text-sm text-zinc-500">준비 중.</p>
        </CardBody>
      </Card>
    </div>
  );
}
