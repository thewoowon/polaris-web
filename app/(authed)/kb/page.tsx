import { Card, CardBody } from "@/components/ui/card";

export default function KbPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">지식 베이스</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          FAQ · 공지 · 릴리즈노트 · 운영정책 문서. Phase 3에서 임베딩 검색이 붙습니다.
        </p>
      </header>
      <Card>
        <CardBody>
          <p className="text-sm text-zinc-500">
            문서 CRUD UI가 준비 중입니다. API는 `/api/v1/kb/*`에 이미 붙어 있습니다.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
