"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { clarifyClassification } from "@/lib/api/classifications";
import { qk } from "@/lib/query-keys";
import { type ReviewCategory, reviewCategorySchema } from "@/lib/schemas/enums";

const ALL_CATEGORIES = reviewCategorySchema.options as readonly ReviewCategory[];

type Candidate = { label?: unknown; score?: unknown };

function parseCandidate(raw: Candidate): { label: ReviewCategory; score: number } | null {
  if (typeof raw.label !== "string") return null;
  const parsed = reviewCategorySchema.safeParse(raw.label);
  if (!parsed.success) return null;
  const score = typeof raw.score === "number" ? raw.score : Number(raw.score ?? 0);
  return { label: parsed.data, score: Number.isFinite(score) ? score : 0 };
}

export function ClarifyPanel({
  reviewId,
  topCandidates,
  reasonCodes,
}: {
  reviewId: number;
  topCandidates: Array<Record<string, unknown>> | null;
  reasonCodes: string[];
}) {
  const qc = useQueryClient();
  const [picked, setPicked] = useState<ReviewCategory | "">("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const candidates = useMemo(() => {
    if (!topCandidates) return [];
    return topCandidates
      .map((c) => parseCandidate(c as Candidate))
      .filter((c): c is { label: ReviewCategory; score: number } => c !== null);
  }, [topCandidates]);

  const clarify = useMutation({
    mutationFn: () =>
      clarifyClassification(reviewId, {
        categories: [picked as ReviewCategory],
        reason: reason.trim() || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.reviews.detail(reviewId) });
      setError(null);
    },
    onError: (e: Error) => setError(e.message),
  });

  return (
    <Card className="border-amber-300 dark:border-amber-700">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>명확화 필요 · 카테고리 확정</CardTitle>
          <Badge tone="warning">request_clarification</Badge>
        </div>
      </CardHeader>
      <CardBody className="space-y-4 text-sm">
        <p className="text-zinc-600 dark:text-zinc-300">
          분류가 애매해 자동 처리가 보류됐습니다. 아래에서 올바른 카테고리를 하나 고르면
          분류가 갱신되고 정책이 재평가됩니다.
        </p>

        {reasonCodes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {reasonCodes.map((r) => (
              <Badge key={r} tone="neutral" className="text-[10px]">
                {r}
              </Badge>
            ))}
          </div>
        )}

        {candidates.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
              Top 후보
            </p>
            <div className="flex flex-wrap gap-2">
              {candidates.map((c) => {
                const active = picked === c.label;
                return (
                  <button
                    type="button"
                    key={c.label}
                    onClick={() => setPicked(c.label)}
                    className={
                      "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition-colors " +
                      (active
                        ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                        : "border-zinc-300 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800")
                    }
                  >
                    <span className="font-medium">{c.label}</span>
                    <span className="text-zinc-500 dark:text-zinc-400">
                      {(c.score * 100).toFixed(0)}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
            다른 카테고리
          </label>
          <select
            value={picked}
            onChange={(e) => setPicked(e.target.value as ReviewCategory | "")}
            className="mt-1 h-9 rounded-md border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="">-- 선택 --</option>
            {ALL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
            사유 (선택, audit log에 기록)
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="예: LLM이 complaint로 봤지만 본문은 UX 이슈"
            maxLength={500}
            className="mt-1 h-9 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>

        {error && <p className="text-xs text-rose-600">{error}</p>}

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={() => clarify.mutate()}
            disabled={!picked || clarify.isPending}
          >
            {clarify.isPending ? "처리 중…" : "카테고리 확정 + 정책 재평가"}
          </Button>
          <span className="text-xs text-zinc-500">
            확정 후 `draft_reply`/`create_issue` 등으로 전환되면 초안 생성 흐름으로 이어집니다.
          </span>
        </div>
      </CardBody>
    </Card>
  );
}
