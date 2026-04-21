"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { listReviews } from "@/lib/api/reviews";
import { qk } from "@/lib/query-keys";

const PAGE_SIZE = 20;

export function ReviewsTable() {
  const [offset, setOffset] = useState(0);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: qk.reviews.list({ limit: PAGE_SIZE, offset }),
    queryFn: () => listReviews({ limit: PAGE_SIZE, offset }),
    placeholderData: keepPreviousData,
  });

  if (isError) {
    return (
      <Card className="p-6">
        <p className="text-sm text-rose-600">
          리뷰를 불러오지 못했습니다: {(error as Error).message}
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
              <th className="px-4 py-3 font-medium">소스</th>
              <th className="px-4 py-3 font-medium">평점</th>
              <th className="px-4 py-3 font-medium">본문</th>
              <th className="px-4 py-3 font-medium">유입</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {isLoading && !data && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-zinc-500">
                  불러오는 중…
                </td>
              </tr>
            )}
            {data?.items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-zinc-500">
                  아직 수집된 리뷰가 없습니다.
                </td>
              </tr>
            )}
            {data?.items.map((r) => (
              <tr key={r.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                <td className="px-4 py-3 font-mono text-xs text-zinc-500">#{r.id}</td>
                <td className="px-4 py-3">
                  <Badge tone="info">{r.source}</Badge>
                </td>
                <td className="px-4 py-3">{r.rating ?? "—"}</td>
                <td className="max-w-lg px-4 py-3">
                  <Link
                    href={`/reviews/${r.id}`}
                    className="block truncate text-zinc-900 hover:underline dark:text-zinc-100"
                  >
                    {r.normalized_text}
                  </Link>
                </td>
                <td className="px-4 py-3 text-xs text-zinc-500">
                  {new Date(r.ingested_at).toLocaleString()}
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
  );
}
