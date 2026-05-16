```md
# Blueprint Phase 2 — Polaris AI 피벗
## 한국 기업용 앱 리뷰 인텔리전스 + 개선안 리포트 + 대응 운영 시스템

---

## 0. 프로젝트 전환 선언

기존 시스템은 다음 목적이었다.

> 앱 리뷰/VOC를 자동 수집하고, 분류하고, 정책적으로 안전한 범위에서 응답 초안을 생성하는 시스템

Phase 2에서는 제품 목적을 다음으로 확장한다.

> 여러 한국 주요 앱의 공개 앱 리뷰를 수집·분석하여  
> 기업별 UX/VOC 리스크, 경쟁사 대비 약점, 개선 우선순위, 대응 문안, 월간 리포트를 자동 생성하는  
> **앱 리뷰 인텔리전스 에이전트**로 전환한다.

즉, Polaris AI는 더 이상 단순 리뷰 응답 자동화 도구가 아니다.

**기업용 앱 평판·VOC·UX 리스크 분석 시스템**이다.

---

## 1. 핵심 피벗 방향

### 기존 Polaris AI

```text
우리 앱 리뷰 관리
→ 리뷰 분류
→ 위험도 판단
→ 응답 초안 생성
→ 검수 큐
```

### Phase 2 Polaris AI

```text
여러 앱 리뷰 수집
→ 앱별/회사별 리뷰 저장
→ 카테고리·감성·긴급도·UX 리스크 분류
→ 경쟁사 비교
→ 반복 이슈 클러스터링
→ 개선 우선순위 산출
→ 기업별 리포트 자동 생성
→ 대응 문안/운영 가이드 생성
```

---

## 2. 제품 한 줄 정의

> Polaris AI는 한국 기업 앱의 공개 리뷰를 기반으로
> 사용자 불만, UX 결함, 운영 리스크, 경쟁사 대비 약점을 자동 분석하고
> 기업별 실행 가능한 개선 리포트를 생성하는 B2B 앱 리뷰 인텔리전스 시스템이다.

---

## 3. 이번 Phase 2의 목표

### 3.1 제품 목표

* 여러 앱을 등록하고 관리할 수 있게 한다.
* 앱스토어/플레이스토어 리뷰를 앱별로 수집한다.
* 리뷰를 금융/커머스/공공/일반 앱 맥락에 맞게 분류한다.
* 앱별 VOC 트렌드를 보여준다.
* 경쟁사 앱과 비교한다.
* 반복 불만을 클러스터링한다.
* UX/운영/개발/정책 이슈로 나눈다.
* 기업별 PDF/Markdown 리포트를 생성한다.
* 개선 우선순위와 대응 문안까지 자동 생성한다.

### 3.2 비목표

* 초기에 완전한 SaaS 과금 시스템 구축 금지
* 초기에 복잡한 멀티테넌트 엔터프라이즈 권한 설계 금지
* 초기에 자동 이메일 발송까지 과도하게 붙이지 않음
* 초기에 모든 앱스토어 공식 API 연동을 완성하려 하지 않음
* 초기에 완전 자동 고객 응답 게시 기능을 확장하지 않음

---

## 4. 핵심 제품 구조

```text
[App Registry]
      |
      v
[Review Ingestion]
      |
      v
[Normalization]
      |
      v
[Classification Pipeline]
      |
      v
[Risk & Issue Analysis]
      |
      v
[Competitive Benchmark]
      |
      v
[Insight Generator]
      |
      v
[Company Report Generator]
      |
      v
[Outbound-ready Report]
```

---

## 5. 핵심 사용자 시나리오

### Scenario 1 — 금융앱 비교 리포트 생성

운영자가 다음 앱을 등록한다.

* KB스타뱅킹
* 신한 SOL
* 토스
* 카카오뱅크
* 우리WON
* 하나원큐
* NH올원뱅크

시스템은 각 앱의 최근 리뷰를 수집하고 분석한다.

결과:

* 앱별 부정 리뷰 비율
* 로그인/인증 불만 비중
* 속도/튕김 이슈 비중
* 혜택/포인트 관련 불만
* 경쟁사 대비 가장 취약한 영역
* 개선 우선순위
* 기업별 리포트

---

### Scenario 2 — 특정 회사 대상 샘플 리포트 생성

운영자가 `KB국민은행`을 선택한다.

시스템은 다음을 생성한다.

```text
2026 KB스타뱅킹 앱 리뷰 인텔리전스 리포트

