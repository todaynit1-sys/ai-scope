# AI Model Radar — 실제 자료 연결

기본 화면은 실제 API 수집값을 사용합니다. OpenAI·Anthropic·Google·xAI의 텍스트 모델만 포함하고 DeepSeek·Meta·Alibaba는 제외합니다. 배치·무료 라우팅 별칭은 중복 비교를 줄이기 위해 기본 목록에서 제외합니다.

## 실행과 첫 수집

Node.js 20.9 이상에서 다음을 실행합니다.

```sh
npm install
npm run collect:data
npm run dev
```

localhost:3000에서 확인합니다. 현재 실행 중인 로컬 미리보기는 127.0.0.1:3001입니다.
수집 명령은 .env.local을 읽습니다. API 호출은 모델 목록·측정 자료를 조회할 뿐 모델 추론 요청이나 결제를 실행하지 않습니다.

## 연결된 자료

- OpenRouter: 공개 GET /api/v1/models. 정식 ID, 기본 입력·출력 토큰 단가, 공개된 지원 추론 단계, 응답에 포함된 AA 종합·코딩·에이전트 지수. 키 없이 조회를 검증했습니다.
- Artificial Analysis: 공식 GET /api/v2/language/models/free?page=N. API 키 설정 시 모든 페이지를 순서대로 수집합니다. 종합·코딩·에이전트 지수, 가격, 속도 중앙값, 평가 작업당 비용, 평가 버전을 보존합니다.
- 공급자마다 별도 행과 ID를 사용합니다. 이름이 비슷하다는 이유로 가격·성능·평가 설정을 합치지 않습니다.
- 원본에서 빠진 값은 null이며 화면에서 미확인/미공개로 표시합니다. 0은 실제 0으로 보존합니다.

