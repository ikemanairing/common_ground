export const STEP3_DEFAULT_TOPICS: string[] = [];
export const STEP3_DEFAULT_ACTIVITY = "";

export const STEP3_TOPIC_OPTIONS = [
  "영화 & TV",
  "음악 감상",
  "게임",
  "맛집 탐방",
  "취미 생활",
  "스포츠",
  "여행",
  "학교 생활",
  "패션/뷰티",
] as const;

export type Step3ActivityOption = {
  title: string;
  subtitle: string;
  icon: string;
  iconClassName: string;
};

export const STEP3_ACTIVITY_OPTIONS: Step3ActivityOption[] = [
  {
    title: "점심 같이 먹기",
    subtitle: "급식실이나 매점",
    icon: "restaurant",
    iconClassName: "bg-orange-50 text-orange-400 group-hover:bg-orange-100",
  },
  {
    title: "운동하기",
    subtitle: "체육관이나 운동장",
    icon: "sports_basketball",
    iconClassName: "bg-blue-50 text-blue-400 group-hover:bg-blue-100",
  },
  {
    title: "게임 한 판",
    subtitle: "모바일이나 PC방",
    icon: "stadia_controller",
    iconClassName: "bg-purple-50 text-purple-400 group-hover:bg-purple-100",
  },
  {
    title: "같이 공부하기",
    subtitle: "도서관이나 스터디카페",
    icon: "school",
    iconClassName: "bg-pink-50 text-pink-400 group-hover:bg-pink-100",
  },
];
