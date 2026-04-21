"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { DocType } from "@/lib/schemas/enums";

const DOC_TYPE_OPTIONS: { value: DocType; label: string }[] = [
  { value: "faq", label: "FAQ" },
  { value: "release_note", label: "릴리즈노트" },
  { value: "announcement", label: "공지" },
  { value: "incident_response", label: "장애 대응" },
  { value: "cs_policy", label: "CS 정책" },
  { value: "forbidden_expression", label: "금지 표현" },
];

export type KbFormValue = {
  title: string;
  doc_type: DocType;
  content: string;
  tags: string[];
  active: boolean;
};

type Props = {
  initial?: Partial<KbFormValue>;
  submitLabel: string;
  onSubmit: (v: KbFormValue) => void | Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
};

export function KbForm({ initial, submitLabel, onSubmit, onCancel, isSubmitting }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [docType, setDocType] = useState<DocType>(initial?.doc_type ?? "faq");
  const [content, setContent] = useState(initial?.content ?? "");
  const [tagsStr, setTagsStr] = useState((initial?.tags ?? []).join(", "));
  const [active, setActive] = useState(initial?.active ?? true);

  const inputCls =
    "mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900";

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const tags = tagsStr
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
        onSubmit({ title, doc_type: docType, content, tags, active });
      }}
    >
      <div>
        <label className="block text-sm font-medium">제목</label>
        <input
          className={inputCls}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={256}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">유형</label>
          <select
            className={inputCls}
            value={docType}
            onChange={(e) => setDocType(e.target.value as DocType)}
          >
            {DOC_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">태그 (쉼표 구분)</label>
          <input
            className={inputCls}
            value={tagsStr}
            onChange={(e) => setTagsStr(e.target.value)}
            placeholder="faq, 결제, 환불"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">본문</label>
        <textarea
          className={`${inputCls} min-h-64 font-mono`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </div>

      <label className="inline-flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
        />
        <span>활성 (검색 결과에 포함)</span>
      </label>

      <div className="flex gap-2">
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? "저장 중…" : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" onClick={onCancel} disabled={isSubmitting}>
            취소
          </Button>
        )}
      </div>
    </form>
  );
}
