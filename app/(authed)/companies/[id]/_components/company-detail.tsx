"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { appsApi } from "@/lib/api/apps";
import { companiesApi } from "@/lib/api/companies";
import { reportsApi } from "@/lib/api/reports";

const INDUSTRY_LABELS: Record<string, string> = {
  finance: "금융", fintech: "핀테크", commerce: "커머스",
  delivery: "배달", public: "공공", education: "교육",
  mobility: "모빌리티", entertainment: "엔터", other: "기타",
};

export function CompanyDetail({ companyId }: { companyId: string }) {
  const { data: company, isLoading } = useQuery({
    queryKey: ["companies", companyId],
    queryFn: () => companiesApi.get(companyId),
  });

  const { data: appsData } = useQuery({
    queryKey: ["apps", { company_id: companyId }],
    queryFn: () => appsApi.list({ company_id: companyId, limit: 50 }),
    enabled: !!company,
  });

  const { data: reportsData } = useQuery({
    queryKey: ["reports", { company_id: companyId }],
    queryFn: () => reportsApi.list({ company_id: companyId, limit: 10 }),
    enabled: !!company,
  });

  if (isLoading) return <p className="text-sm text-zinc-500">불러오는 중...</p>;
  if (!company) return <p className="text-sm text-rose-600">회사를 찾을 수 없습니다.</p>;

  const apps = appsData?.items ?? [];
  const reports = reportsData?.items ?? [];

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/companies" className="text-sm text-zinc-500 hover:text-zinc-900">Companies</Link>
            <span className="text-zinc-300">/</span>
            <h1 className="text-2xl font-semibold tracking-tight">{company.name}</h1>
          </div>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            <Badge tone="neutral">{INDUSTRY_LABELS[company.industry] ?? company.industry}</Badge>
            {company.homepage_url && (
              <a href={company.homepage_url} target="_blank" rel="noopener noreferrer"
                className="ml-2 text-blue-600 hover:underline">{company.homepage_url}</a>
            )}
          </p>
        </div>
        <Link href="/reports">
          <Button variant="secondary">리포트 보기</Button>
        </Link>
      </header>

      {company.memo && (
        <Card className="p-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{company.memo}</p>
        </Card>
      )}

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-medium">등록 앱</h2>
          <Link href={`/apps?company_id=${companyId}`}>
            <Button variant="secondary">앱 관리</Button>
          </Link>
        </div>
        <Card>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-left text-xs text-zinc-500 uppercase">
                <th className="px-4 py-3">앱명</th>
                <th className="px-4 py-3">플랫폼</th>
                <th className="px-4 py-3 text-right">리뷰 수</th>
                <th className="px-4 py-3 text-right">평균 평점</th>
                <th className="px-4 py-3 text-right">부정 비율</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {apps.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-zinc-400">등록된 앱이 없습니다.</td></tr>
              )}
              {apps.map((a) => (
                <tr key={a.id} className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="px-4 py-3 font-medium">{a.app_name}</td>
                  <td className="px-4 py-3"><Badge tone="neutral">{a.platform}</Badge></td>
                  <td className="px-4 py-3 text-right tabular-nums">{a.review_count.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{a.average_rating?.toFixed(1) ?? "-"}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {a.negative_ratio != null ? (
                      <span className={a.negative_ratio > 0.5 ? "text-rose-600" : a.negative_ratio > 0.3 ? "text-amber-600" : "text-emerald-600"}>
                        {(a.negative_ratio * 100).toFixed(1)}%
                      </span>
                    ) : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/apps/${a.id}`} className="text-blue-600 hover:underline text-xs">분석</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      {reports.length > 0 && (
        <section>
          <h2 className="text-lg font-medium mb-3">최근 리포트</h2>
          <div className="space-y-2">
            {reports.map((r) => (
              <Card key={r.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{r.title}</p>
                  <p className="text-xs text-zinc-500">{r.period_start} ~ {r.period_end} · {r.status}</p>
                </div>
                <Link href={`/reports/${r.id}`}>
                  <Button variant="secondary">보기</Button>
                </Link>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
