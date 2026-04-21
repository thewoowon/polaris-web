"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { classifyReview } from "@/lib/api/classifications";
import { getDocument } from "@/lib/api/kb";
import { evaluatePolicy } from "@/lib/api/policy";

import { AuditTimeline } from "./audit-timeline";
import { ClarifyPanel } from "./clarify-panel";
import { ShadowCompare } from "./shadow-compare";
import {
  approveReply,
  generateReply,
  publishReply,
  regenerateReply,
  rejectReply,
} from "@/lib/api/replies";
import { getReview } from "@/lib/api/reviews";
import { qk } from "@/lib/query-keys";
import type { PolicyAction, Sentiment } from "@/lib/schemas/enums";

const SENTIMENT_TONE: Record<Sentiment, "ok" | "warning" | "danger"> = {
  positive: "ok",
  neutral: "warning",
  negative: "danger",
};

const ACTION_TONE: Record<PolicyAction, "ok" | "info" | "warning" | "danger" | "neutral"> = {
  auto_reply: "ok",
  draft_reply: "info",
  request_clarification: "warning",
  route_to_human: "warning",
  create_issue: "danger",
  ignore: "neutral",
};

export function ReviewDetail({ id }: { id: number }) {
  const qc = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: qk.reviews.detail(id),
    queryFn: () => getReview(id),
  });

  const [editedText, setEditedText] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [groundWithKb, setGroundWithKb] = useState(false);

  const invalidate = () => qc.invalidateQueries({ queryKey: qk.reviews.detail(id) });

  const classify = useMutation({ mutationFn: () => classifyReview(id), onSuccess: invalidate });
  const evaluate = useMutation({ mutationFn: () => evaluatePolicy(id), onSuccess: invalidate });
  const generate = useMutation({
    mutationFn: () =>
      data?.reply_draft
        ? regenerateReply(id, { ground_with_kb: groundWithKb })
        : generateReply(id, { ground_with_kb: groundWithKb }),
    onSuccess: invalidate,
  });
  const approve = useMutation({
    mutationFn: () => approveReply(id, editedText ?? undefined),
    onSuccess: () => {
      setEditedText(null);
      invalidate();
    },
  });
  const reject = useMutation({
    mutationFn: () => rejectReply(id, rejectReason || "unspecified"),
    onSuccess: () => {
      setRejectReason("");
      invalidate();
    },
  });
  const publish = useMutation({ mutationFn: () => publishReply(id), onSuccess: invalidate });

  if (isLoading) return <p className="text-sm text-zinc-500">불러오는 중…</p>;
  if (isError || !data) {
    return (
      <Card>
        <CardBody>
          <p className="text-sm text-rose-600">
            리뷰를 불러오지 못했습니다: {(error as Error).message}
          </p>
        </CardBody>
      </Card>
    );
  }

  const draft = data.reply_draft;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/reviews" className="text-sm text-zinc-500 hover:underline">
          ← 리뷰 목록으로
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">리뷰 #{data.id}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
          <Badge tone="info">{data.source}</Badge>
          {data.rating != null && <span>★ {data.rating}</span>}
          {data.app_version && <span>v{data.app_version}</span>}
          {data.locale && <span>{data.locale}</span>}
          <span>수집: {new Date(data.ingested_at).toLocaleString()}</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>원문</CardTitle>
        </CardHeader>
        <CardBody>
          <p className="whitespace-pre-wrap text-sm leading-6">{data.raw_text}</p>
          {data.raw_text !== data.normalized_text && (
            <p className="mt-3 border-t border-dashed border-zinc-200 pt-3 text-xs text-zinc-500 dark:border-zinc-700">
              정규화: {data.normalized_text}
            </p>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>분류</CardTitle>
            <Button
              onClick={() => classify.mutate()}
              disabled={classify.isPending}
              variant="secondary"
            >
              {data.classification ? "재분류" : "분류 실행"}
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          {data.classification ? (
            <dl className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
              <Field label="카테고리">
                <div className="flex flex-wrap gap-1">
                  {data.classification.categories.map((c) => (
                    <Badge key={c} tone="neutral">
                      {c}
                    </Badge>
                  ))}
                </div>
              </Field>
              <Field label="감성">
                <Badge tone={SENTIMENT_TONE[data.classification.sentiment]}>
                  {data.classification.sentiment}
                </Badge>
              </Field>
              <Field label="긴급도">{data.classification.urgency}</Field>
              <Field label="신뢰도">
                {(data.classification.confidence * 100).toFixed(1)}%
                {data.classification.needs_clarification && (
                  <Badge tone="warning" className="ml-2">
                    명확화 필요
                  </Badge>
                )}
              </Field>
              <Field label="애매도">
                <AmbiguityDisplay
                  score={data.classification.ambiguity_score}
                  entropy={data.classification.entropy}
                  topCandidates={data.classification.top_candidates}
                />
              </Field>
              <Field label="모델">{data.classification.model_version}</Field>
            </dl>
          ) : (
            <p className="text-sm text-zinc-500">아직 분류되지 않았습니다.</p>
          )}
        </CardBody>
      </Card>

      {data.classification && <ShadowCompare reviewId={data.id} />}

      {data.policy_decision?.action === "request_clarification" && data.classification && (
        <ClarifyPanel
          reviewId={data.id}
          topCandidates={data.classification.top_candidates}
          reasonCodes={data.policy_decision.reason_codes}
        />
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>정책 판단</CardTitle>
            <Button
              onClick={() => evaluate.mutate()}
              disabled={!data.classification || evaluate.isPending}
              variant="secondary"
            >
              {data.policy_decision ? "재평가" : "정책 평가"}
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          {data.policy_decision ? (
            <dl className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
              <Field label="액션">
                <Badge tone={ACTION_TONE[data.policy_decision.action]}>
                  {data.policy_decision.action}
                </Badge>
              </Field>
              <Field label="위험 점수">{data.policy_decision.risk_score.toFixed(2)}</Field>
              <Field label="사유">
                <div className="flex flex-wrap gap-1">
                  {data.policy_decision.reason_codes.map((r) => (
                    <Badge key={r} tone="neutral">
                      {r}
                    </Badge>
                  ))}
                </div>
              </Field>
              <Field label="정책 버전">{data.policy_decision.policy_version}</Field>
            </dl>
          ) : (
            <p className="text-sm text-zinc-500">분류 완료 후 정책을 평가할 수 있습니다.</p>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>응답 초안</CardTitle>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                <input
                  type="checkbox"
                  checked={groundWithKb}
                  onChange={(e) => setGroundWithKb(e.target.checked)}
                  disabled={generate.isPending}
                />
                KB 참조
              </label>
              <Button
                onClick={() => generate.mutate()}
                disabled={!data.classification || generate.isPending}
              >
                {draft ? "재생성" : "초안 생성"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {draft ? (
            <div className="space-y-3 text-sm">
              <div className="flex flex-wrap gap-2">
                <Badge tone="neutral">{draft.status}</Badge>
                {draft.template_id && <Badge tone="info">tpl:{draft.template_id}</Badge>}
                {draft.requires_human_approval && <Badge tone="warning">사람 승인 필요</Badge>}
              </div>
              {draft.grounded_sources && draft.grounded_sources.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-3 py-2 text-xs dark:border-zinc-700 dark:bg-zinc-800/50">
                  <span className="text-zinc-500">참조 문서:</span>
                  {draft.grounded_sources.map((src) => (
                    <GroundedRef key={src} source={src} />
                  ))}
                </div>
              )}
              <textarea
                className="min-h-32 w-full rounded-md border border-zinc-300 bg-white p-3 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900"
                value={editedText ?? draft.generated_text}
                onChange={(e) => setEditedText(e.target.value)}
                disabled={
                  draft.status === "published" || draft.status === "rejected"
                }
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="primary"
                  onClick={() => approve.mutate()}
                  disabled={draft.status !== "pending" || approve.isPending}
                >
                  승인
                </Button>
                <Button
                  variant="primary"
                  onClick={() => publish.mutate()}
                  disabled={draft.status !== "approved" || publish.isPending}
                >
                  게시
                </Button>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="반려 사유"
                    className="h-9 rounded-md border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    disabled={draft.status === "published" || draft.status === "rejected"}
                  />
                  <Button
                    variant="danger"
                    onClick={() => reject.mutate()}
                    disabled={
                      draft.status === "published" ||
                      draft.status === "rejected" ||
                      !rejectReason.trim() ||
                      reject.isPending
                    }
                  >
                    반려
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-zinc-500">
              분류 + 정책 평가 후 초안을 생성할 수 있습니다.
            </p>
          )}
        </CardBody>
      </Card>

      <AuditTimeline reviewId={data.id} />
    </div>
  );
}

// Note: AuditTimeline is rendered at the bottom of this detail view.
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</dt>
      <dd className="mt-1">{children}</dd>
    </div>
  );
}

function AmbiguityDisplay({
  score,
  entropy,
  topCandidates,
}: {
  score: number | null;
  entropy: number | null;
  topCandidates: Array<Record<string, unknown>> | null;
}) {
  if (score == null) {
    return <span className="text-xs text-zinc-400">—</span>;
  }
  const tone: "ok" | "warning" | "danger" =
    score >= 0.65 ? "danger" : score >= 0.45 ? "warning" : "ok";

  // top1-top2 margin from the persisted candidate scores.
  let margin: number | null = null;
  if (topCandidates && topCandidates.length >= 2) {
    const s1 = Number(topCandidates[0]?.score ?? 0);
    const s2 = Number(topCandidates[1]?.score ?? 0);
    if (Number.isFinite(s1) && Number.isFinite(s2)) margin = s1 - s2;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <Badge tone={tone}>{score.toFixed(2)}</Badge>
      {entropy != null && (
        <span className="text-zinc-500">H={entropy.toFixed(2)}</span>
      )}
      {margin != null && (
        <span className="text-zinc-500">Δ={margin.toFixed(2)}</span>
      )}
      {score >= 0.65 && <Badge tone="warning">매우 애매</Badge>}
    </div>
  );
}

function GroundedRef({ source }: { source: string }) {
  // Sources are stored as "kb:<id>"; fall back to showing the raw string.
  const match = source.match(/^kb:(\d+)$/);
  if (!match) {
    return <Badge tone="neutral">{source}</Badge>;
  }
  const docId = Number(match[1]);
  return <GroundedKbRef docId={docId} />;
}

function GroundedKbRef({ docId }: { docId: number }) {
  const { data } = useQuery({
    queryKey: qk.kb.detail(docId),
    queryFn: () => getDocument(docId),
    staleTime: 60_000,
  });
  return (
    <Link
      href={`/kb/${docId}`}
      className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-xs text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-200 dark:ring-zinc-700 dark:hover:bg-zinc-800"
    >
      <span className="font-mono text-[10px] text-zinc-400">#{docId}</span>
      <span>{data?.title ?? `kb:${docId}`}</span>
    </Link>
  );
}
