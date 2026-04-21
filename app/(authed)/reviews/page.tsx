import { ReviewsTable } from "./_components/reviews-table";

export default function ReviewsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">리뷰</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          수집된 모든 리뷰. 클릭하면 분류 · 정책 결정 · 응답 초안을 확인할 수 있습니다.
        </p>
      </header>
      <ReviewsTable />
    </div>
  );
}
