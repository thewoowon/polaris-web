"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Card, CardBody } from "@/components/ui/card";
import { createDocument } from "@/lib/api/kb";

import { KbForm } from "../../_components/kb-form";

export function NewKb() {
  const router = useRouter();
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: createDocument,
    onSuccess: (doc) => {
      qc.invalidateQueries({ queryKey: ["kb", "list"] });
      router.replace(`/kb/${doc.id}`);
    },
    onError: (e: Error) => setError(e.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <Link href="/kb" className="text-sm text-zinc-500 hover:underline">
          ← 지식 베이스
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">새 문서</h1>
      </div>

      {error && (
        <Card>
          <CardBody>
            <p className="text-sm text-rose-600">저장 실패: {error}</p>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardBody>
          <KbForm
            submitLabel="생성"
            onSubmit={(v) => create.mutate(v)}
            onCancel={() => router.back()}
            isSubmitting={create.isPending}
          />
        </CardBody>
      </Card>
    </div>
  );
}