공식 문서: [OpenRouter](https://openrouter.ai/docs/api/api-reference/models/list-all-models-and-their-properties), [Artificial Analysis](https://artificialanalysis.ai/data-api/docs).

## AA 공식 API 확장

.env.example을 .env.local로 복사하고 다음 값을 설정합니다.

```dotenv
DATA_MODE=internal
ARTIFICIAL_ANALYSIS_API_KEY=발급받은_키
AA_REDISTRIBUTION_ALLOWED=false
```

키는 AA의 공식 문서에 연결된 API 키 관리 화면에서 발급합니다. 서버를 재시작한 뒤 ‘자료 갱신’을 누르거나 npm run collect:data를 실행합니다. 키는 서버에서만 x-api-key 헤더로 보내며 JSON 스냅샷·브라우저 응답에 넣지 않습니다. 환경변수 파일과 data 폴더는 Git에서 제외했습니다.

DATA_MODE=public에서도 OpenRouter 공개 모델 목록에 포함된 성능 지수는 출처 표시와 함께 유지합니다. 별도 AA 공식 API 자료만 기본 제외합니다. AA 공식 API의 공개 재배포 권한을 확인한 경우에만 AA_REDISTRIBUTION_ALLOWED=true를 사용합니다. 해당 플래그는 권한을 부여하지 않습니다. OpenRouter Data API의 데이터 이용·출처 기준: https://openrouter.ai/docs/cookbook/administration/data-api#license-and-citation

## 추론량과 가격을 해석하는 법

지원 추론 단계는 공개 API가 반환한 문자열을 그대로 표시합니다. max와 ultra는 서로 바꾸지 않습니다. 지원 단계가 있어도 단계별 성능 측정값이 있다는 뜻은 아닙니다. OpenRouter의 공개 점수에서 평가 버전과 추론 설정이 빠져 있으면 미공개로 표시하고 High나 Medium으로 간주하지 않습니다.

AA 모델명에 (high) 등 명시된 평가 설정이 있을 때만 그 설정으로 분류합니다. 같은 모델의 실제 단계별 점수·평가 비용이 함께 있고 버전이 같을 때만 그래프에서 선으로 연결합니다. 5단계 가상 프로필을 만들지 않습니다. 공식 근거 없는 최상위/차상위 등급도 부여하지 않습니다.

OpenRouter 토큰당 달러 가격을 1,000,000배 하여 USD/1M으로 변환합니다. 그래프 기본 X축은 입력 25% + 출력 75%의 자체 평균 단가입니다. 실제 작업당 비용이나 앱 구독료가 아닙니다. 긴 입력·캐시·이미지·도구·요청 요금은 원본 링크를 확인해야 합니다.

가성비 카드는 공개된 성능과 평균 단가로 계산한 자체 지수입니다.

```text
valueScore = 100 * (performance / maxPerformance)
             / (0.25 + averageTokenPrice / maxAverageTokenPrice)
```

분모의 최대값은 최소 1로 설정합니다. 모집단과 가격 가정이 바뀌면 지수가 달라집니다. AA 평가 작업당 비용은 AA가 제공한 평가 작업 비용이며 일상 작업의 견적이 아닙니다.

## 갱신과 이력

- 화면 ‘자료 갱신’: 서버에서 실제 API를 조회하고 현재 화면을 갱신합니다. 중복 요청 제한은 1분, 일반 캐시는 6시간입니다. 화면 갱신은 영구 이력을 저장하지 않습니다.
- npm run collect:data: data/latest.json과 data/history/<ISO 수집시각>.json에 저장합니다. 최신 파일은 임시 파일을 쓴 후 교체합니다.
- 오류/타임아웃/401/403/429: 연결 상태를 표시합니다. 기존 수집값이 있으면 행별 기존 수집 시각을 유지합니다. 전체 실패 시 수집 명령은 기존 파일을 교체하지 않고 종료합니다.
- /history: 실제로 저장된 이전 수집 시점과 가격 변화를 비교합니다. 과거 자료가 없으면 생성하지 않습니다. 평가 버전이 없거나 다르면 성능 변화를 직접 비교하지 않습니다.
- /?date=<ISO 수집시각>: 저장된 스냅샷을 열 수 있습니다. 없는 날짜는 현재 자료와 안내문을 표시합니다.

서버리스 배포의 파일시스템은 영구 저장소가 아닙니다. 저장된 파일을 함께 배포하거나 외부 영구 저장소를 연결해야 합니다. 04:00/16:00 KST 자동 수집을 원할 때 수집 명령을 외부 스케줄러에서 실행할 수 있습니다. 현재 공개 배포 주소는 https://ai-scope-sage.vercel.app 이며 자동 수집 스케줄은 활성화하지 않았습니다. 내부 AA 데이터는 공개 Git 저장소에 올리지 마세요.

## 화면과 코드

- /: 제작사별 성능 상위 2개 기본 그래프, 모델 체크, 실제 자료 검색·정렬, TOP 카드
- /compare: 체크한 모델의 실제 공개값 비교
- /history: 실제 저장 기록
- /lecture: 메뉴 없는 캡처 화면
- /methodology: 출처·수집·추론·가격 기준

실제 자료의 계약은 lib/live-types.ts, 검증·단위 변환은 lib/sources/live-parsers.mjs, 수집은 lib/sources/live-collector.mjs, 서버 캐시와 저장 파일 읽기는 lib/live-repository.ts에 있습니다. 클라이언트는 components/live-radar.tsx에서 렌더링합니다. API 경로는 /api/data입니다.

이전 예시 화면은 ?demo=1을 명시했을 때만 접근합니다. 예시 자료는 실제 자료의 결측값을 채우거나 이력 비교에 사용하지 않습니다.

## 검증

```sh
npm run test:data
npm run lint
npm run typecheck
npm run build
```

데이터 테스트는 가격 단위, 결측값, 0, 공급자 필터, 단계별 행 식별, 페이지 수집, API 키 전송 범위, 공개 모드 필터, 버전 변경·요청 실패 처리를 검증합니다.
