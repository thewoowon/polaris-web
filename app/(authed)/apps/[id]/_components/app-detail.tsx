"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { appsApi } from "@/lib/api/apps";
import { companiesApi } from "@/lib/api/companies";
import { reportsApi } from "@/lib/api/reports";

const SEVERITY_COLORS: Record<string, string> = {
  low: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  critical: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400",
};

const ISSUE_TYPE_LABELS: Record<string, string> = {
  ux: "UX", bug: "버그", performance: "성능", policy: "정책",
  operation: "운영", customer_support: "고객지원", pricing: "가격",
  security: "보안", authentication: "인증", unknown: "기타",
};

function KpiCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-zinc-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold mt-1 tabular-nums">{value}</p>
      {sub && <p className="text-xs text-zinc-400 mt-0.5">{sub}</p>}
    </Card>
  );
}

export function AppDetail({ appId }: { appId: string }) {
  const qc = useQueryClient();
  const router = useRouter();
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportPeriod, setReportPeriod] = useState({
    period_start: "2026-01-01",
    period_end: "2026-05-31",
  });
  const [ingestionEdit, setIngestionEdit] = useState<{
    play_store_package: string;
    app_store_id: string;
    ingestion_enabled: boolean;
  } | null>(null);

  const { data: app, isLoading: appLoading } = useQuery({
    queryKey: ["apps", appId],
    queryFn: () => appsApi.get(appId),
  });

  const { data: summary } = useQuery({
    queryKey: ["app-summary", appId],
    queryFn: () => appsApi.summary(appId),
    enabled: !!app,
  });

  const { data: clusters, refetch: refetchClusters } = useQuery({
    queryKey: ["app-clusters", appId],
    queryFn: () => appsApi.clusters(appId),
    enabled: !!app,
  });

  const { data: insights, refetch: refetchInsights } = useQuery({
    queryKey: ["app-insights", appId],
    queryFn: () => appsApi.insights(appId),
    enabled: !!app,
  });

  const clusterMut = useMutation({
    mutationFn: () => appsApi.cluster(appId),
    onSuccess: () => refetchClusters(),
  });

  const insightMut = useMutation({
    mutationFn: () => appsApi.generateInsights(appId),
    onSuccess: () => refetchInsights(),
  });

  const updateMut = useMutation({
    mutationFn: (body: Parameters<typeof appsApi.update>[1]) =>
      appsApi.update(appId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["apps", appId] });
      setIngestionEdit(null);
    },
  });

  const reportMut = useMutation({
    mutationFn: () =>
      reportsApi.generate({
        company_id: app!.company_id,
        app_id: appId,
        ...reportPeriod,
      }),
    onSuccess: (r) => {
      setShowReportModal(false);
      router.push(`/reports/${r.id}`);
    },
  });

  if (appLoading) return <p className="text-sm text-zinc-500">불러오는 중...</p>;
  if (!app) return <p className="text-sm text-rose-600">앱을 찾을 수 없습니다.</p>;

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Link href="/apps" className="hover:text-zinc-900">Apps</Link>
            <span>/</span>
            <span className="text-zinc-900 dark:text-zinc-100 font-medium">{app.app_name}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            {app.is_target && <Badge tone="info">Target</Badge>}
            {app.is_competitor && <Badge tone="neutral">경쟁사</Badge>}
            <Badge tone="neutral">{app.platform}</Badge>
            {app.company_name && (
              <Link href={`/companies/${app.company_id}`} className="text-sm text-zinc-500 hover:text-blue-600">
                {app.company_name}
              </Link>
            )}
          </div>
        </div>
        <Button onClick={() => setShowReportModal(true)}>리포트 생성</Button>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="총 리뷰 수" value={(summary?.total_reviews ?? app.review_count).toLocaleString()} />
        <KpiCard
          label="평균 평점"
          value={summary?.average_rating?.toFixed(1) ?? app.average_rating?.toFixed(1) ?? "-"}
          sub="/ 5.0"
        />
        <KpiCard
          label="부정 리뷰 비율"
          value={summary ? `${(summary.negative_ratio * 100).toFixed(1)}%` : app.negative_ratio ? `${(app.negative_ratio * 100).toFixed(1)}%` : "-"}
        />
        <KpiCard label="Critical 이슈" value={summary?.critical_count ?? 0} sub="건" />
      </div>

      {/* Analysis Actions */}
      <Card className="p-4">
        <h2 className="text-sm font-medium mb-3">분석 실행</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => clusterMut.mutate()}
            disabled={clusterMut.isPending}
          >
            {clusterMut.isPending ? "클러스터링 중..." : "클러스터 분석"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => insightMut.mutate()}
            disabled={insightMut.isPending || !clusters?.length}
          >
            {insightMut.isPending ? "인사이트 생성 중..." : "인사이트 생성"}
          </Button>
          {!clusters?.length && (
            <p className="text-xs text-zinc-400 self-center">클러스터를 먼저 생성하세요.</p>
          )}
        </div>
      </Card>

      {/* Ingestion Settings */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium">수집 설정</h2>
          {ingestionEdit ? (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setIngestionEdit(null)}>취소</Button>
              <Button
                onClick={() => updateMut.mutate(ingestionEdit)}
                disabled={updateMut.isPending}
              >
                {updateMut.isPending ? "저장 중..." : "저장"}
              </Button>
            </div>
          ) : (
            <Button
              variant="secondary"
              onClick={() =>
                setIngestionEdit({
                  play_store_package: app.play_store_package ?? "",
                  app_store_id: app.app_store_id ?? "",
                  ingestion_enabled: app.ingestion_enabled,
                })
              }
            >
              편집
            </Button>
          )}
        </div>

        {ingestionEdit ? (
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setIngestionEdit({ ...ingestionEdit, ingestion_enabled: !ingestionEdit.ingestion_enabled })}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  ingestionEdit.ingestion_enabled ? "bg-blue-600" : "bg-zinc-300 dark:bg-zinc-600"
                }`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                  ingestionEdit.ingestion_enabled ? "translate-x-4" : "translate-x-1"
                }`} />
              </div>
              <span className="text-sm">자동 수집 활성화</span>
            </label>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Play Store 패키지명</label>
              <input
                className="w-full border border-zinc-300 dark:border-zinc-700 rounded px-3 py-2 text-sm bg-white dark:bg-zinc-900"
                value={ingestionEdit.play_store_package}
                onChange={(e) => setIngestionEdit({ ...ingestionEdit, play_store_package: e.target.value })}
                placeholder="예: com.kakaobank.channel"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">App Store ID</label>
              <input
                className="w-full border border-zinc-300 dark:border-zinc-700 rounded px-3 py-2 text-sm bg-white dark:bg-zinc-900"
                value={ingestionEdit.app_store_id}
                onChange={(e) => setIngestionEdit({ ...ingestionEdit, app_store_id: e.target.value })}
                placeholder="예: 1483145867"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-zinc-500 mb-0.5">자동 수집</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                app.ingestion_enabled
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-zinc-100 text-zinc-500"
              }`}>
                {app.ingestion_enabled ? "활성" : "비활성"}
              </span>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-0.5">Play Store</p>
              <p className="text-zinc-700 dark:text-zinc-300 font-mono text-xs truncate">
                {app.play_store_package ?? <span className="text-zinc-400">미설정</span>}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-0.5">App Store ID</p>
              <p className="text-zinc-700 dark:text-zinc-300 font-mono text-xs">
                {app.app_store_id ?? <span className="text-zinc-400">미설정</span>}
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Clusters */}
      {(clusters?.length ?? 0) > 0 && (
        <section>
          <h2 className="text-lg font-medium mb-3">반복 불만 클러스터</h2>
          <div className="space-y-2">
            {clusters!.map((c) => (
              <Card key={c.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{c.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SEVERITY_COLORS[c.severity]}`}>
                        {c.severity.toUpperCase()}
                      </span>
                      <Badge tone="neutral" className="text-xs">
                        {ISSUE_TYPE_LABELS[c.issue_type] ?? c.issue_type}
                      </Badge>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{c.summary}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium tabular-nums">{c.review_count}건</p>
                    <p className="text-xs text-zinc-500">{(c.negative_ratio * 100).toFixed(0)}% 부정</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Insights */}
      {(insights?.length ?? 0) > 0 && (
        <section>
          <h2 className="text-lg font-medium mb-3">인사이트</h2>
          <div className="space-y-2">
            {insights!.map((ins) => (
              <Card key={ins.id} className="p-4">
                <div className="flex items-start gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${SEVERITY_COLORS[ins.severity]}`}>
                    {ins.severity.toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{ins.title}</p>
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-3">{ins.summary}</p>
                    <p className="text-xs text-blue-700 dark:text-blue-400 mt-2">
                      → {ins.recommended_action.slice(0, 120)}
                    </p>
                  </div>
                  <Badge tone="neutral" className="shrink-0">{ins.business_impact}</Badge>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <Card className="w-full max-w-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold">리포트 생성</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">분석 시작일</label>
                <input
                  type="date"
                  className="w-full border border-zinc-300 dark:border-zinc-700 rounded px-3 py-2 text-sm bg-white dark:bg-zinc-900"
                  value={reportPeriod.period_start}
                  onChange={(e) => setReportPeriod((p) => ({ ...p, period_start: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">분석 종료일</label>
                <input
                  type="date"
                  className="w-full border border-zinc-300 dark:border-zinc-700 rounded px-3 py-2 text-sm bg-white dark:bg-zinc-900"
                  value={reportPeriod.period_end}
                  onChange={(e) => setReportPeriod((p) => ({ ...p, period_end: e.target.value }))}
                />
              </div>
            </div>
            <p className="text-xs text-zinc-400">
              클러스터와 인사이트가 생성된 상태에서 리포트를 생성하면 품질이 더 높습니다.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setShowReportModal(false)}>취소</Button>
              <Button onClick={() => reportMut.mutate()} disabled={reportMut.isPending}>
                {reportMut.isPending ? "생성 중..." : "리포트 생성"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
