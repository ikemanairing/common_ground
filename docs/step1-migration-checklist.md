# Step1 Migration Checklist

Step1 전환 작업에서 화면 일치성과 동작 일치성을 함께 검증하는 점검표입니다.

## 1) 기본 정보
- [ ] 점검 브랜치와 기준 브랜치(비교 대상) 확인
- [ ] 점검자/점검 일시 기록
- [ ] `scripts/smoke-step1.sh` 실행 가능 상태 확인

## 2) UI 일치성 점검 (UI Fidelity)
- [ ] 화면 뼈대가 같은지 확인 (레이아웃, Layout)
- [ ] 텍스트/라벨/플레이스홀더가 같은지 확인 (카피, Copy)
- [ ] 글자 크기/두께/줄간격이 같은지 확인 (타이포그래피, Typography)
- [ ] 여백/정렬/간격이 같은지 확인 (스페이싱, Spacing)
- [ ] 색상/경계선/그림자 등 시각 표현이 같은지 확인 (비주얼 스타일, Visual Style)
- [ ] 입력 요소 종류와 순서가 같은지 확인 (폼 구조, Form Structure)
- [ ] 오류 문구 위치와 강조 방식이 같은지 확인 (유효성 피드백, Validation Feedback)
- [ ] 모바일/데스크톱에서 같은 흐름으로 보이는지 확인 (반응형, Responsive)
- [ ] 키보드 이동 순서와 포커스 표시가 자연스러운지 확인 (접근성, Accessibility)

## 3) 동작 점검 (Behavior)
- [ ] 초기 진입 시 기존 값이 동일하게 채워지는지 확인 (초기 데이터 주입, Hydration)
- [ ] 입력 변경 시 화면 값이 즉시 반영되는지 확인 (상태 동기화, State Sync)
- [ ] 필수값 누락 시 다음 진행이 막히는지 확인 (가드 로직, Guard Logic)
- [ ] 오류 조건 해소 시 다음 진행이 다시 가능한지 확인 (복구 흐름, Recovery Flow)
- [ ] 뒤로가기/다음 버튼 동작이 기존과 같은지 확인 (내비게이션, Navigation)
- [ ] 화면 재진입 시 사용자 입력이 보존되는지 확인 (영속성, Persistence)
- [ ] Enter/Tab 등 키보드 입력 동작이 기존과 같은지 확인 (키보드 상호작용, Keyboard Interaction)
- [ ] 콘솔 오류/경고가 없는지 확인 (런타임 안정성, Runtime Stability)

## 4) 정적 스모크 점검 (Static Smoke)
- [ ] `scripts/smoke-step1.sh` 실행 결과가 PASS인지 확인
- [ ] `Step1.tsx`에 `LegacyHtmlStep` 참조가 없는지 확인
- [ ] `Step1Screen` 파일이 존재하는지 확인
- [ ] `useStep1Profile` 훅 파일이 존재하는지 확인

## 5) 결과 기록
- [ ] PASS/FAIL 결과 기록
- [ ] 발견 이슈와 재현 단계 기록
- [ ] 후속 조치 담당자/기한 기록
