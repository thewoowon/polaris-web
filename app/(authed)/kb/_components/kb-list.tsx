"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { listDocuments } from "@/lib/api/kb";
import { qk } from "@/lib/query-keys";
import type { DocType } from "@/lib/schemas/enums";

import { KbFilters } from "./kb-filters";

const PAGE_SIZE = 20;

const DOC_TYPE_LABEL: Record<DocType, string> = {
  faq: "FAQ",
  release_note: "릴리즈노트",
  announcement: "공지",
  incident_response: "장애 대응",
  cs_policy: "CS 정책",
  forbidden_expression: "금지 표현",
};

function useDebounced<T>(value: T, ms = 250): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export function KbList() {
  const [docType, setDocType] = useState<DocType | "">("");
  const [query, setQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const debouncedQuery = useDebounced(query);

  const params = {
    limit: PAGE_SIZE,
    offset,
    doc_type: docType || null,
    q: debouncedQuery || null,
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: qk.kb.list(params),
    queryFn: () => listDocuments(params),
    placeholderData: keepPreviousData,
  });

  if (isError) {
    return (
      <Card className="p-6">
        <p className="text-sm text-rose-600">
          KB를 불러오지 못했습니다: {(error as Error).message}
        </p>
      </Card>
    );
  }

  const total = data?.total ?? 0;
  const to = Math.min(offset + PAGE_SIZE, total);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <KbFilters
          docType={docType}
          onDocTypeChange={(v) => {
            setDocType(v);
            setOffset(0);
          }}
          query={query}
          onQueryChange={(v) => {
            setQuery(v);
            setOffset(0);
          }}
        />
        <Link href="/kb/new">
          <Button variant="primary">새 문서</Button>
        </Link>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">유형</th>
                <th className="px-4 py-3 font-medium">제목</th>
                <th className="px-4 py-3 font-medium">태그</th>
                <th className="px-4 py-3 font-medium">상태</th>
                <th className="px-4 py-3 font-medium">수정</th>
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
                    조건에 맞는 문서가 없습니다.
                  </td>
                </tr>
              )}
              {data?.items.map((d) => (
                <tr key={d.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="px-4 py-3 font-mono text-xs text-zinc-500">#{d.id}</td>
                  <td className="px-4 py-3">
                    <Badge tone="info">{DOC_TYPE_LABEL[d.doc_type]}</Badge>
                  </td>
                  <td className="max-w-md px-4 py-3">
                    <Link
                      href={`/kb/${d.id}`}
                      className="block truncate text-zinc-900 hover:underline dark:text-zinc-100"
                    >
                      {d.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {d.tags.slice(0, 3).map((t) => (
                        <Badge key={t} tone="neutral" className="text-[10px]">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {d.active ? (
                      <Badge tone="ok">active</Badge>
                    ) : (
                      <Badge tone="neutral">inactive</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">
                    v{d.version} · {new Date(d.updated_at).toLocaleDateString()}
                  </td>
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
    </div>
  );
}
