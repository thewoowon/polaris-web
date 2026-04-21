"use client";

import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { getPolicyRules } from "@/lib/api/policy";
import { qk } from "@/lib/query-keys";

const ACTION_TONE: Record<string, "ok" | "warning" | "danger" | "info" | "neutral"> = {
  auto_reply: "ok",
  draft_reply: "info",
  request_clarification: "warning",
  route_to_human: "warning",
  create_issue: "danger",
  ignore: "neutral",
};

function formatWhen(when: unknown): string {
  if (when === "always") return "always";
  if (typeof when !== "object" || when == null) return String(when);
  return JSON.stringify(when, null, 2);
}

export function PolicyRulesViewer() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: qk.policy.rules,
    queryFn: getPolicyRules,
    staleTime: 60_000,
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>정책 룰</CardTitle>
          {data && (
            <span className="text-xs text-zinc-500">
              {data.version} · {data.rules.length}개 · 상→하 순 평가
            </span>
          )}
        </div>
      </CardHeader>
      <CardBody>
        {isLoading && <p className="text-sm text-zinc-500">불러오는 중…</p>}
        {isError && (
          <p className="text-sm text-rose-600">
            룰을 불러오지 못했습니다: {(error as Error).message}
          </p>
        )}
        {data && (
          <div className="space-y-3">
            <p className="text-xs text-zinc-500">
              위에서부터 차례로 평가하다가 처음 매치된 룰이 적용됩니다. 편집은{" "}
              <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[11px] dark:bg-zinc-800">
                app/services/policy/rules.yaml
              </code>{" "}
              파일 직접 수정 + uvicorn 재시작.
            </p>
            <ol className="space-y-2">
              {data.rules.map((r, idx) => {
                const tone = ACTION_TONE[r.action] ?? "neutral";
                return (
                  <li
                    key={r.id}
                    className="rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-zinc-400">#{idx + 1}</span>
                      <span className="font-mono text-sm font-medium">{r.id}</span>
                      <Badge tone={tone}>{r.action}</Badge>
                      <span className="text-xs text-zinc-500">risk={r.risk}</span>
                      {r.reasons?.map((reason) => (
                        <Badge key={reason} tone="neutral" className="text-[10px]">
                          {reason}
                        </Badge>
                      ))}
                    </div>
                    <pre className="mt-2 overflow-auto rounded-md border border-dashed border-zinc-200 bg-zinc-50 p-2 font-mono text-[11px] leading-5 dark:border-zinc-700 dark:bg-zinc-800">
                      when: {formatWhen(r.when)}
                    </pre>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
