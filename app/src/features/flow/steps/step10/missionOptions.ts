export type MissionOption = {
  id: string;
  title: string;
  script: string;
};

export const STEP10_MISSION_OPTIONS: MissionOption[] = [
  {
    id: "lunch-question",
    title: "옆자리 친구에게 '점심 뭐 먹어?' 묻기",
    script:
      '"점심 보통 급식 먹어, 아니면 매점 가? 좋아하는 메뉴 있어?" 라고 자연스럽게 이어가보세요. 식사는 가장 쉬운 공통 관심사입니다.',
  },
  {
    id: "borrow-pen",
    title: "앞자리 친구에게 '필기구 빌려줄 수 있어?' 묻기",
    script:
      '"혹시 펜 남는 거 있어? 내가 깜빡하고 안 가져왔네." 빌린 후 돌려줄 때 "고마워 덕분에 살았어!" 라고 말하며 간식을 건네보세요.',
  },
  {
    id: "ask-teacher",
    title: "선생님께 수업 끝나고 '질문이 있어요' 말걸기",
    script:
      '"선생님, 아까 말씀하신 부분에서 이 내용이 조금 헷갈려서요." 질문은 선생님께 좋은 인상을 남기는 가장 빠른 방법입니다.',
  },
  {
    id: "store-together",
    title: "쉬는 시간에 '매점 같이 갈래?' 제안하기",
    script:
      '"나 매점 갈 건데 같이 갈래? 아이스크림 내가 살게!" 작은 호의는 거절하기 어렵고 관계를 부드럽게 만듭니다.',
  },
];