1. Executive Summary
2. 최근 리뷰 동향
3. 주요 VOC Top 10
4. 반복 불만 클러스터
5. 경쟁사 대비 취약점
6. UX/운영/개발/정책별 개선안
7. 대응 문안 예시
8. 30일 개선 로드맵
```

---

### Scenario 3 — 기업 영업용 리포트 생성

운영자가 특정 회사 리포트를 Export한다.

출력 형식:

* Markdown
* HTML Preview
* PDF-ready layout
* Email summary text

---

## 6. 새 도메인 모델

기존 `Review`, `ClassificationResult`, `PolicyDecision`, `ReplyDraft`는 유지한다.

Phase 2에서는 다음 모델을 추가한다.

---

## 6.1 Company

```ts
type Company = {
  id: string
  name: string
  industry:
    | 'finance'
    | 'fintech'
    | 'commerce'
    | 'delivery'
    | 'public'
    | 'education'
    | 'mobility'
    | 'entertainment'
    | 'other'
  homepage_url?: string
  contact_email?: string
  memo?: string
  created_at: string
  updated_at: string
}
```

---

## 6.2 AppProfile

```ts
type AppProfile = {
  id: string
  company_id: string
  app_name: string
  platform: 'ios' | 'android' | 'both'
  app_store_id?: string
  play_store_package?: string
  category?: string
  country: 'kr'
  is_target: boolean
  is_competitor: boolean
  created_at: string
  updated_at: string
}
```

---

## 6.3 ReviewCluster

```ts
type ReviewCluster = {
  id: string
  app_id: string
  title: string
  summary: string
  issue_type:
    | 'ux'
    | 'bug'
    | 'performance'
    | 'policy'
    | 'operation'
    | 'customer_support'
    | 'pricing'
    | 'security'
    | 'authentication'
    | 'unknown'
  review_count: number
  negative_ratio: number
  average_rating: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  representative_review_ids: string[]
  created_at: string
}
```

---

## 6.4 AppBenchmark

```ts
type AppBenchmark = {
  id: string
  target_app_id: string
  competitor_app_ids: string[]
  period_start: string
  period_end: string
  metrics: {
    review_count: number
    average_rating: number
    negative_ratio: number
    critical_issue_count: number
    top_negative_categories: string[]
    response_rate?: number
  }
  comparison_summary: string
  created_at: string
}
```

---

## 6.5 Insight

```ts
type Insight = {
  id: string
  app_id: string
  company_id: string
  insight_type:
    | 'risk'
    | 'opportunity'
    | 'competitive_gap'
    | 'ux_problem'
    | 'technical_issue'
    | 'operation_issue'
    | 'customer_support_issue'
  title: string
  summary: string
  evidence_review_ids: string[]
  severity: 'low' | 'medium' | 'high' | 'critical'
  business_impact:
    | 'retention'
    | 'conversion'
    | 'trust'
    | 'brand'
    | 'cost'
    | 'compliance'
    | 'unknown'
  recommended_action: string
  created_at: string
}
```

---

## 6.6 Report

```ts
type Report = {
  id: string
  company_id: string
  app_id?: string
  report_type:
    | 'company_app_review'
    | 'competitive_benchmark'
    | 'monthly_voc'
    | 'sales_outbound'
  title: string
  period_start: string
  period_end: string
  markdown_content: string
  executive_summary: string
  status: 'draft' | 'reviewed' | 'exported' | 'sent'
  created_at: string
  updated_at: string
}
```

---

## 7. 금융앱 특화 분류 체계

기존 카테고리에 금융앱 전용 카테고리를 추가한다.

```ts
type FinanceReviewCategory =
  | 'login_authentication'
  | 'certificate'
  | 'transfer_remittance'
  | 'account_inquiry'
  | 'card'
  | 'loan'
  | 'deposit_savings'
  | 'fund_investment'
  | 'subscription_cheongyak'
  | 'benefit_point'
  | 'notification'
  | 'app_crash'
  | 'app_speed'
  | 'ui_complexity'
  | 'senior_accessibility'
  | 'customer_center'
  | 'security_concern'
  | 'update_regression'
  | 'policy_complaint'
  | 'other'
