"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { listQueue } from "@/lib/api/queue";
import { qk } from "@/lib/query-keys";
import type { PolicyAction, ReplyStatus } from "@/lib/schemas/enums";

const PAGE_SIZE = 20;

const ACTION_TONE: Record<PolicyAction, "ok" | "info" | "warning" | "danger" | "neutral"> = {
  auto_reply: "ok",
  draft_reply: "info",
  request_clarification: "warning",
  route_to_human: "warning",
  create_issue: "danger",
  ignore: "neutral",
};

const STATUS_TONE: Record<ReplyStatus, "neutral" | "ok" | "warning" | "danger" | "info"> = {
  pending: "neutral",
  approved: "ok",
  rejected: "danger",
  published: "info",
};

function riskTone(risk: number): "ok" | "warning" | "danger" {
  if (risk >= 0.75) return "danger";
  if (risk >= 0.5) return "warning";
  return "ok";
}

function ageLabel(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function QueueTable() {
  const [offset, setOffset] = useState(0);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: qk.queue.list({ limit: PAGE_SIZE, offset }),
    queryFn: () => listQueue({ limit: PAGE_SIZE, offset }),
    placeholderData: keepPreviousData,
  });

  if (isError) {
    return (
      <Card className="p-6">
        <p className="text-sm text-rose-600">
          큐를 불러오지 못했습니다: {(error as Error).message}
        </p>
      </Card>
    );
  }

  const total = data?.total ?? 0;
  const to = Math.min(offset + PAGE_SIZE, total);

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">액션</th>
              <th className="px-4 py-3 font-medium">카테고리</th>
              <th className="px-4 py-3 font-medium">위험도</th>
              <th className="px-4 py-3 font-medium">본문</th>
              <th className="px-4 py-3 font-medium">사유</th>
              <th className="px-4 py-3 font-medium">상태</th>
              <th className="px-4 py-3 font-medium">경과</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {isLoading && !data && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-zinc-500">
                  불러오는 중…
                </td>
              </tr>
            )}
            {data && data.items.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-zinc-500">
                  검수 대기 중인 건이 없습니다. 🎉
                </td>
              </tr>
            )}
            {data?.items.map((it) => (
              <tr key={it.review_id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                <td className="px-4 py-3 font-mono text-xs text-zinc-500">#{it.review_id}</td>
                <td className="px-4 py-3">
                  <Badge tone={ACTION_TONE[it.action]}>{it.action}</Badge>
                </td>
                <td className="px-4 py-3">
                  {it.category ? <Badge tone="neutral">{it.category}</Badge> : "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={riskTone(it.risk_score)}>{it.risk_score.toFixed(2)}</Badge>
                </td>
                <td className="max-w-md px-4 py-3">
                  <Link
                    href={`/reviews/${it.review_id}`}
                    className="block truncate text-zinc-900 hover:underline dark:text-zinc-100"
                  >
                    {it.snippet}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {it.reason_codes.slice(0, 2).map((r) => (
                      <Badge key={r} tone="neutral" className="text-[10px]">
                        {r.length > 26 ? `${r.slice(0, 25)}…` : r}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {it.draft_status ? (
                    <Badge tone={STATUS_TONE[it.draft_status]}>{it.draft_status}</Badge>
                  ) : (
                    <span className="text-xs text-zinc-400">초안 없음</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-zinc-500">{ageLabel(it.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-3 text-sm dark:border-zinc-800">
        <p className="text-zinc-500">
          {total === 0 ? "0건" : `${offset + 1}–${to} / ${total}`}
        </p>
        <div className="flex gap-2">
          <Button
            onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
            disabled={offset === 0 || isLoading}
          >
            이전
          </Button>
          <Button
            onClick={() => setOffset((o) => o + PAGE_SIZE)}
            disabled={to >= total || isLoading}
          >
            다음
          </Button>
        </div>
      </div>
    </Card>
  );
}
