```md
# Blueprint — AI 기반 VOC(앱리뷰) 자동 분류 및 응답 자동 생성 시스템
**Stack**: Next.js + FastAPI  
**Architecture stance**: 웹 기반, 비-모노레포, 과도한 에이전트화 지양, 운영 리스크 우선  
**Core principle**: “완전 자동응답”이 아니라 **분류 → 정책판단 → 제한적 생성**의 안전한 파이프라인

---

## 1. 문제정의

앱스토어 리뷰/VOC는 단순 텍스트가 아니다.  
실제로는 다음이 섞여 있다.

- 버그 제보
- 결제/환불 불만
- 성능 저하
- UX 불편
- 계정/로그인 이슈
- 단순 감정 표출
- 기능 요청
- 운영정책 문의

따라서 이 시스템은 단순 챗봇이나 단순 RAG가 아니라 아래 3단계의 **의사결정 시스템**으로 본다.

1. **무슨 이슈인지 분류**
2. **자동응답 가능한지 판단**
3. **가능한 경우에만 안전하게 응답 생성**

---

## 2. 목표

### 2.1 제품 목표
- 리뷰를 자동 수집/정규화한다.
- 리뷰를 **카테고리 / 감성 / 긴급도 / 자동응답 가능 여부**로 분류한다.
- 정책적으로 안전한 범위에서 응답 초안을 자동 생성한다.
- 위험도가 높거나 애매한 건은 사람 검수로 보낸다.
- 추후 FAQ/릴리즈노트/운영정책 기반의 **얕은 RAG**를 붙일 수 있게 한다.

### 2.2 비목표
- 초기에 완전 자율 에이전트 구축
- 초기에 멀티턴 대화형 CS 시스템 구축
- 초기에 복잡한 벡터 DB 별도 도입
- 초기에 RLHF/파인튜닝 필수화

---

## 3. 한 줄 결론

초기 최적 구조는 아래다.

> **Classifier-first + Policy Engine + Template/Structured Generation + Optional Lite RAG**

즉,  
**RAG는 보조수단**이고,  
**핵심은 분류 정확도와 정책 엔진**이다.

---

## 4. 기술 선택

## 4.1 Frontend — Next.js
선택 이유:
- App Router 기반 구조가 안정적이며, 라우트 핸들러/서버 컴포넌트 중심으로 관리 UI 구성에 적합하다. :contentReference[oaicite:0]{index=0}
- 자체 호스팅 가이드가 명확하여 사내/폐쇄망/온프레미스 배포 대응이 좋다. :contentReference[oaicite:1]{index=1}

권장:
- **Next.js App Router**
- UI 전용 BFF는 두지 않는다.
- 프론트는 백엔드 FastAPI를 직접 호출한다.
- 단, 인증 세션 처리나 일부 프록시가 필요하면 Next Route Handler를 얇게 쓴다. :contentReference[oaicite:2]{index=2}

## 4.2 Backend — FastAPI
선택 이유:
- 타입힌트 기반 API 설계, 검증, 문서화가 강력하다. :contentReference[oaicite:3]{index=3}
- 최신 릴리즈 기준 Pydantic v2 계열과 잘 맞물린다. :contentReference[oaicite:4]{index=4}

권장:
- **FastAPI + Pydantic v2 + SQLAlchemy 2.x**
- 비동기 처리를 남발하지 말고, DB I/O와 외부 API 호출이 필요한 곳만 async
- 배치/후처리는 별도 worker로 분리 가능하게 설계

## 4.3 Database
- **PostgreSQL** 메인 DB
- 리뷰 원문, 분류 결과, 응답 초안, 정책 로그, 운영 설정까지 모두 Postgres 중심
- RAG가 필요해질 경우 **pgvector**를 같은 Postgres 안에 추가
  - 별도 벡터 DB를 초기에 두지 않는다.
  - pgvector는 Postgres 내부에서 벡터 저장/유사도 검색을 지원한다. :contentReference[oaicite:5]{index=5}

## 4.4 LLM/API
권장 원칙:
- 분류는 **구조화된 JSON 출력**
- 응답 생성도 **구조화된 JSON + 슬롯 기반 템플릿 조립**
- 자유 생성은 최소화

OpenAI 계열을 사용할 경우 structured outputs(JSON schema)와 embedding API를 활용할 수 있다. :contentReference[oaicite:6]{index=6}

---

## 5. 왜 “완전한 RAG 에이전트”가 아닌가

앱리뷰 응답은 대체로 아래 특징이 있다.

- 짧다
- 반복 패턴이 많다
- 정답이 복잡한 지식탐색이 아니라 **운영정책/릴리즈노트/FAQ**에 가깝다
- 잘못 답하면 리스크가 크다

따라서 초기에 필요한 것은:
- 복잡한 tool-using agent ❌
- 방대한 문서 reasoning ❌
- **정책 기반 자동화 + 얕은 검색 grounding** ⭕

### 결론
초기에는 RAG를 **옵션 기능**으로 둔다.

**추천 단계**
1. 1단계: 분류 + 정책 엔진 + 템플릿 응답
2. 2단계: FAQ / 릴리즈노트 / 공지사항 검색 추가
3. 3단계: 문서 chunking + embedding + pgvector
4. 4단계: 필요할 때만 더 복잡한 agentic flow

---

## 6. 시스템 아키텍처

```text
[App Store Reviews / VOC Source]
            |
            v
   [Ingestion Service]
            |
            v
    [Normalization Layer]
            |
            v
   [Classification Pipeline]
   - category
   - sentiment
   - urgency
   - ambiguity/confidence
            |
            v
      [Policy Engine]
   - auto reply?
   - needs review?
   - ask clarification?
   - create incident?
            |
     +------+------+
     |             |
     v             v
