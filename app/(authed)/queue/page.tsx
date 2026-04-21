import { Card, CardBody } from "@/components/ui/card";

export default function QueuePage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">검수 큐</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          사람 검수가 필요한 건만 모아서 봅니다. 결제 · 환불 · 계정 건이 우선.
        </p>
      </header>
      <Card>
        <CardBody>
          <p className="text-sm text-zinc-500">
            아직 구현되지 않았습니다. 리뷰 상세 페이지의 정책 액션이 `route_to_human` /
            `create_issue`로 떨어진 건이 여기에 모이게 됩니다.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