```

---

## 8. 이슈 타입 분류

리뷰를 단순 카테고리로만 보지 말고, 기업 의사결정 단위로 재분류한다.

```ts
type IssueOwner =
  | 'product'
  | 'ux'
  | 'frontend'
  | 'backend'
  | 'infra'
  | 'cs'
  | 'marketing'
  | 'policy'
  | 'legal'
  | 'unknown'
```

예시:

```text
"로그인이 계속 안 돼요"
→ category: login_authentication
→ issue_type: technical_issue
→ owner: frontend/backend
→ severity: high

"혜택이 어디 있는지 모르겠어요"
→ category: benefit_point
→ issue_type: ux_problem
→ owner: product/ux
→ severity: medium

"업데이트하고 앱이 튕겨요"
→ category: update_regression
→ issue_type: technical_issue
→ owner: frontend/mobile/infra
→ severity: critical
```

---

## 9. DB 스키마 추가

기존 테이블은 유지한다.

추가 테이블:

---

### companies

```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT NOT NULL,
  homepage_url TEXT,
  contact_email TEXT,
  memo TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
```

---

### app_profiles

```sql
CREATE TABLE app_profiles (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  app_name TEXT NOT NULL,
  platform TEXT NOT NULL,
  app_store_id TEXT,
  play_store_package TEXT,
  category TEXT,
  country TEXT NOT NULL DEFAULT 'kr',
  is_target BOOLEAN NOT NULL DEFAULT false,
  is_competitor BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
```

---

### review_clusters

```sql
CREATE TABLE review_clusters (
  id UUID PRIMARY KEY,
  app_id UUID REFERENCES app_profiles(id),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  issue_type TEXT NOT NULL,
  review_count INTEGER NOT NULL,
  negative_ratio FLOAT NOT NULL,
  average_rating FLOAT,
  severity TEXT NOT NULL,
  representative_review_ids JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);
```

---

### app_benchmarks

```sql
CREATE TABLE app_benchmarks (
  id UUID PRIMARY KEY,
  target_app_id UUID REFERENCES app_profiles(id),
  competitor_app_ids JSONB NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  metrics JSONB NOT NULL,
  comparison_summary TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);
```

---

### insights

```sql
CREATE TABLE insights (
  id UUID PRIMARY KEY,
  app_id UUID REFERENCES app_profiles(id),
  company_id UUID REFERENCES companies(id),
  insight_type TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  evidence_review_ids JSONB NOT NULL,
  severity TEXT NOT NULL,
  business_impact TEXT NOT NULL,
  recommended_action TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);
```

---

### reports

```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  app_id UUID REFERENCES app_profiles(id),
  report_type TEXT NOT NULL,
  title TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  markdown_content TEXT NOT NULL,
  executive_summary TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
```

---

## 10. API 변경

기존 API는 유지한다.

추가 API를 구현한다.

---

## 10.1 Companies

```text
GET    /api/v1/companies
POST   /api/v1/companies
GET    /api/v1/companies/{company_id}
PATCH  /api/v1/companies/{company_id}
DELETE /api/v1/companies/{company_id}
```

---

## 10.2 App Profiles

```text
GET    /api/v1/apps
POST   /api/v1/apps
GET    /api/v1/apps/{app_id}
PATCH  /api/v1/apps/{app_id}
DELETE /api/v1/apps/{app_id}
```

---

## 10.3 Ingestion

```text
POST /api/v1/apps/{app_id}/ingest
POST /api/v1/apps/{app_id}/ingest/mock
POST /api/v1/apps/{app_id}/ingest/bulk
```

초기에는 mock/manual ingestion을 우선 구현한다.

실제 스토어 크롤링/공식 API 연동은 interface만 열어둔다.

---

## 10.4 Analysis

```text
POST /api/v1/apps/{app_id}/analyze
POST /api/v1/apps/{app_id}/cluster
POST /api/v1/apps/{app_id}/insights
GET  /api/v1/apps/{app_id}/summary
GET  /api/v1/apps/{app_id}/trends
```

---

## 10.5 Benchmark

```text
POST /api/v1/benchmarks
GET  /api/v1/benchmarks/{benchmark_id}
GET  /api/v1/apps/{app_id}/benchmarks
```

---

## 10.6 Reports

```text
POST /api/v1/reports/generate
GET  /api/v1/reports
GET  /api/v1/reports/{report_id}
PATCH /api/v1/reports/{report_id}
POST /api/v1/reports/{report_id}/export-markdown
POST /api/v1/reports/{report_id}/export-pdf-ready-html
```

---

## 11. 프론트엔드 화면 변경

기존 화면:

```text
/dashboard
/reviews
/reviews/[id]
/queue
/replies
/kb
/settings
```

Phase 2 화면:

```text
/dashboard
/companies
/companies/[id]
/apps
/apps/[id]
/apps/[id]/reviews
/apps/[id]/clusters
/apps/[id]/insights
/benchmarks
/reports
/reports/[id]
/outbound
/settings
```

---

## 11.1 Dashboard

전체 앱 리뷰 인텔리전스 현황을 보여준다.

표시 항목:

* 등록 회사 수
* 등록 앱 수
* 수집 리뷰 수
* 분석 완료 리뷰 수
* 부정 리뷰 비율
* critical issue 수
* 최근 7일 부정 리뷰 증가 앱
* 가장 많은 VOC 카테고리
* 리포트 생성 수

---

## 11.2 Companies Page

회사 목록.

컬럼:

* 회사명
* 산업군
* 등록 앱 수
* 최근 리포트 생성일
* 주요 리스크
* 메모

액션:

* 회사 등록
* 회사 상세 보기
* 리포트 생성

---

## 11.3 Company Detail Page

표시:

* 회사 정보
* 보유 앱 목록
* 최근 리뷰 요약
* 생성된 리포트 목록
* 주요 인사이트
* 영업용 메모

---

## 11.4 Apps Page

앱 목록.

컬럼:

* 앱명
* 회사
* 플랫폼
* 최근 리뷰 수
* 평균 평점
* 부정 리뷰 비율
* critical issue 수
* 마지막 수집일

---

## 11.5 App Detail Page

앱 단위 분석 화면.

섹션:

* KPI Summary
* 리뷰 추이
* 평점 추이
* 카테고리 분포
* 부정 리뷰 Top Category
* Review Clusters
* Generated Insights
* Report Generate Button

---

## 11.6 Review Clusters Page

반복 이슈 클러스터 화면.

컬럼:

* 클러스터 제목
* 이슈 타입
* 리뷰 수
* 부정 비율
* 심각도
* 대표 리뷰
* 추천 조치

---

## 11.7 Benchmark Page

경쟁사 비교 화면.

기능:

* Target App 선택
* Competitor Apps 선택
* 기간 선택
* 비교 실행
* 결과 저장

출력:

* 평균 평점 비교
* 부정 리뷰 비율 비교
* 카테고리별 불만 비중
* critical issue 비교
* 경쟁사 대비 취약 영역
* 요약 문장

---

## 11.8 Reports Page

리포트 목록.

컬럼:

* 제목
* 회사
* 앱
* 리포트 타입
* 기간
* 상태
* 생성일

액션:

* 보기
* 수정
* Markdown 복사
* PDF-ready HTML export
* 상태 변경

---

## 11.9 Report Detail Page

리포트 상세.

기능:

* Markdown editor
* Preview
* Executive Summary
* Evidence Reviews
* Suggested Email Copy
* Export Button

---

## 12. 리포트 생성 구조

리포트는 반드시 아래 구조로 생성한다.

```md
# {회사명} 앱 리뷰 인텔리전스 리포트

## 1. Executive Summary

- 핵심 문제 3개
- 가장 심각한 VOC 영역
- 경쟁사 대비 약점
- 즉시 개선 가능한 항목
- 30일 내 추천 액션

## 2. 분석 개요

- 분석 대상 앱
- 분석 기간
- 수집 리뷰 수
- 평균 평점
- 부정 리뷰 비율
- 주요 비교 앱

## 3. 주요 VOC Top 10

| 순위 | 이슈 | 비중 | 심각도 | 대표 리뷰 |
|---|---|---:|---|---|

## 4. 반복 불만 클러스터

각 클러스터별:

- 제목
- 요약
- 대표 리뷰
- 원인 추정
- 담당 조직 추정
- 개선 방향

## 5. 경쟁사 대비 분석

- 경쟁사 대비 강점
- 경쟁사 대비 약점
- 특정 카테고리별 차이
- 사용자가 반복적으로 언급한 비교 포인트

## 6. UX/운영/개발/정책별 개선안

### UX
### 개발
### 운영
### CS
### 정책

## 7. 대응 문안 개선안

- 현재 리뷰 대응상의 문제
- 추천 응답 톤
- 카테고리별 응답 템플릿

## 8. 30일 개선 로드맵

| 우선순위 | 액션 | 담당 | 기대효과 | 난이도 |
|---|---|---|---|---|

## 9. 결론

- 가장 먼저 해결해야 할 문제
- 장기적으로 관리해야 할 문제
- Polaris AI 제안
```

---

## 13. 리포트 생성 프롬프트 원칙

LLM은 자유롭게 환각하지 않는다.

반드시 입력 데이터 기반으로 작성한다.

입력:

* 회사 정보
* 앱 정보
* 리뷰 통계
* 카테고리 분포
* 클러스터 목록
* 대표 리뷰
* 경쟁사 비교 결과
* 생성된 인사이트

출력:

* Markdown report
* Executive summary
* Suggested email copy

금지:

* 근거 없는 수치 생성
* 실제로 확인하지 않은 장애 원인 단정
* 법적 표현 단정
* “반드시”, “확실히” 등 과도한 확정 표현
* 사용자가 말하지 않은 기능 문제를 지어내기

---

## 14. Insight Generator 규칙

Insight는 단순 요약이 아니라 의사결정 단위여야 한다.

나쁜 예:

```text
로그인 관련 불만이 많습니다.
```

좋은 예:

```text
최근 부정 리뷰 중 로그인/인증 관련 불만이 반복적으로 나타난다. 
특히 업데이트 이후 인증 실패, 앱 재실행, 공동인증서 이동 실패 유형이 함께 나타나므로 
단순 CS 응대가 아니라 인증 플로우 안정성 점검과 오류 메시지 개선이 필요하다.
```

---

## 15. 우선순위 계산

리뷰 개선 우선순위는 아래 기준으로 계산한다.

```text
priority_score =
  review_count_weight
+ negative_ratio_weight
+ severity_weight
+ recent_growth_weight
+ business_impact_weight
- implementation_difficulty_weight
```

추천 기준:

```text
review_count_weight: 0~25
negative_ratio_weight: 0~20
severity_weight: 0~25
recent_growth_weight: 0~15
business_impact_weight: 0~15
implementation_difficulty_weight: 0~20
```

출력:

```ts
type PriorityItem = {
  title: string
  reason: string
  priority_score: number
  owner: IssueOwner
  expected_impact: string
  difficulty: 'low' | 'medium' | 'high'
}
```

---

## 16. 초기 Seed 데이터

초기 개발용으로 금융앱 더미 데이터를 만든다.

회사:

```text
KB국민은행
신한은행
카카오뱅크
토스
우리은행
하나은행
NH농협은행
```

앱:

```text
KB스타뱅킹
신한 SOL
카카오뱅크
토스
우리WON뱅킹
하나원큐
NH올원뱅크
```

리뷰 더미 유형:

```text
로그인이 안 됩니다
업데이트 후 앱이 튕깁니다
이체 화면이 너무 복잡합니다
혜택 찾기가 어렵습니다
알림이 너무 많이 옵니다
카드 신청 중 오류가 납니다
공동인증서 가져오기가 실패합니다
속도가 너무 느립니다
고객센터 연결이 어렵습니다
토스보다 불편합니다
카카오뱅크보다 메뉴가 복잡합니다
```

각 앱당 최소 100개 mock review 생성.

---

## 17. Backend 작업 지시

Claude Code는 아래 순서로 구현한다.

---

### Step 1 — DB 모델 추가

추가 모델:

* Company
* AppProfile
* ReviewCluster
* AppBenchmark
* Insight
* Report

작업:

* SQLAlchemy model 생성
* Pydantic schema 생성
* Alembic migration 생성
* 관계 설정

---

### Step 2 — Company/App CRUD API

구현:

* companies router
* apps router
* service layer
* repository layer
* 기본 테스트

---

### Step 3 — Mock Ingestion

구현:

```text
POST /api/v1/apps/{app_id}/ingest/mock
```

동작:

* app_id 기준 mock review 생성
* 기존 reviews 테이블에 저장
* app_id 연결 필드 필요 시 reviews 테이블에 app_id 추가

기존 reviews 테이블 수정:

```sql
ALTER TABLE reviews ADD COLUMN app_id UUID REFERENCES app_profiles(id);
```

---

### Step 4 — Analysis Service

구현:

* app_id 기준 리뷰 조회
* 카테고리 분포 계산
* 감성 분포 계산
* 평점 평균 계산
* 부정 리뷰 비율 계산
* 최근 기간별 추이 계산

Endpoint:

```text
GET /api/v1/apps/{app_id}/summary
GET /api/v1/apps/{app_id}/trends
```

---

### Step 5 — Cluster Service

초기에는 복잡한 embedding clustering 금지.

MVP는 rule-based grouping으로 시작한다.

기준:

* category
* issue_type
* normalized keyword
* rating
* sentiment

Endpoint:

```text
POST /api/v1/apps/{app_id}/cluster
GET  /api/v1/apps/{app_id}/clusters
```

---

### Step 6 — Insight Service

ReviewCluster를 기반으로 Insight 생성.

MVP는 rule + LLM structured generation.

입력:

* cluster summary
* representative reviews
* category
* severity
* review count

출력:

* insight_type
* title
* summary
* business_impact
* recommended_action
* severity

Endpoint:

```text
POST /api/v1/apps/{app_id}/insights
GET  /api/v1/apps/{app_id}/insights
```

---

### Step 7 — Benchmark Service

Target app과 competitor apps를 비교한다.

Endpoint:

```text
POST /api/v1/benchmarks
```

Request:

```json
{
  "target_app_id": "uuid",
  "competitor_app_ids": ["uuid", "uuid"],
  "period_start": "2026-01-01",
  "period_end": "2026-05-31"
}
```

Output:

```json
{
  "target": {},
  "competitors": [],
  "comparison_summary": "",
  "weaknesses": [],
  "strengths": []
}
```

---

### Step 8 — Report Generator

Report Generator는 Phase 2의 핵심이다.

Endpoint:

```text
POST /api/v1/reports/generate
```

Request:

```json
{
  "company_id": "uuid",
  "app_id": "uuid",
  "report_type": "company_app_review",
  "period_start": "2026-01-01",
  "period_end": "2026-05-31",
  "include_benchmark": true,
  "competitor_app_ids": ["uuid", "uuid"]
}
```

동작:

1. 회사 정보 조회
2. 앱 정보 조회
3. 리뷰 summary 조회
4. clusters 조회
5. insights 조회
6. benchmark 있으면 조회/생성
7. markdown report 생성
8. reports 테이블 저장

---

## 18. Frontend 작업 지시

---

### Step 1 — Navigation 변경

Sidebar 메뉴:

```text
Dashboard
Companies
Apps
Benchmarks
Reports
Reviews
Settings
```

---

### Step 2 — Companies 화면

구현:

* 회사 리스트
* 회사 생성 모달
* 회사 상세 이동
* 회사별 리포트 생성 버튼

---

### Step 3 — Apps 화면

구현:

* 앱 리스트
* 앱 생성 모달
* 회사 연결
* 플랫폼 선택
* 앱 상세 이동
* mock ingestion 버튼

---

### Step 4 — App Detail 화면

구현 섹션:

* KPI Cards
* Category Distribution
* Sentiment Distribution
* Review Trend
* Cluster List
* Insight List
* Generate Report Button

---

### Step 5 — Benchmark 화면

구현:

* Target App select
* Competitor multi-select
* Period selector
* Run Benchmark
* Result table
* Save benchmark

---

### Step 6 — Reports 화면

구현:

* 리포트 리스트
* 리포트 상세
* Markdown preview
* Copy markdown
* Export HTML
* Status 변경

---

## 19. MVP 완료 기준

Phase 2 MVP는 아래가 되면 완료다.

* 회사 등록 가능
* 앱 등록 가능
* 앱별 mock review 생성 가능
* 앱별 리뷰 summary 가능
* 앱별 cluster 생성 가능
* 앱별 insight 생성 가능
* 경쟁 앱 비교 가능
* 회사/앱 기준 markdown report 생성 가능
* report 상세에서 preview 가능
* markdown copy 가능

---

## 20. 이번 Phase에서 하지 말 것

금지:

* 결제 시스템
* 사용자 초대/조직 관리 고도화
* 복잡한 권한 체계
* 완전 자동 이메일 발송
* 실제 앱스토어 크롤러 과도 구현
* 복잡한 벡터 DB 도입
* 멀티 에이전트 구조
* LangChain/LangGraph 필수화
* 모든 것을 LLM으로 처리

---

## 21. 개발 철학

* 기존 구조를 최대한 유지한다.
* 리뷰 응답 자동화 기능은 버리지 않는다.
* 상위 계층에 company/app/report/benchmark/insight를 추가한다.
* MVP는 mock ingestion 기반으로 먼저 완성한다.
* 실제 수집기는 interface 뒤에 둔다.
* 리포트 품질이 제품의 핵심이다.
* 데이터가 부족하면 더미라도 전체 흐름을 먼저 완성한다.
* 사용자가 바로 PDF/Markdown으로 기업에 보낼 수 있어야 한다.

---

## 22. 최종 제품 포지셔닝

Polaris AI는 다음 문장으로 설명되어야 한다.

> Polaris AI는 앱스토어 리뷰를 단순 수집하는 도구가 아니라,
> 한국 기업 앱의 사용자 불만을 제품·UX·운영·개발 관점으로 재해석하고
> 경쟁사 대비 개선 우선순위와 실행 가능한 리포트를 생성하는
> B2B 앱 리뷰 인텔리전스 시스템이다.

---

## 23. Claude Code 실행 순서 요약

반드시 아래 순서로 진행한다.

```text
1. DB 모델 추가
2. Alembic migration
3. Company/App CRUD
4. reviews 테이블 app_id 연결
5. mock ingestion
6. app summary API
7. cluster service
8. insight service
9. benchmark service
10. report generator
11. frontend navigation 변경
12. companies page
13. apps page
14. app detail page
15. benchmark page
16. reports page
17. markdown preview/export
18. seed data 생성
19. end-to-end 테스트
```

---

## 24. 첫 번째 목표 산출물

최초 산출물은 다음 리포트가 되어야 한다.

```text
2026 금융앱 리뷰 인텔리전스 리포트
공개 앱스토어 리뷰 기반 UX/VOC 리스크 분석
```

대상 앱:

```text
KB스타뱅킹
신한 SOL
토스
카카오뱅크
우리WON뱅킹
하나원큐
NH올원뱅크
```

목표:

* 포트폴리오
* 기업 영업자료
* 내부 제안자료
* 채용/면접용 강력한 증거물
* Polaris AI 제품 검증 자료

---

## 25. 최종 판단

이번 피벗은 올바르다.

기존 Polaris AI가 단순히 “리뷰 응답 자동화”에 머물면 평범하다.

하지만 Phase 2를 통해 다음으로 바뀐다.

```text
리뷰 응답 도구
→ VOC 분석 도구
→ 경쟁사 벤치마크 도구
→ 기업 개선안 리포트 생성기
→ 앱 운영 인텔리전스 플랫폼
```

따라서 이번 작업의 핵심은 기능 추가가 아니라 제품 의미의 상승이다.

Phase 2의 성공 기준은 명확하다.

> 사용자가 특정 앱을 선택하고 버튼을 눌렀을 때,
> 기업에 바로 보낼 수 있는 수준의 앱 리뷰 인텔리전스 리포트가 생성되어야 한다.