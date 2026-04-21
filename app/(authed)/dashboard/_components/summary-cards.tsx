"use client";

import { useQuery } from "@tanstack/react-query";

import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { getCategories, getHighRisk, getSummary } from "@/lib/api/dashboard";
import { qk } from "@/lib/query-keys";

function percent(v: number): string {
  return `${(v * 100).toFixed(1)}%`;
}

export function SummaryCards() {
  const summary = useQuery({ queryKey: qk.dashboard.summary, queryFn: getSummary });
  const categories = useQuery({ queryKey: qk.dashboard.categories, queryFn: getCategories });
  const highRisk = useQuery({
    queryKey: qk.dashboard.highRisk(10),
    queryFn: () => getHighRisk(10),
  });

  if (summary.isError) {
    return (
      <Card>
        <CardBody>
          <p className="text-sm text-rose-600">
            대시보드 데이터를 불러오지 못했습니다: {(summary.error as Error).message}
          </p>
        </CardBody>
      </Card>
    );
  }

  const data = summary.data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <Metric label="전체 리뷰" value={data?.total_reviews ?? "—"} isLoading={summary.isLoading} />
        <Metric
          label="부정 리뷰 비율"
          value={data ? percent(data.negative_ratio) : "—"}
          isLoading={summary.isLoading}
        />
        <Metric
          label="자동 응답률"
          value={data ? percent(data.auto_reply_rate) : "—"}
          isLoading={summary.isLoading}
        />
        <Metric
          label="사람 검수 비율"
          value={data ? percent(data.human_review_rate) : "—"}
          isLoading={summary.isLoading}
        />
        <Metric
          label="고위험 건수"
          value={data?.high_risk_count ?? "—"}
          isLoading={summary.isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>카테고리 분포</CardTitle>
          </CardHeader>
          <CardBody>
            {categories.isLoading && <p className="text-sm text-zinc-500">불러오는 중…</p>}
            {categories.data && categories.data.length === 0 && (
              <p className="text-sm text-zinc-500">아직 분류 결과가 없습니다.</p>
            )}
            {categories.data && categories.data.length > 0 && (
              <ul className="space-y-2 text-sm">
                {categories.data.map((c) => (
                  <li key={c.category} className="flex items-center justify-between">
                    <span className="font-medium">{c.category}</span>
                    <span className="text-zinc-500">
                      {c.count} ({percent(c.share)})
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>고위험 최근 건</CardTitle>
          </CardHeader>
          <CardBody>
            {highRisk.isLoading && <p className="text-sm text-zinc-500">불러오는 중…</p>}
            {highRisk.data && highRisk.data.length === 0 && (
              <p className="text-sm text-zinc-500">현재 고위험 건이 없습니다.</p>
            )}
            {highRisk.data && highRisk.data.length > 0 && (
              <ul className="space-y-2 text-sm">
                {highRisk.data.map((h) => (
                  <li key={h.review_id} className="flex justify-between">
                    <span className="font-medium">#{h.review_id}</span>
                    <span className="text-zinc-500">
                      {h.action} · {h.category} · risk {h.risk_score.toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  isLoading,
}: {
  label: string;
  value: string | number;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardBody>
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</p>
        <p className="mt-2 text-2xl font-semibold">
          {isLoading ? <span className="text-zinc-400">…</span> : value}
        </p>
      </CardBody>
    </Card>
  );
}
