"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { type ReportStatus, reportsApi } from "@/lib/api/reports";

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft", reviewed: "검토 완료", exported: "내보냄", sent: "발송 완료",
};

const STATUS_NEXT: Record<ReportStatus, ReportStatus | null> = {
  draft: "reviewed",
  reviewed: "exported",
  exported: "sent",
  sent: null,
};

function MarkdownPreview({ content }: { content: string }) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      {content.split("\n").map((line, i) => {
        if (line.startsWith("# "))
          return <h1 key={i} className="text-xl font-bold mt-4 mb-2">{line.slice(2)}</h1>;
        if (line.startsWith("## "))
          return <h2 key={i} className="text-base font-semibold mt-4 mb-1 border-b pb-1 border-zinc-200 dark:border-zinc-700">{line.slice(3)}</h2>;
        if (line.startsWith("### "))
          return <h3 key={i} className="text-sm font-semibold mt-3 mb-1">{line.slice(4)}</h3>;
        if (line.startsWith("| "))
          return <div key={i} className="font-mono text-xs bg-zinc-50 dark:bg-zinc-900 px-3 py-0.5 border-b border-zinc-100 dark:border-zinc-800">{line}</div>;
        if (line.startsWith("- ") || line.startsWith("* "))
          return <li key={i} className="ml-4 text-sm text-zinc-700 dark:text-zinc-300">{line.slice(2)}</li>;
        if (line.startsWith("> "))
          return <blockquote key={i} className="border-l-4 border-zinc-300 pl-4 text-sm text-zinc-600 dark:text-zinc-400 italic">{line.slice(2)}</blockquote>;
        if (line.trim() === "---")
          return <hr key={i} className="my-3 border-zinc-200 dark:border-zinc-700" />;
        if (line.trim() === "")
          return <div key={i} className="h-2" />;
        return <p key={i} className="text-sm text-zinc-700 dark:text-zinc-300">{line}</p>;
      })}
    </div>
  );
}

export function ReportDetailView({ reportId }: { reportId: string }) {
  const qc = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<"preview" | "raw">("preview");

  const { data: report, isLoading } = useQuery({
    queryKey: ["reports", reportId],
    queryFn: () => reportsApi.get(reportId),
  });

  const statusMut = useMutation({
    mutationFn: (status: ReportStatus) => reportsApi.updateStatus(reportId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reports", reportId] }),
  });

  const copyMarkdown = async () => {
    if (!report) return;
    await navigator.clipboard.writeText(report.markdown_content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) return <p className="text-sm text-zinc-500">불러오는 중...</p>;
  if (!report) return <p className="text-sm text-rose-600">리포트를 찾을 수 없습니다.</p>;

  const nextStatus = STATUS_NEXT[report.status];

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm text-zinc-500 mb-1">
            <Link href="/reports" className="hover:text-zinc-900">Reports</Link>
            <span>/</span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight leading-snug">{report.title}</h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              report.status === "draft" ? "bg-zinc-100 text-zinc-700" :
              report.status === "reviewed" ? "bg-blue-100 text-blue-700" :
              report.status === "exported" ? "bg-amber-100 text-amber-700" :
              "bg-emerald-100 text-emerald-700"
            }`}>{STATUS_LABELS[report.status]}</span>
            {report.company_name && <Badge tone="neutral">{report.company_name}</Badge>}
            {report.app_name && <Badge tone="neutral">{report.app_name}</Badge>}
            <span className="text-xs text-zinc-400">{report.period_start} ~ {report.period_end}</span>
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          <Button variant="secondary" onClick={copyMarkdown}>
            {copied ? "복사됨!" : "Markdown 복사"}
          </Button>
          {nextStatus && (
            <Button
              onClick={() => statusMut.mutate(nextStatus)}
              disabled={statusMut.isPending}
            >
              {STATUS_LABELS[nextStatus]}으로 변경
            </Button>
          )}
        </div>
      </header>

      {/* Executive Summary */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <h2 className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase mb-2">Executive Summary</h2>
        <p className="text-sm text-zinc-700 dark:text-zinc-300">{report.executive_summary}</p>
      </Card>

      {/* Preview/Raw Tabs */}
      <div className="flex gap-1 border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setTab("preview")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === "preview"
              ? "border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100"
              : "border-transparent text-zinc-500 hover:text-zinc-700"
          }`}
        >
          Preview
        </button>
        <button
          onClick={() => setTab("raw")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === "raw"
              ? "border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100"
              : "border-transparent text-zinc-500 hover:text-zinc-700"
          }`}
        >
          Raw Markdown
        </button>
      </div>

      <Card className="p-6">
        {tab === "preview" ? (
          <MarkdownPreview content={report.markdown_content} />
        ) : (
          <pre className="text-xs font-mono whitespace-pre-wrap text-zinc-700 dark:text-zinc-300 overflow-auto max-h-[70vh]">
            {report.markdown_content}
          </pre>
        )}
      </Card>

      {/* Copy CTA */}
      <Card className="p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">이 리포트를 기업에 바로 보낼 수 있습니다</p>
          <p className="text-xs text-zinc-500 mt-0.5">Markdown을 복사해서 이메일 본문 또는 문서 도구에 붙여넣기하세요.</p>
        </div>
        <Button onClick={copyMarkdown}>
          {copied ? "복사됨!" : "Markdown 복사"}
        </Button>
      </Card>
    </div>
  );
}
