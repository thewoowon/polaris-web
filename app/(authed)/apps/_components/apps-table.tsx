"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { type AppCreate, appsApi } from "@/lib/api/apps";
import { companiesApi } from "@/lib/api/companies";

const SEVERITY_COLOR: Record<string, string> = {
  low: "text-emerald-600",
  medium: "text-amber-600",
  high: "text-orange-600",
  critical: "text-rose-600",
};

export function AppsTable() {
  const qc = useQueryClient();
  const searchParams = useSearchParams();
  const companyFilter = searchParams.get("company_id") ?? undefined;

  const [showModal, setShowModal] = useState(false);
  const [ingestingId, setIngestingId] = useState<string | null>(null);
  const [form, setForm] = useState<AppCreate>({
    company_id: companyFilter ?? "",
    app_name: "",
    platform: "both",
    is_target: false,
    is_competitor: false,
  });

  const { data: appsData, isLoading } = useQuery({
    queryKey: ["apps", { company_id: companyFilter }],
    queryFn: () => appsApi.list({ company_id: companyFilter, limit: 100 }),
  });

  const { data: companiesData } = useQuery({
    queryKey: ["companies"],
    queryFn: () => companiesApi.list({ limit: 100 }),
  });

  const createMut = useMutation({
    mutationFn: appsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["apps"] });
      setShowModal(false);
    },
  });

  const ingestMut = useMutation({
    mutationFn: ({ id, count }: { id: string; count: number }) =>
      appsApi.mockIngest(id, count),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["apps"] });
      qc.invalidateQueries({ queryKey: ["app-summary", id] });
      setIngestingId(null);
    },
    onSettled: () => setIngestingId(null),
  });

  const apps = appsData?.items ?? [];
  const companies = companiesData?.items ?? [];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowModal(true)}>+ 앱 등록</Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-zinc-500">불러오는 중...</p>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-left text-xs text-zinc-500 uppercase tracking-wide">
                  <th className="px-4 py-3">앱명</th>
                  <th className="px-4 py-3">회사</th>
                  <th className="px-4 py-3">플랫폼</th>
                  <th className="px-4 py-3 text-right">리뷰 수</th>
                  <th className="px-4 py-3 text-right">평균 평점</th>
                  <th className="px-4 py-3 text-right">부정 비율</th>
                  <th className="px-4 py-3">액션</th>
                </tr>
              </thead>
              <tbody>
                {apps.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-zinc-400">
                      등록된 앱이 없습니다.
                    </td>
                  </tr>
                )}
                {apps.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  >
                    <td className="px-4 py-3">
                      <Link href={`/apps/${a.id}`} className="font-medium hover:text-blue-600">
                        {a.app_name}
                      </Link>
                      <div className="flex gap-1 mt-0.5">
                        {a.is_target && <Badge tone="info" className="text-[10px] px-1 py-0">Target</Badge>}
                        {a.is_competitor && <Badge tone="neutral" className="text-[10px] px-1 py-0">경쟁</Badge>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{a.company_name ?? "-"}</td>
                    <td className="px-4 py-3">
                      <Badge tone="neutral">{a.platform}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{a.review_count.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{a.average_rating?.toFixed(1) ?? "-"}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {a.negative_ratio != null ? (
                        <span className={a.negative_ratio > 0.5 ? SEVERITY_COLOR.critical : a.negative_ratio > 0.3 ? SEVERITY_COLOR.medium : SEVERITY_COLOR.low}>
                          {(a.negative_ratio * 100).toFixed(1)}%
                        </span>
                      ) : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link href={`/apps/${a.id}`}>
                          <Button variant="secondary">분석</Button>
                        </Link>
                        <Button
                          variant="secondary"
                          disabled={ingestingId === a.id || ingestMut.isPending}
                          onClick={() => {
                            setIngestingId(a.id);
                            ingestMut.mutate({ id: a.id, count: 120 });
                          }}
                        >
                          {ingestingId === a.id ? "생성 중..." : "Mock 리뷰"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <Card className="w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-semibold">앱 등록</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">회사 *</label>
                <select
                  className="w-full border border-zinc-300 dark:border-zinc-700 rounded px-3 py-2 text-sm bg-white dark:bg-zinc-900"
                  value={form.company_id}
                  onChange={(e) => setForm({ ...form, company_id: e.target.value })}
                >
                  <option value="">선택하세요</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">앱명 *</label>
                <input
                  className="w-full border border-zinc-300 dark:border-zinc-700 rounded px-3 py-2 text-sm bg-white dark:bg-zinc-900"
                  value={form.app_name}
                  onChange={(e) => setForm({ ...form, app_name: e.target.value })}
                  placeholder="예: KB스타뱅킹"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">플랫폼</label>
                <select
                  className="w-full border border-zinc-300 dark:border-zinc-700 rounded px-3 py-2 text-sm bg-white dark:bg-zinc-900"
                  value={form.platform}
                  onChange={(e) => setForm({ ...form, platform: e.target.value as AppCreate["platform"] })}
                >
                  <option value="both">iOS + Android</option>
                  <option value="ios">iOS</option>
                  <option value="android">Android</option>
                </select>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.is_target} onChange={(e) => setForm({ ...form, is_target: e.target.checked })} />
                  Target 앱
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.is_competitor} onChange={(e) => setForm({ ...form, is_competitor: e.target.checked })} />
                  경쟁사
                </label>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>취소</Button>
              <Button
                onClick={() => createMut.mutate(form)}
                disabled={!form.company_id || !form.app_name || createMut.isPending}
              >
                {createMut.isPending ? "저장 중..." : "저장"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
