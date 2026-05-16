"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { appsApi } from "@/lib/api/apps";
import { benchmarksApi } from "@/lib/api/benchmarks";

export function BenchmarkRunner() {
  const qc = useQueryClient();
  const [targetId, setTargetId] = useState("");
  const [competitorIds, setCompetitorIds] = useState<string[]>([]);
  const [period, setPeriod] = useState({ start: "2026-01-01", end: "2026-05-31" });

  const { data: appsData } = useQuery({
    queryKey: ["apps"],
    queryFn: () => appsApi.list({ limit: 100 }),
  });

  const { data: benchmarks, refetch } = useQuery({
    queryKey: ["benchmarks"],
    queryFn: () => benchmarksApi.list(),
  });

  const runMut = useMutation({
    mutationFn: () =>
      benchmarksApi.create({
        target_app_id: targetId,
        competitor_app_ids: competitorIds,
        period_start: period.start,
        period_end: period.end,
      }),
    onSuccess: () => {
      refetch();
      qc.invalidateQueries({ queryKey: ["benchmarks"] });
    },
  });

  const apps = appsData?.items ?? [];

  const toggleCompetitor = (id: string) => {
    setCompetitorIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const getAppName = (id: string) => apps.find((a) => a.id === id)?.app_name ?? id;

  return (
    <div className="space-y-6">
      {/* Run Form */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-medium">벤치마크 실행</h2>

        <div>
          <label className="block text-xs text-zinc-500 mb-2">Target 앱 (분석 대상)</label>
          <select
            className="w-full border border-zinc-300 dark:border-zinc-700 rounded px-3 py-2 text-sm bg-white dark:bg-zinc-900"
            value={targetId}
            onChange={(e) => {
              setTargetId(e.target.value);
              setCompetitorIds((prev) => prev.filter((id) => id !== e.target.value));
            }}
          >
            <option value="">선택하세요</option>
            {apps.map((a) => (
              <option key={a.id} value={a.id}>
                {a.app_name} ({a.company_name})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-zinc-500 mb-2">경쟁사 앱 (복수 선택)</label>
          <div className="flex flex-wrap gap-2">
            {apps
              .filter((a) => a.id !== targetId)
              .map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => toggleCompetitor(a.id)}
                  className={`px-3 py-1.5 rounded text-sm border transition-colors ${
                    competitorIds.includes(a.id)
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent"
                      : "border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  }`}
                >
                  {a.app_name}
                </button>
              ))}
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-xs text-zinc-500 mb-1">시작일</label>
            <input
              type="date"
              className="w-full border border-zinc-300 dark:border-zinc-700 rounded px-3 py-2 text-sm bg-white dark:bg-zinc-900"
              value={period.start}
              onChange={(e) => setPeriod((p) => ({ ...p, start: e.target.value }))}
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-zinc-500 mb-1">종료일</label>
            <input
              type="date"
              className="w-full border border-zinc-300 dark:border-zinc-700 rounded px-3 py-2 text-sm bg-white dark:bg-zinc-900"
              value={period.end}
              onChange={(e) => setPeriod((p) => ({ ...p, end: e.target.value }))}
            />
          </div>
        </div>

        <Button
          onClick={() => runMut.mutate()}
          disabled={!targetId || competitorIds.length === 0 || runMut.isPending}
        >
          {runMut.isPending ? "분석 중..." : "벤치마크 실행"}
        </Button>
      </Card>

      {/* Results */}
      {(benchmarks?.length ?? 0) > 0 && (
        <section>
          <h2 className="text-lg font-medium mb-3">벤치마크 결과</h2>
          <div className="space-y-4">
            {benchmarks!.map((b) => {
              const metrics = b.metrics as Record<string, unknown>;
              const target = metrics.target as Record<string, unknown> | undefined;
              const competitors = (metrics.competitors as Array<Record<string, unknown>>) ?? [];

              return (
                <Card key={b.id} className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">
                        Target: <span className="text-blue-600">{getAppName(b.target_app_id)}</span>
                      </p>
                      <p className="text-xs text-zinc-500">{b.period_start} ~ {b.period_end}</p>
                    </div>
                    <Badge tone="neutral">{new Date(b.created_at).toLocaleDateString("ko-KR")}</Badge>
                  </div>

                  <p className="text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 p-3 rounded">
                    {b.comparison_summary}
                  </p>

                  {target && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-xs text-zinc-500 uppercase border-b border-zinc-200 dark:border-zinc-700">
                            <th className="pb-2">앱</th>
                            <th className="pb-2 text-right">리뷰 수</th>
                            <th className="pb-2 text-right">평균 평점</th>
                            <th className="pb-2 text-right">부정 비율</th>
                            <th className="pb-2 text-right">Critical</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-zinc-100 dark:border-zinc-800 font-medium">
                            <td className="py-2">{getAppName(b.target_app_id)} ★</td>
                            <td className="py-2 text-right tabular-nums">{String(target.review_count ?? "-")}</td>
                            <td className="py-2 text-right tabular-nums">{Number(target.average_rating ?? 0).toFixed(1)}</td>
                            <td className="py-2 text-right tabular-nums">{((Number(target.negative_ratio ?? 0)) * 100).toFixed(1)}%</td>
                            <td className="py-2 text-right tabular-nums">{String(target.critical_issue_count ?? 0)}</td>
                          </tr>
                          {competitors.map((c, i) => (
                            <tr key={i} className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
                              <td className="py-2">{c.app_name as string}</td>
                              <td className="py-2 text-right tabular-nums">{String(c.review_count ?? "-")}</td>
                              <td className="py-2 text-right tabular-nums">{Number(c.average_rating ?? 0).toFixed(1)}</td>
                              <td className="py-2 text-right tabular-nums">{((Number(c.negative_ratio ?? 0)) * 100).toFixed(1)}%</td>
                              <td className="py-2 text-right tabular-nums">{String(c.critical_issue_count ?? 0)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
