"use client";

import { useMutation } from "@tanstack/react-query";
import { type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { compareClassification } from "@/lib/api/classifications";
import type { ClassificationPayload } from "@/lib/schemas/classification";

type Row = {
  label: string;
  stub: ReactNode;
  llm: ReactNode;
  equal: boolean;
};

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const s = new Set(b);
  return a.every((x) => s.has(x));
}

function pct(n: number | null | undefined): string {
  if (n == null) return "—";
  return `${(n * 100).toFixed(1)}%`;
}

function fixed(n: number | null | undefined, digits = 2): string {
  if (n == null) return "—";
  return n.toFixed(digits);
}

function renderBadgeList(values: string[]): ReactNode {
  return (
    <div className="flex flex-wrap gap-1">
      {values.map((v) => (
        <Badge key={v} tone="neutral">
          {v}
        </Badge>
      ))}
    </div>
  );
}

function buildRows(stub: ClassificationPayload, llm: ClassificationPayload): Row[] {
  const rows: Row[] = [];
  rows.push({
    label: "카테고리",
    stub: renderBadgeList(stub.categories),
    llm: renderBadgeList(llm.categories),
    equal: arraysEqual([...stub.categories], [...llm.categories]),
  });
  rows.push({
    label: "감성",
    stub: stub.sentiment,
    llm: llm.sentiment,
    equal: stub.sentiment === llm.sentiment,
  });
  rows.push({
    label: "긴급도",
    stub: stub.urgency,
    llm: llm.urgency,
    equal: stub.urgency === llm.urgency,
  });
  rows.push({
    label: "신뢰도",
    stub: pct(stub.confidence),
    llm: pct(llm.confidence),
    equal: Math.abs(stub.confidence - llm.confidence) < 0.01,
  });
  rows.push({
    label: "애매도",
    stub: fixed(stub.ambiguity_score),
    llm: fixed(llm.ambiguity_score),
    equal:
      stub.ambiguity_score != null &&
      llm.ambiguity_score != null &&
      Math.abs(stub.ambiguity_score - llm.ambiguity_score) < 0.02,
  });
  rows.push({
    label: "엔트로피(norm)",
    stub: fixed(stub.entropy),
    llm: fixed(llm.entropy),
    equal:
      stub.entropy != null &&
      llm.entropy != null &&
      Math.abs(stub.entropy - llm.entropy) < 0.02,
  });
  rows.push({
    label: "명확화 필요",
    stub: String(stub.needs_clarification),
    llm: String(llm.needs_clarification),
    equal: stub.needs_clarification === llm.needs_clarification,
  });
  rows.push({
    label: "OOD",
    stub: String(stub.out_of_distribution),
    llm: String(llm.out_of_distribution),
    equal: stub.out_of_distribution === llm.out_of_distribution,
  });
  rows.push({
    label: "모델",
    stub: <code className="text-xs">{stub.model_version}</code>,
    llm: <code className="text-xs">{llm.model_version}</code>,
    equal: false, // always different; don't highlight
  });
  return rows;
}

export function ShadowCompare({ reviewId }: { reviewId: number }) {
  const compare = useMutation({
    mutationFn: () => compareClassification(reviewId),
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Shadow 비교 (stub vs LLM)</CardTitle>
          <Button
            onClick={() => compare.mutate()}
            disabled={compare.isPending}
            variant="secondary"
          >
            {compare.isPending ? "실행 중…" : compare.data ? "다시 비교" : "비교 실행"}
          </Button>
        </div>
      </CardHeader>
      <CardBody>
        {!compare.data && !compare.isPending && !compare.isError && (
          <p className="text-sm text-zinc-500">
            두 분류기(휴리스틱 stub + OpenAI)를 같은 본문에 돌려 결과를 나란히 봅니다.
            결과는 저장되지 않습니다 (blueprint §18.1 shadow mode).
          </p>
        )}
        {compare.isError && (
          <p className="text-sm text-rose-600">
            비교 실패: {(compare.error as Error).message}
          </p>
        )}
        {compare.data && (
          <ResultTable data={compare.data} />
        )}
      </CardBody>
    </Card>
  );
}

function ResultTable({
  data,
}: {
  data: { stub: ClassificationPayload; llm: ClassificationPayload | null; llm_error: string | null };
}) {
  if (!data.llm) {
    return (
      <div className="space-y-3 text-sm">
        <p className="text-rose-600">LLM 실행 불가: {data.llm_error ?? "알 수 없음"}</p>
        <p className="text-zinc-500">Stub 결과는 참고용으로 표시:</p>
        <dl className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <Field label="카테고리">{renderBadgeList(data.stub.categories)}</Field>
          <Field label="감성">{data.stub.sentiment}</Field>
          <Field label="신뢰도">{pct(data.stub.confidence)}</Field>
          <Field label="애매도">{fixed(data.stub.ambiguity_score)}</Field>
        </dl>
      </div>
    );
  }

  const rows = buildRows(data.stub, data.llm);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase tracking-wide text-zinc-500">
          <tr>
            <th className="w-32 py-2 font-medium">지표</th>
            <th className="py-2 font-medium">Stub</th>
            <th className="py-2 font-medium">LLM</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {rows.map((r) => (
            <tr
              key={r.label}
              className={
                r.equal
                  ? ""
                  : "bg-amber-50/60 dark:bg-amber-900/10"
              }
            >
              <td className="py-2 pr-3 font-medium text-zinc-600 dark:text-zinc-300">
                {r.label}
              </td>
              <td className="py-2 pr-3">{r.stub}</td>
              <td className="py-2 pr-3">{r.llm}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-[11px] text-zinc-500">
        다른 값은 연한 호박색 배경. 이 결과는 저장되지 않으며 정책 평가에도 사용되지 않습니다.
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</dt>
      <dd className="mt-1">{children}</dd>
    </div>
  );
}
