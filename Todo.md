# Todo

## 현재 상태 요약
- `app/` 기준 `npm run build`는 성공했고 현재 프런트엔드 번들은 생성된다.
- `./scripts/check-structure.sh`, `./scripts/smoke-step1.sh`, `./scripts/smoke-step3-10.sh`는 통과해서 기본 구조와 단계 전환 골격은 확인됐다.
- `cd app && npm run typecheck`, `npm run test:flow`, `npm run test:validators`, `./scripts/verify-app.sh`가 통과한다.
- `supabase/migrations/20260228_init.sql` 및 `supabase/functions/` 골격은 이미 존재하고, 브라우저 함수 호출은 공용 client와 환경변수 규칙으로 정리됐다.
- 루트 이어하기, 단계 직접 진입 가드, Step7 `바로 끝내기` 분기, Step8/Step9 명시적 선택, 주요 사용자-facing 문구 한글화까지 코드 반영이 끝났다.
- 남은 핵심은 [`docs/manual-flow-checklist.md`](/home/ikemanairing/code/Projects/Common_Ground/docs/manual-flow-checklist.md) 기준의 실제 브라우저 수동 점검과 그 결과 정리다.

## 현재 우선순위
1. 실제 브라우저에서 Step1부터 Done까지 한 번 끝까지 진행한다.
2. [`docs/manual-flow-checklist.md`](/home/ikemanairing/code/Projects/Common_Ground/docs/manual-flow-checklist.md)에 PASS/FAIL과 재현 절차를 기록한다.
3. 기록된 이슈를 기준으로 `M2`의 UX 보완 항목을 확정하고 수정한다.

## 목표
1단계부터 10단계와 Done 화면까지 실제 사용 가능한 모바일 흐름으로 완성하고, 세션 참여·응답 저장·비교 흐름을 Supabase와 안정적으로 연결한다. 이후 타입체크와 검증 루틴을 정착시키고, 운영 및 배포 문서까지 갖춰 운영 가능한 수준으로 마무리한다.

## 로드맵

### M1. 개발 기준선 안정화
- [x] React 타입 패키지 추가
완료 기준: `app/`에 `@types/react`, `@types/react-dom`가 dev dependency로 추가되어 있다.

- [x] TypeScript 타입 오류 정리
완료 기준: `cd app && npx tsc --noEmit`가 0 exit code로 종료된다.

- [x] `typecheck` 스크립트 추가
완료 기준: [`app/package.json`](/home/ikemanairing/code/Projects/Common_Ground/app/package.json)에 `typecheck` 스크립트가 추가되어 반복 실행 기준이 고정된다.

### M2. 사용자 흐름 완성
- [ ] 1차 수동 플로우 실행
완료 기준: Step1 -> Profile -> Interests -> Topics -> Promise -> Q1~Q8 -> Compare -> Wrap-up -> Emotion/Summary/Mission -> Done 흐름을 실제 브라우저에서 끝까지 1회 실행했다.

- [ ] 수동 점검표 기록 완료
완료 기준: [`docs/manual-flow-checklist.md`](/home/ikemanairing/code/Projects/Common_Ground/docs/manual-flow-checklist.md)의 기본 정보, 진입/복구, 질문 흐름, 분기 흐름, 완료 흐름, 기록 섹션이 채워져 있다.

- [ ] 상태 복구와 분기 흐름 확인
완료 기준: 새로고침 복구, 직접 URL 진입 가드, Step7 `바로 끝내기` 분기, Mission 뒤로가기, Done 요약 값이 기대한 동작과 맞는지 확인되어 있다.

- [ ] 1차 UX 수정 목록 확정
완료 기준: 누락된 입력 가드, 문구, 화면 피드백, 전환 흐름 등 실제 수정이 필요한 항목만 추려서 목록화되어 있다.

- [ ] 1차 UX 수정 반영
완료 기준: 수동 점검에서 발견된 즉시 수정 가능한 UX 이슈가 코드에 반영되고 검증 루틴이 다시 통과한다.

- [x] 자동 흐름 가드 및 기본 UX 보강
완료 기준: 이어하기 라우팅, 직접 URL 진입 가드, Step7 분기 라우팅, Step8/Step9 명시적 선택, 주요 화면 한글 문구 정리가 코드에 반영되어 있다.

### M3. 백엔드 연동 고정
- [x] 환경변수 우선순위 명시
완료 기준: `VITE_SUPABASE_FUNCTIONS_URL` 우선, `VITE_API_BASE_URL` 보조 규칙이 코드와 문서에 일관되게 반영되어 있다.

- [x] step별 function client 사용 정책 정리
완료 기준: 어떤 단계가 어떤 function client를 쓰는지와 공통 패턴이 정리되어 있다.

- [x] 미사용 공용 API 계층 처리 방향 확정
완료 기준: [`app/src/lib/api/client.ts`](/home/ikemanairing/code/Projects/Common_Ground/app/src/lib/api/client.ts)를 제거할지 공통 유틸로 통합할지 결정되어 있다.

- [x] Supabase 흐름 매핑 확인
완료 기준: migration 및 function이 앱의 세션 참여, 저장, 비교, 완료 흐름과 어떻게 연결되는지 확인되어 있다.

### M4. 검증 체계 강화
- [x] 검증 실행 순서 문서화
완료 기준: 타입체크, 빌드, 스모크 스크립트를 어떤 순서로 돌릴지 문서에 정리되어 있다.

- [x] 흐름 테스트 항목 정의
완료 기준: 현재 validator 테스트 외에 추가할 단계 흐름 테스트 범위와 우선순위가 정리되어 있다.

- [x] 실패 대응 기준 정리
완료 기준: 검증 실패 시 확인할 항목과 재현 절차가 문서로 남아 있다.

### M5. 운영/배포 준비
- [x] 배포 문서 업데이트
완료 기준: [`docs/deploy.md`](/home/ikemanairing/code/Projects/Common_Ground/docs/deploy.md)에 실제 검증 및 배포 전 확인 순서가 반영되어 있다.

- [x] 환경변수 표준화
완료 기준: 로컬/배포 환경에서 필요한 변수 목록과 용도가 일관된 기준으로 정리되어 있다.

- [x] 운영 점검 루틴 연결
완료 기준: 운영 체크 항목, 스모크 실행, 배포 전 확인 절차가 하나의 운영 흐름으로 이어져 있다.

## 보류/후순위
- [ ] API 계층 리팩터링 세부안 정리
완료 기준: 공용 API 유틸 통합 여부와 리팩터링 범위가 후속 과제로 문서화되어 있다.

- [ ] 테스트 확장 세부 범위 정리
완료 기준: 수동 점검에서 반복적으로 깨지는 흐름부터 어떤 단계까지 자동화 테스트를 넓힐지 우선순위가 정리되어 있다.

- [ ] 장기 기술 부채 목록화
완료 기준: 현재 운영 준비에 직접 필요하지 않은 구조 개선 과제가 분리되어 있다.
