"use client";

import type {
  PolicyAction,
  ReviewCategory,
  ReviewSource,
  Sentiment,
} from "@/lib/schemas/enums";

const SOURCES: Array<{ value: ReviewSource | ""; label: string }> = [
  { value: "", label: "소스: 전체" },
  { value: "google_play", label: "Google Play" },
  { value: "app_store", label: "App Store" },
  { value: "internal", label: "내부" },
];

const SENTIMENTS: Array<{ value: Sentiment | ""; label: string }> = [
  { value: "", label: "감성: 전체" },
  { value: "positive", label: "긍정" },
  { value: "neutral", label: "중립" },
  { value: "negative", label: "부정" },
];

const ACTIONS: Array<{ value: PolicyAction | ""; label: string }> = [
  { value: "", label: "액션: 전체" },
  { value: "auto_reply", label: "auto_reply" },
  { value: "draft_reply", label: "draft_reply" },
  { value: "request_clarification", label: "request_clarification" },
  { value: "route_to_human", label: "route_to_human" },
  { value: "create_issue", label: "create_issue" },
  { value: "ignore", label: "ignore" },
];

const CATEGORIES: Array<{ value: ReviewCategory | ""; label: string }> = [
  { value: "", label: "카테고리: 전체" },
  { value: "bug", label: "bug" },
  { value: "payment", label: "payment" },
  { value: "refund", label: "refund" },
  { value: "performance", label: "performance" },
  { value: "login_account", label: "login_account" },
  { value: "ux_ui", label: "ux_ui" },
  { value: "feature_request", label: "feature_request" },
  { value: "policy_inquiry", label: "policy_inquiry" },
  { value: "complaint", label: "complaint" },
  { value: "praise", label: "praise" },
  { value: "spam", label: "spam" },
  { value: "other", label: "other" },
];

const RATING_MINS: Array<{ value: number | ""; label: string }> = [
  { value: "", label: "평점: 전체" },
  { value: 4, label: "★ 4+" },
  { value: 3, label: "★ 3+" },
  { value: 2, label: "★ 2+" },
  { value: 1, label: "★ 1+" },
];

type Props = {
  source: ReviewSource | "";
  onSource: (v: ReviewSource | "") => void;
  sentiment: Sentiment | "";
  onSentiment: (v: Sentiment | "") => void;
  action: PolicyAction | "";
  onAction: (v: PolicyAction | "") => void;
  category: ReviewCategory | "";
  onCategory: (v: ReviewCategory | "") => void;
  ratingMin: number | "";
  onRatingMin: (v: number | "") => void;
  query: string;
  onQuery: (v: string) => void;
  onReset: () => void;
};

const selectCls =
  "h-9 rounded-md border border-zinc-300 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900";

export function ReviewsFilters(props: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        className={selectCls}
        value={props.source}
        onChange={(e) => props.onSource(e.target.value as ReviewSource | "")}
      >
        {SOURCES.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <select
        className={selectCls}
        value={props.sentiment}
        onChange={(e) => props.onSentiment(e.target.value as Sentiment | "")}
      >
        {SENTIMENTS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <select
        className={selectCls}
        value={props.action}
        onChange={(e) => props.onAction(e.target.value as PolicyAction | "")}
      >
        {ACTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <select
        className={selectCls}
        value={props.category}
        onChange={(e) => props.onCategory(e.target.value as ReviewCategory | "")}
      >
        {CATEGORIES.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <select
        className={selectCls}
        value={props.ratingMin === "" ? "" : String(props.ratingMin)}
        onChange={(e) =>
          props.onRatingMin(e.target.value === "" ? "" : Number(e.target.value))
        }
      >
        {RATING_MINS.map((o) => (
          <option key={String(o.value)} value={o.value === "" ? "" : String(o.value)}>
            {o.label}
          </option>
        ))}
      </select>

      <input
        type="search"
        placeholder="본문 검색"
        value={props.query}
        onChange={(e) => props.onQuery(e.target.value)}
        className="h-9 flex-1 min-w-[160px] rounded-md border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      />

      <button
        type="button"
        onClick={props.onReset}
        className="h-9 rounded-md px-3 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
      >
        초기화
      </button>
    </div>
  );
}