[Reply Generator] [Human Review Queue]
     |
     v
[Response Draft / Auto Publish]

Optional side path:
[Knowledge Base / Release Notes / FAQ / Policy Docs]
            |
            v
        [Lite RAG]
            |
            +--> used only when needed by generator
```

---

## 7. 핵심 도메인 모델

## 7.1 Review

```ts
type Review = {
  id: string
  source: 'google_play' | 'app_store' | 'internal'
  app_version?: string
  os?: string
  locale?: string
  rating?: number
  author_name?: string
  raw_text: string
  normalized_text: string
  created_at: string
  metadata: Record<string, unknown>
}
```

## 7.2 ClassificationResult

```ts
type ClassificationResult = {
  review_id: string
  categories: Array<
    | 'bug'
    | 'payment'
    | 'refund'
    | 'performance'
    | 'login_account'
    | 'ux_ui'
    | 'feature_request'
    | 'policy_inquiry'
    | 'complaint'
    | 'praise'
    | 'spam'
    | 'other'
  >
  sentiment: 'positive' | 'neutral' | 'negative'
  urgency: 'low' | 'medium' | 'high' | 'critical'
  confidence: number
  entropy?: number
  top_candidates?: Array<{ label: string; score: number }>
  needs_clarification: boolean
  out_of_distribution: boolean
  model_version: string
}
```

## 7.3 PolicyDecision

```ts
type PolicyDecision = {
  review_id: string
  action:
    | 'auto_reply'
    | 'draft_reply'
    | 'request_clarification'
    | 'route_to_human'
    | 'create_issue'
    | 'ignore'
  reason_codes: string[]
  risk_score: number
  policy_version: string
}
```

## 7.4 ReplyDraft

```ts
type ReplyDraft = {
  review_id: string
  tone: 'formal' | 'empathetic' | 'brief'
  template_id?: string
  generated_text: string
  grounded_sources?: string[]
  requires_human_approval: boolean
  model_version?: string
}
```

---

## 8. 기능 범위

## 8.1 MVP

* 리뷰 수집
* 리뷰 리스트/필터/검색
* 자동 분류
* confidence/ambiguity 계산
* 정책 엔진
* 응답 초안 생성
* 검수 큐
* 수동 승인/수정/반려
* 운영 대시보드

## 8.2 Phase 2

* FAQ / 릴리즈노트 기반 Lite RAG
* 이슈 티켓 연동(Jira/Slack)
* 앱 버전별 이슈 클러스터링
* 자동 라우팅

## 8.3 Phase 3

* 사용자 세분화
* 반자동 clarifying flow
* 주간 VOC 인사이트 리포트
* 다국어 대응 강화

---

## 9. 정책 엔진 설계

이 시스템의 본체는 사실상 여기다.

## 9.1 입력

* 카테고리
* 감성
* confidence
* ambiguity score
* rating
* app version
* 금칙어/법적 민감 키워드
* 결제/환불/계정 여부
* OOD 여부

## 9.2 출력

* auto_reply
* draft_reply
* route_to_human
* ask_clarification
* create_issue
* ignore

## 9.3 기본 규칙 예시

```text
IF category in [payment, refund, login_account] THEN
  requires_human_approval = true

