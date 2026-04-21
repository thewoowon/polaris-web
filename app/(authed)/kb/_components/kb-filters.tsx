"use client";

import type { DocType } from "@/lib/schemas/enums";

type Option = { value: DocType | ""; label: string };

const OPTIONS: Option[] = [
  { value: "", label: "전체" },
  { value: "faq", label: "FAQ" },
  { value: "release_note", label: "릴리즈노트" },
  { value: "announcement", label: "공지" },
  { value: "incident_response", label: "장애 대응" },
  { value: "cs_policy", label: "CS 정책" },
  { value: "forbidden_expression", label: "금지 표현" },
];

type Props = {
  docType: DocType | "";
  onDocTypeChange: (v: DocType | "") => void;
  query: string;
  onQueryChange: (v: string) => void;
};

export function KbFilters({ docType, onDocTypeChange, query, onQueryChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={docType}
        onChange={(e) => onDocTypeChange(e.target.value as DocType | "")}
        className="h-9 rounded-md border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <input
        type="search"
        placeholder="제목 · 내용 검색"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        className="h-9 flex-1 min-w-[180px] rounded-md border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      />
    </div>
  );
}
