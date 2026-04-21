"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteDocument, getDocument, updateDocument } from "@/lib/api/kb";
import { qk } from "@/lib/query-keys";
import type { DocType } from "@/lib/schemas/enums";

import { KbForm } from "../../_components/kb-form";

const DOC_TYPE_LABEL: Record<DocType, string> = {
  faq: "FAQ",
  release_note: "릴리즈노트",
  announcement: "공지",
  incident_response: "장애 대응",
  cs_policy: "CS 정책",
  forbidden_expression: "금지 표현",
};

export function KbDetail({ id }: { id: number }) {
  const qc = useQueryClient();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey: qk.kb.detail(id),
    queryFn: () => getDocument(id),
  });

  const update = useMutation({
    mutationFn: (payload: Parameters<typeof updateDocument>[1]) => updateDocument(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.kb.detail(id) });
      qc.invalidateQueries({ queryKey: ["kb", "list"] });
      setEditing(false);
      setError(null);
    },
    onError: (e: Error) => setError(e.message),
  });

  const remove = useMutation({
    mutationFn: () => deleteDocument(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["kb", "list"] });
      router.replace("/kb");
    },
    onError: (e: Error) => setError(e.message),
  });

  if (isLoading) return <p className="text-sm text-zinc-500">불러오는 중…</p>;
  if (isError || !data) {
    return (
      <Card>
        <CardBody>
          <p className="text-sm text-rose-600">
            문서를 불러오지 못했습니다: {(queryError as Error)?.message ?? "not found"}
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/kb" className="text-sm text-zinc-500 hover:underline">
          ← 지식 베이스
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{data.title}</h1>
          <div className="flex items-center gap-2">
            <Badge tone="info">{DOC_TYPE_LABEL[data.doc_type]}</Badge>
            {data.active ? <Badge tone="ok">active</Badge> : <Badge tone="neutral">inactive</Badge>}
            <span className="text-xs text-zinc-500">
              v{data.version} · {new Date(data.updated_at).toLocaleString()}
            </span>
          </div>
        </div>
        {data.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {data.tags.map((t) => (
              <Badge key={t} tone="neutral" className="text-[10px]">
                {t}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {error && (
        <Card>
          <CardBody>
            <p className="text-sm text-rose-600">{error}</p>
          </CardBody>
        </Card>
      )}

      {editing ? (
        <Card>
          <CardHeader>
            <CardTitle>편집</CardTitle>
          </CardHeader>
          <CardBody>
            <KbForm
              submitLabel="저장"
              initial={data}
              onSubmit={(v) => update.mutate(v)}
              onCancel={() => {
                setEditing(false);
                setError(null);
              }}
              isSubmitting={update.isPending}
            />
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>본문</CardTitle>
              <div className="flex gap-2">
                <Button onClick={() => setEditing(true)}>편집</Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    if (confirm(`"${data.title}" 문서를 삭제하시겠습니까?`)) {
                      remove.mutate();
                    }
                  }}
                  disabled={remove.isPending}
                >
                  삭제
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <pre className="whitespace-pre-wrap font-sans text-sm leading-6">{data.content}</pre>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