IF confidence < 0.55 THEN
  route_to_human

IF 0.55 <= confidence < 0.75 AND ambiguity_score high THEN
  ask_clarification OR draft_reply

IF category == bug AND sentiment == negative AND rating <= 2 THEN
  create_issue + draft_reply

IF category == praise THEN
  auto_reply allowed

IF spam == true THEN
  ignore
```

## 9.4 Risk-first rule

아래는 초기에 무조건 보수적으로 간다.

* 결제
* 환불
* 계정잠김
* 개인정보
* 법적 표현
* 차별/욕설/위협
* 보안 이슈
* 장애 공지성 이슈

이 카테고리는 **완전 자동 게시 금지**.

---

## 10. ambiguity / uncertainty 설계

사용자 아이디어를 반영하되, “항상 물어보기”는 금지한다.

## 10.1 score 정의

권장:

```text
ambiguity_score =
  a * (1 - top1_confidence)
+ b * entropy
+ c * is_ood
+ d * low_margin(top1 - top2)
```

## 10.2 분기

* **High confidence**: 자동 초안 생성
* **Mid confidence**: 초안 생성 + 검수 큐
* **Low confidence**: 사람 검수
* **Very ambiguous**: 선택지 기반 clarification 후보 생성

## 10.3 중요한 판단

앱스토어 리뷰는 보통 멀티턴 UX가 약하다.
따라서 “고객에게 다시 묻기” 기능은 내부 VOC센터/앱내 문의 채널에는 유용하지만, 스토어 리뷰 응답에는 제한적일 수 있다.

### 결론

* **스토어 리뷰**: Top-3 선택지 UI는 내부 운영자용으로 먼저 도입
* **앱 내 VOC/문의 화면**: Top-3 선택지 UX를 사용자에게 직접 노출 가능

즉, 같은 엔진을 쓰되 **채널별 전략**을 다르게 한다.

---

## 11. 응답 생성 전략

## 11.1 절대 원칙

자유 생성 중심으로 가지 않는다.

권장 순서:

1. 템플릿 선택
2. 슬롯 채우기
3. 필요하면 LLM으로 문장 다듬기
4. 금칙어/정책 검증
5. 게시 또는 검수

## 11.2 템플릿 예시

### bug

```text
안녕하세요. 이용에 불편을 드려 죄송합니다.
말씀해주신 현상은 확인이 필요한 이슈로 전달하겠습니다.
가능하시다면 앱 버전과 발생 상황을 함께 남겨주시면 확인에 도움이 됩니다.
```

### payment

```text
안녕하세요. 결제 관련 불편을 겪으셨다니 죄송합니다.
결제/환불 이슈는 계정 및 거래 정보 확인이 필요할 수 있어 고객센터 또는 앱 내 문의를 통해 접수 부탁드립니다.
확인 가능한 경로를 안내드리겠습니다.
```

### praise

```text
안녕하세요. 소중한 의견 감사합니다.
좋은 경험을 드릴 수 있어 기쁩니다. 앞으로도 더 나은 서비스를 제공하겠습니다.
```

## 11.3 생성 출력 형식

LLM은 최종 텍스트만 뽑지 말고 구조화된 객체를 반환한다.

```json
{
  "intent": "bug",
  "tone": "formal",
  "requires_human_approval": true,
  "template_id": "bug_ack_v1",
  "draft_text": "안녕하세요. 이용에 불편을 드려 죄송합니다..."
}
```

---

## 12. Lite RAG 설계

## 12.1 도입 기준

다음이 생기면 도입:

* 동일 질문이 반복된다
* 릴리즈노트 기반 설명이 필요하다
* 운영정책/FAQ 참조가 잦다
* 수동 응답 품질 차이가 커진다

## 12.2 지식원

* FAQ
* 공지사항
* 릴리즈노트
* 장애 대응 문안
* 고객응대 정책
* 금칙 표현 규정

## 12.3 저장 전략

초기:

* Postgres 테이블에 문서 원문 저장
* 단순 keyword/BM25 수준 또는 SQL LIKE + tag 검색

고도화:

* chunking
* embedding 생성
* pgvector 저장 및 similarity search ([GitHub][1])

## 12.4 중요한 원칙

RAG는 **답을 대신하는 엔진이 아니라 근거 공급기**다.

---

## 13. API 설계

## 13.1 FastAPI 엔드포인트

### Reviews

* `GET /api/v1/reviews`
* `GET /api/v1/reviews/{review_id}`
* `POST /api/v1/reviews/ingest`
* `POST /api/v1/reviews/bulk-ingest`

### Classification

* `POST /api/v1/classify/{review_id}`
* `POST /api/v1/classify/batch`
* `GET /api/v1/classifications/{review_id}`

### Policy

* `POST /api/v1/policy/evaluate/{review_id}`
* `GET /api/v1/policy-decisions/{review_id}`

### Reply

* `POST /api/v1/replies/generate/{review_id}`
* `POST /api/v1/replies/regenerate/{review_id}`
* `POST /api/v1/replies/{review_id}/approve`
* `POST /api/v1/replies/{review_id}/reject`
* `POST /api/v1/replies/{review_id}/publish`

### Knowledge Base

* `POST /api/v1/kb/documents`
* `GET /api/v1/kb/documents`
* `POST /api/v1/kb/reindex`
* `POST /api/v1/kb/search`

### Dashboard

* `GET /api/v1/dashboard/summary`
* `GET /api/v1/dashboard/trends`
* `GET /api/v1/dashboard/categories`
* `GET /api/v1/dashboard/high-risk`

---

## 14. 프론트엔드 페이지 설계

## 14.1 Next.js routes

```text
/app
  /login
  /dashboard
  /reviews
  /reviews/[id]
  /queue
  /replies
  /kb
  /settings
