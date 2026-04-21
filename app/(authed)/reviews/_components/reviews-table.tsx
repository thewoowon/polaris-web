"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { listReviews } from "@/lib/api/reviews";
import { qk } from "@/lib/query-keys";
import type {
  PolicyAction,
  ReviewCategory,
  ReviewSource,
  Sentiment,
} from "@/lib/schemas/enums";

import { ReviewsFilters } from "./reviews-filters";

const PAGE_SIZE = 20;

function useDebounced<T>(value: T, ms = 250): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export function ReviewsTable() {
  const [offset, setOffset] = useState(0);
  const [source, setSource] = useState<ReviewSource | "">("");
  const [sentiment, setSentiment] = useState<Sentiment | "">("");
  const [action, setAction] = useState<PolicyAction | "">("");
  const [category, setCategory] = useState<ReviewCategory | "">("");
  const [ratingMin, setRatingMin] = useState<number | "">("");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounced(query);

  const params = {
    limit: PAGE_SIZE,
    offset,
    source: source || null,
    sentiment: sentiment || null,
    action: action || null,
    category: category || null,
    rating_min: ratingMin === "" ? null : ratingMin,
    q: debouncedQuery || null,
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: qk.reviews.list(params),
    queryFn: () => listReviews(params),
    placeholderData: keepPreviousData,
  });

  const resetPage = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setOffset(0);
  };

  const onReset = () => {
    setSource("");
    setSentiment("");
    setAction("");
    setCategory("");
    setRatingMin("");
    setQuery("");
    setOffset(0);
  };

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
    <div className="space-y-4">
      <ReviewsFilters
        source={source}
        onSource={resetPage(setSource)}
        sentiment={sentiment}
        onSentiment={resetPage(setSentiment)}
        action={action}
        onAction={resetPage(setAction)}
        category={category}
        onCategory={resetPage(setCategory)}
        ratingMin={ratingMin}
        onRatingMin={resetPage(setRatingMin)}
        query={query}
        onQuery={resetPage(setQuery)}
        onReset={onReset}
      />

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
              {data && data.items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-zinc-500">
                    조건에 맞는 리뷰가 없습니다.
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
    </div>
  );
}
