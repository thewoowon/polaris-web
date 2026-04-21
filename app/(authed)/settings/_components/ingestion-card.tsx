"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getIngestionStatus,
  runIngestionOnce,
  startIngestion,
  stopIngestion,
} from "@/lib/api/ingestion";
import { qk } from "@/lib/query-keys";

function since(iso: string | null): string {
  if (!iso) return "—";
  const diffSec = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (diffSec < 60) return `${diffSec}초 전`;
  if (diffSec < 3600) return `${Math.round(diffSec / 60)}분 전`;
  if (diffSec < 86400) return `${Math.round(diffSec / 3600)}시간 전`;
  return new Date(iso).toLocaleString();
}

export function IngestionCard() {
  const qc = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: qk.ingestion.status,
    queryFn: getIngestionStatus,
    refetchInterval: 5_000,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: qk.ingestion.status });

  const runOnce = useMutation({ mutationFn: runIngestionOnce, onSuccess: invalidate });
  const start = useMutation({ mutationFn: startIngestion, onSuccess: invalidate });
  const stop = useMutation({ mutationFn: stopIngestion, onSuccess: invalidate });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>리뷰 수집</CardTitle>
          <div className="flex items-center gap-2">
            {data?.running ? (
              <Badge tone="ok">running</Badge>
            ) : (
              <Badge tone="neutral">stopped</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardBody>
        {isLoading && <p className="text-sm text-zinc-500">불러오는 중…</p>}
        {isError && (
          <p className="text-sm text-rose-600">
            상태를 불러오지 못했습니다: {(error as Error).message}
          </p>
        )}
        {data && (
          <div className="space-y-4 text-sm">
            <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Field label="인터벌">{data.interval_sec}초</Field>
              <Field label="총 수집">{data.total_ingested.toLocaleString()}건</Field>
              <Field label="마지막 tick">{since(data.last_run_at)}</Field>
              <Field label="에러 누적">{data.error_count}</Field>
            </dl>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                활성 소스
              </p>
              <div className="mt-1 flex flex-wrap gap-1">
                {data.sources.length === 0 ? (
                  <span className="text-xs text-zinc-500">없음</span>
                ) : (
                  data.sources.map((s) => (
                    <Badge key={s} tone="info">
                      {s}
                    </Badge>
                  ))
                )}
              </div>
            </div>

            {data.last_stats && (
              <div className="rounded-md border border-dashed border-zinc-200 bg-zinc-50 p-3 text-xs dark:border-zinc-700 dark:bg-zinc-800/60">
                <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                  지난 tick 결과
                </p>
                <p>
                  총 <b>{data.last_stats.total}</b>건 수집
                  {Object.entries(data.last_stats.per_source).map(([src, n]) => (
                    <span key={src} className="ml-2 text-zinc-500">
                      · {src}={n}
                    </span>
                  ))}
                </p>
                {data.last_stats.errors.length > 0 && (
                  <ul className="mt-1 space-y-0.5 text-rose-600">
                    {data.last_stats.errors.map((e, i) => (
                      <li key={i}>
                        · {e.source}: {e.error}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="primary"
                onClick={() => runOnce.mutate()}
                disabled={runOnce.isPending}
              >
                {runOnce.isPending ? "실행 중…" : "지금 한 번 실행"}
              </Button>
              {data.running ? (
                <Button
                  variant="danger"
                  onClick={() => stop.mutate()}
                  disabled={stop.isPending}
                >
                  {stop.isPending ? "중지 중…" : "루프 중지"}
                </Button>
              ) : (
                <Button onClick={() => start.mutate()} disabled={start.isPending}>
                  {start.isPending ? "시작 중…" : "루프 시작"}
                </Button>
              )}
              <span className="text-xs text-zinc-500">
                현재는 synthetic 소스만 등록돼 있습니다. 실제 스토어 연동은 별도 라운드.
              </span>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</dt>
      <dd className="mt-1 font-medium">{children}</dd>
    </div>
  );
}
