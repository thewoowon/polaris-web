"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getPolicyRulesRaw,
  savePolicyRules,
  validatePolicyRules,
} from "@/lib/api/policy";
import { qk } from "@/lib/query-keys";

type ValidationState =
  | { status: "idle" }
  | { status: "ok"; rule_count: number; version: string | null | undefined }
  | { status: "error"; message: string };

export function PolicyRulesEditor() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string>("");
  const [validation, setValidation] = useState<ValidationState>({ status: "idle" });

  const raw = useQuery({
    queryKey: ["policy", "rules", "raw"],
    queryFn: getPolicyRulesRaw,
    staleTime: 60_000,
  });

  // Seed the textarea whenever the raw query resolves (or the user cancels).
  useEffect(() => {
    if (raw.data && !editing) {
      setDraft(raw.data.yaml);
    }
  }, [raw.data, editing]);

  const validate = useMutation({
    mutationFn: (yaml: string) => validatePolicyRules(yaml),
    onSuccess: (res) =>
      setValidation({ status: "ok", rule_count: res.rule_count, version: res.version }),
    onError: (e: Error) => setValidation({ status: "error", message: e.message }),
  });

  const save = useMutation({
    mutationFn: (yaml: string) => savePolicyRules(yaml),
    onSuccess: (res) => {
      setValidation({ status: "ok", rule_count: res.rule_count, version: res.version });
      qc.invalidateQueries({ queryKey: qk.policy.rules });
      qc.invalidateQueries({ queryKey: ["policy", "rules", "raw"] });
      setEditing(false);
    },
    onError: (e: Error) => setValidation({ status: "error", message: e.message }),
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>rules.yaml 편집</CardTitle>
          <div className="flex items-center gap-2">
            {raw.data && (
              <span className="font-mono text-[11px] text-zinc-500">{raw.data.path}</span>
            )}
            {editing ? (
              <Button
                variant="secondary"
                onClick={() => {
                  setEditing(false);
                  setValidation({ status: "idle" });
                  if (raw.data) setDraft(raw.data.yaml);
                }}
              >
                취소
              </Button>
            ) : (
              <Button onClick={() => setEditing(true)} disabled={!raw.data}>
                편집
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardBody className="space-y-3 text-sm">
        {raw.isLoading && <p className="text-zinc-500">불러오는 중…</p>}
        {raw.isError && (
          <p className="text-rose-600">
            raw YAML을 불러오지 못했습니다: {(raw.error as Error).message}
          </p>
        )}

        {raw.data && (
          <>
            <textarea
              className="min-h-80 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 font-mono text-[12px] leading-5 dark:border-zinc-700 dark:bg-zinc-900"
              value={draft}
              readOnly={!editing}
              onChange={(e) => {
                setDraft(e.target.value);
                setValidation({ status: "idle" });
              }}
              spellCheck={false}
            />

            {validation.status === "ok" && (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Badge tone="ok">valid</Badge>
                <span className="text-zinc-500">
                  version={validation.version ?? "—"} · rules={validation.rule_count}
                </span>
              </div>
            )}
            {validation.status === "error" && (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Badge tone="danger">invalid</Badge>
                <span className="text-rose-600">{validation.message}</span>
              </div>
            )}

            {editing && (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={() => validate.mutate(draft)}
                  disabled={validate.isPending || !draft.trim()}
                >
                  {validate.isPending ? "검증 중…" : "검증"}
                </Button>
                <Button
                  variant="primary"
                  onClick={() => save.mutate(draft)}
                  disabled={save.isPending || !draft.trim()}
                >
                  {save.isPending ? "저장 중…" : "저장 + 즉시 적용"}
                </Button>
                <span className="text-[11px] text-zinc-500">
                  저장 시 바로 엔진이 reload 됩니다. 검증 실패 시 기존 룰이 그대로 유지됩니다.
                </span>
              </div>
            )}
          </>
        )}
      </CardBody>
    </Card>
  );
}
