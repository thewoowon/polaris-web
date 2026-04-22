"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { listAudit } from "@/lib/api/audit";
import { qk } from "@/lib/query-keys";

const PAGE_SIZE = 50;

const ENTITY_TYPES = [
  "",
  "review",
  "classification_result",
  "policy_decision",
  "reply_draft",
  "kb_document",
] as const;

const ENTITY_LABEL: Record<(typeof ENTITY_TYPES)[number], string> = {
  "": "엔티티: 전체",
  review: "review",
  classification_result: "classification_result",
  policy_decision: "policy_decision",
  reply_draft: "reply_draft",
  kb_document: "kb_document",
};

function useDebounced<T>(value: T, ms = 250): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

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
  create: "info",
  update: "info",
  delete: "danger",
  seed: "neutral",
};

// Known action values — surfaced in the action filter dropdown. Server-side
// accepts any string, so "__other__" prompts a plain text field.
const ACTION_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "액션: 전체" },
  { value: "ingest", label: "ingest" },
  { value: "bulk_ingest", label: "bulk_ingest" },
  { value: "classify", label: "classify" },
  { value: "reclassify", label: "reclassify" },
  { value: "clarify", label: "clarify" },
  { value: "evaluate", label: "evaluate" },
  { value: "re_evaluate", label: "re_evaluate" },
  { value: "re_evaluate_after_clarify", label: "re_evaluate_after_clarify" },
  { value: "generate", label: "generate" },
  { value: "regenerate", label: "regenerate" },
  { value: "approve", label: "approve" },
  { value: "publish", label: "publish" },
  { value: "reject", label: "reject" },
  { value: "create", label: "create" },
  { value: "update", label: "update" },
  { value: "delete", label: "delete" },
  { value: "seed", label: "seed" },
];

export function AuditList() {
  const [offset, setOffset] = useState(0);
  const [entityType, setEntityType] = useState<(typeof ENTITY_TYPES)[number]>("");
  const [entityIdStr, setEntityIdStr] = useState("");
  const [action, setAction] = useState("");
  const [actor, setActor] = useState("");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const debouncedId = useDebounced(entityIdStr);
  const debouncedAction = useDebounced(action);
  const debouncedActor = useDebounced(actor);

  const entityIdNum = useMemo(() => {
    const n = Number(debouncedId);
    return debouncedId && Number.isInteger(n) && n > 0 ? n : null;
  }, [debouncedId]);

  const params = {
    limit: PAGE_SIZE,
    offset,
    entity_type: entityType || null,
    entity_id: entityIdNum,
    action: debouncedAction.trim() || null,
    actor: debouncedActor.trim() || null,
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: qk.audit.list(params),
    queryFn: () => listAudit(params),
    placeholderData: keepPreviousData,
  });

  const onReset = () => {
    setEntityType("");
    setEntityIdStr("");
    setAction("");
    setActor("");
    setOffset(0);
    setExpanded(new Set());
  };

  if (isError) {
    return (
      <Card className="p-6">
        <p className="text-sm text-rose-600">
          감사 로그를 불러오지 못했습니다: {(error as Error).message}
        </p>
      </Card>
    );
  }

  const total = data?.total ?? 0;
  const to = Math.min(offset + PAGE_SIZE, total);

  const inputCls =
    "h-9 rounded-md border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900";

  const toggle = (id: number) => {
    setExpanded((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <select
          className={inputCls}
          value={entityType}
          onChange={(e) => {
            setEntityType(e.target.value as (typeof ENTITY_TYPES)[number]);
            setOffset(0);
          }}
        >
          {ENTITY_TYPES.map((t) => (
            <option key={t} value={t}>
              {ENTITY_LABEL[t]}
            </option>
          ))}
        </select>
        <input
          className={`${inputCls} w-28`}
          placeholder="entity_id"
          value={entityIdStr}
          onChange={(e) => {
            setEntityIdStr(e.target.value.replace(/[^0-9]/g, ""));
            setOffset(0);
          }}
        />
        <select
          className={inputCls}
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            setOffset(0);
          }}
        >
          {ACTION_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <input
          className={inputCls}
          placeholder="actor 예: system"
          value={actor}
          onChange={(e) => {
            setActor(e.target.value);
            setOffset(0);
          }}
        />
        <button
          type="button"
          onClick={onReset}
          className="h-9 rounded-md px-3 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          초기화
        </button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              <tr>
                <th className="w-10 px-4 py-3 font-medium"></th>
                <th className="px-4 py-3 font-medium">시각</th>
                <th className="px-4 py-3 font-medium">엔티티</th>
                <th className="px-4 py-3 font-medium">액션</th>
                <th className="px-4 py-3 font-medium">행위자</th>
                <th className="px-4 py-3 font-medium">사유</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {isLoading && !data && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-zinc-500">
                    불러오는 중…
                  </td>
                </tr>
              )}
              {data && data.items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-zinc-500">
                    조건에 맞는 감사 기록이 없습니다.
                  </td>
                </tr>
              )}
              {data?.items.map((r) => {
                const isOpen = expanded.has(r.id);
                const tone = ACTION_TONE[r.action] ?? "neutral";
                return (
                  <AuditRow
                    key={r.id}
                    row={r}
                    tone={tone}
                    isOpen={isOpen}
                    onToggle={() => toggle(r.id)}
                  />
                );
              })}
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
    </div>
  );
}

function AuditRow({
  row,
  tone,
  isOpen,
  onToggle,
}: {
  row: {
    id: number;
    entity_type: string;
    entity_id: number | null;
    action: string;
    actor: string;
    before: Record<string, unknown> | null;
    after: Record<string, unknown> | null;
    reason: string | null;
    created_at: string;
  };
  tone: "ok" | "warning" | "danger" | "info" | "neutral";
  isOpen: boolean;
  onToggle: () => void;
}) {
  const hasDetail = row.before != null || row.after != null;
  return (
    <>
      <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
        <td className="px-4 py-3">
          <button
            type="button"
            onClick={onToggle}
            disabled={!hasDetail}
            className="text-xs text-zinc-500 hover:text-zinc-900 disabled:opacity-30 dark:hover:text-zinc-100"
          >
            {hasDetail ? (isOpen ? "▾" : "▸") : "·"}
          </button>
        </td>
        <td className="px-4 py-3 font-mono text-xs text-zinc-500">
          {new Date(row.created_at).toLocaleString()}
        </td>
        <td className="px-4 py-3 font-mono text-xs">
          {row.entity_type}
          {row.entity_id != null && (
            <span className="text-zinc-400">#{row.entity_id}</span>
          )}
        </td>
        <td className="px-4 py-3">
          <Badge tone={tone}>{row.action}</Badge>
        </td>
        <td className="px-4 py-3 font-mono text-xs">{row.actor}</td>
        <td className="max-w-md px-4 py-3 text-xs text-zinc-500">
          <span className="block truncate">{row.reason ?? "—"}</span>
        </td>
      </tr>
      {isOpen && hasDetail && (
        <tr>
          <td colSpan={6} className="bg-zinc-50 px-4 py-3 dark:bg-zinc-900/50">
            <div className="grid gap-4 md:grid-cols-2">
              <JsonBlock title="before" data={row.before} />
              <JsonBlock title="after" data={row.after} />
            </div>
          </td>
        </tr>
      )}
    </>
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
      <pre className="max-h-60 overflow-auto rounded-md border border-zinc-200 bg-white p-2 font-mono text-[11px] leading-5 dark:border-zinc-700 dark:bg-zinc-900">
        {data == null ? <span className="text-zinc-400">null</span> : JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