```

## 14.2 주요 화면

### Dashboard

* 전체 리뷰 수
* 카테고리 분포
* 부정 리뷰 비율
* 자동응답률
* 인간 검수 비율
* high-risk 건수
* 앱 버전별 버그 추세

### Review List

* 날짜, 평점, 카테고리, 감성, confidence 필터
* 검색
* 정렬
* 배치 액션

### Review Detail

* 원문
* 정규화 텍스트
* 분류 결과
* ambiguity score
* 정책 판단
* 응답 초안
* 관련 문서 근거
* 승인/수정/반려

### Queue

* human review only
* SLA 기준 우선순위
* 결제/계정/환불 우선

### KB

* FAQ/공지/릴리즈노트 문서 업로드
* 태그 관리
* 검색 결과 확인

---

## 15. 디렉토리 구조

모노레포를 지양하므로 저장소는 두 개로 분리한다.

## 15.1 frontend repository

```text
voc-review-web/
├─ app/
│  ├─ dashboard/
│  ├─ reviews/
│  ├─ queue/
│  ├─ kb/
│  └─ settings/
├─ components/
│  ├─ review/
│  ├─ dashboard/
│  ├─ forms/
│  └─ ui/
├─ lib/
│  ├─ api/
│  ├─ auth/
│  ├─ utils/
│  └─ schemas/
├─ hooks/
├─ styles/
├─ public/
├─ middleware.ts
├─ next.config.ts
├─ package.json
└─ README.md
```

## 15.2 backend repository

```text
voc-review-api/
├─ app/
│  ├─ api/
│  │  └─ v1/
│  ├─ core/
│  │  ├─ config.py
│  │  ├─ security.py
│  │  └─ logging.py
│  ├─ db/
│  │  ├─ base.py
│  │  ├─ session.py
│  │  └─ models/
│  ├─ schemas/
│  ├─ services/
│  │  ├─ ingestion/
│  │  ├─ classification/
│  │  ├─ policy/
│  │  ├─ generation/
│  │  ├─ kb/
│  │  └─ analytics/
│  ├─ workers/
│  └─ main.py
├─ alembic/
├─ tests/
├─ scripts/
├─ requirements/
├─ pyproject.toml
└─ README.md
```

---

## 16. 데이터베이스 스키마 초안

## 16.1 tables

### reviews

* id
* source
* source_review_id
* app_version
* os
* locale
* rating
* author_name
* raw_text
* normalized_text
* created_at
* ingested_at
* metadata_json

### classification_results

* id
* review_id
* categories_json
* sentiment
* urgency
* confidence
* entropy
* top_candidates_json
* needs_clarification
* out_of_distribution
* model_version
* created_at

### policy_decisions

* id
* review_id
* action
* risk_score
* reason_codes_json
* policy_version
* created_at

### reply_drafts

* id
* review_id
* template_id
* grounded_sources_json
* generated_text
* requires_human_approval
* model_version
* status
* approved_by
* approved_at
* published_at
* created_at

### kb_documents

* id
* title
* doc_type
* tags_json
* content
* version
* active
* created_at
* updated_at

### kb_chunks

* id
* document_id
* chunk_index
* content
* embedding (optional vector)
* metadata_json

### audit_logs

* id
* entity_type
* entity_id
* action
* actor
* before_json
* after_json
* created_at

---

## 17. 모델링 전략

## 17.1 초기 전략

파인튜닝 없이 시작한다.

구성:

* 규칙 기반 전처리
* LLM or classifier API를 통한 구조화 분류
* 정책 엔진
* 템플릿 기반 생성

## 17.2 분류 방식

초기 MVP는 아래 두 방식 중 하나:

### Option A — LLM structured classification

장점:

* 빠른 MVP
* 라벨 확장 쉬움

단점:

* 비용/지연
* 일관성 관리 필요

### Option B — 경량 분류 모델 + 룰

장점:

* 운영비 낮음
* 빠름

단점:

* 초기 학습데이터 필요

### 권장

**MVP는 A**,
데이터가 쌓이면 **B 또는 하이브리드**로 이동

---

## 18. 테스트 전략

테스트데이터가 처음부터 깔끔하게 존재하지 않는다는 전제를 둔다.

## 18.1 단계별 테스트

### Step 1 — Synthetic seed data

* LLM으로 리뷰 패턴 생성
* 오타, 욕설, 축약어, 반말, 중의성 포함
* 카테고리별 최소 200~500개 seed

### Step 2 — Rule-based adversarial set

직접 만든다.

* “결제했는데 안 됨”
* “로그인도 안 되고 결제도 안 됨”
* “업데이트 후 렉 심함”
* “좋긴 한데 느림”
* “환불 안 해줘서 별점 1점”

### Step 3 — Human labeled real data

* 실제 리뷰 샘플링
* 최소 2인 라벨링
* 불일치 케이스는 adjudication

### Step 4 — Shadow deployment

* 실제 운영에는 미게시
* 분류/응답만 내부적으로 생성
* 운영자 평가

## 18.2 측정 지표

* category precision/recall/F1
* urgency recall
* false auto-reply rate
* human override rate
* publish acceptance rate
* harmful response rate
* time-to-first-draft

## 18.3 가장 중요한 운영 지표

* **high-risk auto publish = 0**
* 잘못된 결제/환불 안내 건수
* 인간 검수로 뒤집힌 비율

---

## 19. 보안 및 안전장치

* API 인증: JWT or session cookie
* RBAC: admin / reviewer / operator
* 감사로그 필수
* prompt injection 방어:

  * 외부 문서는 trusted/untrusted 구분
  * 리뷰 원문은 instruction이 아니라 데이터로 취급
* PII masking
* 금칙문구 검사
* 민감 카테고리 자동게시 금지

---

## 20. 운영 정책

## 20.1 auto publish 허용 예

* praise
* 단순 thank-you
* low-risk UX 불만 중 고신뢰
* 일반 공지 링크 유도 가능 케이스

## 20.2 auto publish 금지 예

* 결제/환불
* 계정 잠김
* 개인정보
* 법률/보상 표현
* 장애 확정 표현
* 원인 단정 표현

## 20.3 문구 정책

금지:

* “확인했습니다” (실제로 확인 안 했으면)
* “환불 처리해드리겠습니다” (권한 없으면)
* “버그가 맞습니다” (원인 확정 전)
* “곧 수정됩니다” (일정 확정 전)

권장:

* “확인이 필요합니다”
* “불편을 드려 죄송합니다”
* “상세 확인을 위해 문의 부탁드립니다”
* “전달하여 검토하겠습니다”

---

## 21. 배포 전략

## 21.1 Infra

* Frontend: Next.js self-host or standard Node deployment 가능 ([Next.js][2])
* Backend: FastAPI + Uvicorn/Gunicorn
* DB: PostgreSQL
* Optional worker: Celery/RQ/Arq 중 택1
* Reverse proxy: Nginx

## 21.2 환경 분리

* local
* dev
* staging
* prod

## 21.3 CI/CD

* frontend/backend 각각 독립 배포
* API contract는 OpenAPI schema 기반으로 관리
* staging에서 shadow mode 검증 후 prod

---

## 22. 구현 순서

## Phase 0 — Foundation

* repos 생성
* Next.js / FastAPI scaffold
* auth / DB / migration / logging
* 리뷰 리스트 기본 UI
* 기본 API 연결

## Phase 1 — Core pipeline

* 리뷰 수집
* 정규화
* 분류 API
* 정책 엔진
* 응답 초안 생성
* 검수 큐

## Phase 2 — Safety & analytics

* ambiguity score
* risk rules
* dashboard
* audit logs
* batch actions

## Phase 3 — Lite RAG

* KB 문서 업로드
* chunking
* search
* grounded draft generation

## Phase 4 — Automation expansion

* Jira/Slack
* app version anomaly trend
* 반복 이슈 cluster
* 주간 VOC 리포트

---

## 23. Claude Code 실행 지시용 작업 단위

아래 순서로 바로 구현을 시작하게 하면 된다.

### Backend first

1. FastAPI project scaffold
2. DB models + Alembic
3. `/reviews`, `/classify`, `/policy`, `/replies` API 생성
4. classification service interface 정의
5. policy engine rule file 정의
6. reply generator service 정의
7. audit log 추가
8. test fixtures 작성

### Frontend next

1. Next.js App Router scaffold
2. dashboard / reviews / review detail / queue page 생성
3. API client 작성
4. filtering/search table 작성
5. review detail panel 작성
6. approve/reject/publish 액션 연결
7. settings / KB management page 생성

### Then

1. synthetic dataset seed scripts
2. shadow mode
3. metrics panel
4. lite RAG

---

## 24. Claude Code용 명시적 개발 원칙

* 과설계 금지
* 모듈 경계 명확화
* 서비스 계층 분리
* 프롬프트 하드코딩 최소화
* 정책 룰은 코드 외부화 가능하게
* 모델 출력은 반드시 schema validation
* 모든 자동결정은 audit log 남기기
* high-risk는 default deny
* 프론트는 thin, 백엔드에서 판단

---

## 25. 최종 판단

이 프로젝트는 난이도가 낮아 보이지만, 실제 핵심은 RAG가 아니다.

핵심은 다음 세 가지다.

1. **분류 정확도**
2. **정책 엔진의 보수성**
3. **생성의 제한과 감사 가능성**

따라서 최적 설계는:

> **Next.js + FastAPI + PostgreSQL 중심의 명시적 정책 기반 시스템**
>
> 그리고 RAG는 **필요한 만큼만** 붙인다.

---

## 26. 추천 최종 스택

### Frontend

* Next.js (App Router) ([Next.js][3])
* TypeScript
* Tailwind CSS
* TanStack Query
* Zod

### Backend

* FastAPI ([FastAPI][4])
* Pydantic v2 ([FastAPI][5])
* SQLAlchemy 2.x
* Alembic
* PostgreSQL
* Redis(optional queue/cache)

### AI / Retrieval

* Structured outputs(JSON schema) for classification/generation ([OpenAI Platform][6])
* Embeddings only when Lite RAG starts ([OpenAI Platform][7])
* pgvector when semantic retrieval becomes necessary ([GitHub][1])

---

## 27. 한 줄 실행 결론

**바로 시작할 구현선은**
`분류 → 정책판단 → 템플릿 응답 → 검수 큐` 이다.
RAG는 2차 도입으로 미루는 것이 전체 리스크와 복잡도 대비 최적이다.