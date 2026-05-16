"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { reportsApi } from "@/lib/api/reports";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  reviewed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  exported: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  sent: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft", reviewed: "검토 완료", exported: "내보냄", sent: "발송 완료",
};

const TYPE_LABELS: Record<string, string> = {
  company_app_review: "앱 리뷰 분석",
  competitive_benchmark: "경쟁사 비교",
  monthly_voc: "월간 VOC",
  sales_outbound: "영업용",
};

export function ReportsTable() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["reports"],
    queryFn: () => reportsApi.list({ limit: 50 }),
  });

  if (isLoading) return <p className="text-sm text-zinc-500">불러오는 중...</p>;
  if (isError) return <p className="text-sm text-rose-600">불러오기 실패</p>;

  const reports = data?.items ?? [];

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 text-left text-xs text-zinc-500 uppercase tracking-wide">
              <th className="px-4 py-3">제목</th>
              <th className="px-4 py-3">회사</th>
              <th className="px-4 py-3">앱</th>
              <th className="px-4 py-3">타입</th>
              <th className="px-4 py-3">기간</th>
              <th className="px-4 py-3">상태</th>
              <th className="px-4 py-3">생성일</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-zinc-400">
                  생성된 리포트가 없습니다. 앱 상세 화면에서 리포트를 생성하세요.
                </td>
              </tr>
            )}
            {reports.map((r) => (
              <tr key={r.id} className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                <td className="px-4 py-3 max-w-xs">
                  <Link href={`/reports/${r.id}`} className="font-medium hover:text-blue-600 line-clamp-1">
                    {r.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-600">{r.company_name ?? "-"}</td>
                <td className="px-4 py-3 text-zinc-600">{r.app_name ?? "-"}</td>
                <td className="px-4 py-3">
                  <Badge tone="neutral" className="text-xs">{TYPE_LABELS[r.report_type] ?? r.report_type}</Badge>
                </td>
                <td className="px-4 py-3 text-xs text-zinc-500 tabular-nums">
                  {r.period_start}<br />{r.period_end}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[r.status]}`}>
                    {STATUS_LABELS[r.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-zinc-500">
                  {new Date(r.created_at).toLocaleDateString("ko-KR")}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/reports/${r.id}`}>
                    <Button variant="secondary">보기</Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
