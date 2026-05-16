"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { type CompanyCreate, companiesApi } from "@/lib/api/companies";

const INDUSTRY_LABELS: Record<string, string> = {
  finance: "금융",
  fintech: "핀테크",
  commerce: "커머스",
  delivery: "배달",
  public: "공공",
  education: "교육",
  mobility: "모빌리티",
  entertainment: "엔터",
  other: "기타",
};

export function CompaniesTable() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<CompanyCreate>({
    name: "",
    industry: "finance",
    homepage_url: "",
    contact_email: "",
    memo: "",
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["companies"],
    queryFn: () => companiesApi.list({ limit: 100 }),
  });

  const createMut = useMutation({
    mutationFn: companiesApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["companies"] });
      setShowModal(false);
      setForm({ name: "", industry: "finance" });
    },
  });

  if (isLoading) return <p className="text-sm text-zinc-500">불러오는 중...</p>;
  if (isError) return <p className="text-sm text-rose-600">불러오기 실패</p>;

  const companies = data?.items ?? [];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowModal(true)}>+ 회사 등록</Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-left text-xs text-zinc-500 uppercase tracking-wide">
                <th className="px-4 py-3">회사명</th>
                <th className="px-4 py-3">산업군</th>
                <th className="px-4 py-3 text-right">등록 앱 수</th>
                <th className="px-4 py-3">메모</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {companies.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-zinc-400">
                    등록된 회사가 없습니다.
                  </td>
                </tr>
              )}
              {companies.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                >
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3">
                    <Badge tone="neutral">{INDUSTRY_LABELS[c.industry] ?? c.industry}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{c.app_count}</td>
                  <td className="px-4 py-3 text-zinc-500 max-w-xs truncate">{c.memo ?? "-"}</td>
                  <td className="px-4 py-3">
                    <Link href={`/companies/${c.id}`} className="text-blue-600 hover:underline text-xs">
                      상세
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <Card className="w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-semibold">회사 등록</h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">회사명 *</label>
                <input
                  className="w-full border border-zinc-300 dark:border-zinc-700 rounded px-3 py-2 text-sm bg-white dark:bg-zinc-900"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="예: KB국민은행"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-500 mb-1">산업군 *</label>
                <select
                  className="w-full border border-zinc-300 dark:border-zinc-700 rounded px-3 py-2 text-sm bg-white dark:bg-zinc-900"
                  value={form.industry}
                  onChange={(e) => setForm({ ...form, industry: e.target.value as CompanyCreate["industry"] })}
                >
                  {Object.entries(INDUSTRY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-zinc-500 mb-1">홈페이지 URL</label>
                <input
                  className="w-full border border-zinc-300 dark:border-zinc-700 rounded px-3 py-2 text-sm bg-white dark:bg-zinc-900"
                  value={form.homepage_url ?? ""}
                  onChange={(e) => setForm({ ...form, homepage_url: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-500 mb-1">메모</label>
                <textarea
                  className="w-full border border-zinc-300 dark:border-zinc-700 rounded px-3 py-2 text-sm bg-white dark:bg-zinc-900"
                  rows={3}
                  value={form.memo ?? ""}
                  onChange={(e) => setForm({ ...form, memo: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>취소</Button>
              <Button
                onClick={() => createMut.mutate(form)}
                disabled={!form.name || createMut.isPending}
              >
                {createMut.isPending ? "저장 중..." : "저장"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
