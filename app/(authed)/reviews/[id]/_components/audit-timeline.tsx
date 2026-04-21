"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { getReviewAudit } from "@/lib/api/reviews";
import { qk } from "@/lib/query-keys";

const ACTION_TONE: Record<string, "ok" | "warning" | "danger" | "info" | "neutral"> = {
  ingest: "info",
  bulk_ingest: "info",
  classify: "info",
  reclassify: "info",
  clarify: "warning",
  evaluate: "info",
  re_evaluate: "info",
  re_evaluate_after_clarify: "warning",
  generate: "info",
  regenerate: "info",
  approve: "ok",
  publish: "ok",
  reject: "danger",
  seed: "neutral",
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  return (
    `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, "0")}:${d
      .getMinutes()
      .toString()
      .padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`
  );
}

export function AuditTimeline({ reviewId }: { reviewId: number }) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const { data, isLoading, isError, error } = useQuery({
    queryKey: qk.reviews.audit(reviewId),
    queryFn: () => getReviewAudit(reviewId),
    staleTime: 10_000,
  });

  const toggle = (id: number) => {
    setExpanded((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>히스토리</CardTitle>
          <span className="text-xs text-zinc-500">
            {data ? `${data.length}건` : ""}
          </span>
        </div>
      </CardHeader>
      <CardBody>
        {isLoading && <p className="text-sm text-zinc-500">불러오는 중…</p>}
        {isError && (
          <p className="text-sm text-rose-600">
            타임라인을 불러오지 못했습니다: {(error as Error).message}
          </p>
        )}
        {data && data.length === 0 && (
          <p className="text-sm text-zinc-500">아직 기록이 없습니다.</p>
        )}
        {data && data.length > 0 && (
          <ol className="relative space-y-1 border-l border-zinc-200 pl-5 dark:border-zinc-700">
            {data.map((row) => {
              const hasDetail = row.before != null || row.after != null;
              const isOpen = expanded.has(row.id);
              const tone = ACTION_TONE[row.action] ?? "neutral";
              return (
                <li key={row.id} className="relative">
                  <span className="absolute -left-[26px] top-2.5 inline-block h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                  <div className="flex flex-wrap items-center gap-2 py-1 text-xs">
                    <span className="font-mono text-zinc-500">{formatTime(row.created_at)}</span>
                    <Badge tone={tone}>{row.action}</Badge>
                    <span className="font-mono text-[11px] text-zinc-500">
                      {row.entity_type}
                      {row.entity_id != null && (
                        <span className="text-zinc-400">#{row.entity_id}</span>
                      )}
                    </span>
                    <span className="text-[11px] text-zinc-500">by {row.actor}</span>
                    {row.reason && (
                      <span className="truncate text-[11px] italic text-zinc-600 dark:text-zinc-300">
                        — {row.reason}
                      </span>
                    )}
                    {hasDetail && (
                      <button
                        type="button"
                        onClick={() => toggle(row.id)}
                        className="ml-auto text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                      >
                        {isOpen ? "접기" : "상세"}
                      </button>
                    )}
                  </div>
                  {isOpen && hasDetail && (
                    <div className="mb-2 grid gap-3 md:grid-cols-2">
                      <JsonBlock title="before" data={row.before} />
                      <JsonBlock title="after" data={row.after} />
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </CardBody>
    </Card>
  );
}

function JsonBlock({
  title,
  data,
}: {
  title: string;
  data: Record<string, unknown> | null;
}) {
  return (
    <div>
      <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
        {title}
      </p>
      <pre className="max-h-48 overflow-auto rounded-md border border-zinc-200 bg-zinc-50 p-2 font-mono text-[11px] leading-5 dark:border-zinc-700 dark:bg-zinc-900">
        {data == null ? <span className="text-zinc-400">null</span> : JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
