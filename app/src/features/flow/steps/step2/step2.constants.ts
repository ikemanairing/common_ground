export type Step2InterestCategory = {
  id: string;
  title: string;
  icon: string;
  iconShellClassName: string;
  summaryHoverClassName: string;
  chipHoverClassName: string;
  options: string[];
  placeholder?: string;
  defaultOpen?: boolean;
};

export const STEP2_DEFAULT_INTERESTS: string[] = [];
export const STEP2_PROFILE_COMPLETION_PERCENT = 20;
export const STEP2_MIN_INTERESTS_PER_CATEGORY = 2;
export const STEP2_MAX_INTERESTS_PER_CATEGORY = 2;

export const STEP2_INTEREST_CATEGORIES: Step2InterestCategory[] = [
  {
    id: "sports",
    title: "운동 & 액티비티",
    icon: "sports_basketball",
    iconShellClassName: "bg-pastel-orange text-orange-400",
    summaryHoverClassName: "hover:bg-pastel-orange/50",
    chipHoverClassName: "hover:bg-pastel-orange/30",
    options: [
      "축구",
      "농구",
      "배드민턴",
      "테니스",
      "수영",
      "러닝",
      "자전거",
      "야구",
      "탁구",
      "헬스",
      "등산",
      "요가",
      "클라이밍",
      "스케이트보드",
    ],
    defaultOpen: true,
  },
  {
    id: "games",
    title: "게임",
    icon: "sports_esports",
    iconShellClassName: "bg-pastel-purple text-purple-400",
    summaryHoverClassName: "hover:bg-pastel-purple/50",
    chipHoverClassName: "hover:bg-pastel-purple/30",
    options: [
      "FPS",
      "RPG",
      "MOBA",
      "모바일 게임",
      "전략 게임",
      "콘솔 게임",
      "리듬 게임",
      "레이싱 게임",
      "스팀 게임",
      "닌텐도 게임",
      "보드게임",
      "카드게임",
      "추리게임",
    ],
  },
  {
    id: "culture",
    title: "문화 & 예술",
    icon: "theater_comedy",
    iconShellClassName: "bg-pastel-pink text-pink-400",
    summaryHoverClassName: "hover:bg-pastel-pink/50",
    chipHoverClassName: "hover:bg-pastel-pink/30",
    options: [
      "영화 감상",
      "드라마",
      "애니메이션",
      "독서",
      "웹툰",
      "케이팝",
      "팝송",
      "뮤지컬",
      "연극",
      "전시회",
      "콘서트",
      "사진전",
    ],
  },
  {
    id: "creative",
    title: "창작 & 취미",
    icon: "palette",
    iconShellClassName: "bg-pastel-blue text-blue-400",
    summaryHoverClassName: "hover:bg-pastel-blue/50",
    chipHoverClassName: "hover:bg-pastel-blue/30",
    options: [
      "그림 그리기",
      "글쓰기",
      "사진 촬영",
      "영상 편집",
      "만들기 (DIY)",
      "뜨개질",
      "캘리그래피",
      "악기 연주",
      "작곡",
      "코딩",
      "3D 모델링",
      "베이킹",
    ],
  },
  {
    id: "study",
    title: "공부 & 학업",
    icon: "school",
    iconShellClassName: "bg-pastel-green text-green-500",
    summaryHoverClassName: "hover:bg-pastel-green/50",
    chipHoverClassName: "hover:bg-pastel-green/30",
    options: [
      "수학",
      "과학",
      "국어",
      "영어",
      "역사",
      "사회",
      "코딩",
      "AI",
      "디자인",
      "경제",
      "심리학",
      "자격증 공부",
      "스터디 모임",
    ],
  },
  {
    id: "food",
    title: "음식 & 취향",
    icon: "restaurant",
    iconShellClassName: "bg-pastel-yellow text-yellow-600",
    summaryHoverClassName: "hover:bg-pastel-yellow/50",
    chipHoverClassName: "hover:bg-pastel-yellow/30",
    options: [
      "한식",
      "중식",
      "일식",
      "양식",
      "분식",
      "디저트",
      "커피",
      "매운 음식",
      "빵집 투어",
      "맛집 탐방",
      "비건 음식",
      "야식",
    ],
  },
  {
    id: "career",
    title: "진로",
    icon: "work",
    iconShellClassName: "bg-pastel-green text-green-600",
    summaryHoverClassName: "hover:bg-pastel-green/50",
    chipHoverClassName: "hover:bg-pastel-green/30",
    options: [
      "개발자",
      "게임 개발",
      "AI 엔지니어",
      "데이터 분석가",
      "디자이너",
      "UX/UI 디자이너",
      "그래픽 디자이너",
      "기획자",
      "서비스 기획",
      "PM",
      "마케터",
      "브랜드 마케팅",
      "콘텐츠 마케팅",
      "교사",
      "교수",
      "연구원",
      "과학자",
      "의료직",
      "간호사",
      "약사",
      "심리상담사",
      "법조인",
      "회계사",
      "세무사",
      "건축가",
      "인테리어",
      "창업",
      "공무원",
      "외교관",
      "경찰/소방",
      "금융",
      "투자/자산관리",
      "영상 제작",
      "PD",
      "작가",
      "번역가",
      "승무원",
      "파일럿",
      "바리스타",
      "셰프",
      "스포츠 선수",
      "해외 취업",
      "대학원 진학",
    ],
  },
];

export const STEP2_REQUIRED_CATEGORIES = STEP2_INTEREST_CATEGORIES.filter(
  (category) => category.options.length > 0,
);

const STEP2_OPTION_CATEGORY_ID_MAP = new Map<string, string>();
STEP2_REQUIRED_CATEGORIES.forEach((category) => {
  category.options.forEach((option) => {
    STEP2_OPTION_CATEGORY_ID_MAP.set(option, category.id);
  });
});

const normalizeSelectedInterests = (selectedInterests: string[]): string[] => {
  const seen = new Set<string>();
  const normalized: string[] = [];

  selectedInterests.forEach((interest) => {
    const token = interest.trim();
    if (!token || seen.has(token)) {
      return;
    }
    seen.add(token);
    normalized.push(token);
  });

  return normalized;
};

export type Step2CategorySelectionCount = {
  id: string;
  title: string;
  selectedCount: number;
  requiredCount: number;
  maxCount: number;
};

export const getStep2CategorySelectionCounts = (
  selectedInterests: string[],
): Step2CategorySelectionCount[] => {
  const selectedSet = new Set(normalizeSelectedInterests(selectedInterests));

  return STEP2_REQUIRED_CATEGORIES.map((category) => ({
    id: category.id,
    title: category.title,
    selectedCount: category.options.reduce(
      (count, option) => count + (selectedSet.has(option) ? 1 : 0),
      0,
    ),
    requiredCount: STEP2_MIN_INTERESTS_PER_CATEGORY,
    maxCount: STEP2_MAX_INTERESTS_PER_CATEGORY,
  }));
};

export const getStep2CategoryIdByInterest = (interest: string): string | null => {
  return STEP2_OPTION_CATEGORY_ID_MAP.get(interest.trim()) ?? null;
};

export const normalizeStep2Interests = (selectedInterests: string[]): string[] => {
  const selectedSet = new Set(normalizeSelectedInterests(selectedInterests));
  const normalized: string[] = [];

  STEP2_REQUIRED_CATEGORIES.forEach((category) => {
    let keptCount = 0;
    category.options.forEach((option) => {
      if (!selectedSet.has(option)) {
        return;
      }
      if (keptCount >= STEP2_MAX_INTERESTS_PER_CATEGORY) {
        return;
      }
      normalized.push(option);
      keptCount += 1;
    });
  });

  return normalized;
};

export const getStep2ProgressiveVisibleCategoryCount = (
  selectedInterests: string[],
): number => {
  if (STEP2_REQUIRED_CATEGORIES.length === 0) {
    return 0;
  }

  const counts = getStep2CategorySelectionCounts(selectedInterests);
  let visibleCount = 1;

  for (let index = 0; index < counts.length - 1; index += 1) {
    const current = counts[index];
    if (current.selectedCount >= STEP2_MIN_INTERESTS_PER_CATEGORY) {
      visibleCount = index + 2;
      continue;
    }
    break;
  }

  return Math.min(visibleCount, counts.length);
};

export const getStep2UnmetCategoryTitles = (
  selectedInterests: string[],
): string[] => {
  return getStep2CategorySelectionCounts(selectedInterests)
    .filter((category) => category.selectedCount < category.requiredCount)
    .map((category) => category.title);
};

export const getStep2OverLimitCategoryTitles = (
  selectedInterests: string[],
): string[] => {
  return getStep2CategorySelectionCounts(selectedInterests)
    .filter((category) => category.selectedCount > category.maxCount)
    .map((category) => category.title);
};

export const getStep2RemainingRequiredCount = (
  selectedInterests: string[],
): number => {
  return getStep2CategorySelectionCounts(selectedInterests).reduce(
    (sum, category) =>
      sum + Math.max(0, category.requiredCount - category.selectedCount),
    0,
  );
};

export const getStep2CategoryRuleError = (
  selectedInterests: string[],
): string | null => {
  const overLimitCategoryTitles = getStep2OverLimitCategoryTitles(selectedInterests);
  if (overLimitCategoryTitles.length > 0) {
    if (overLimitCategoryTitles.length <= 2) {
      return `${overLimitCategoryTitles.join(", ")} 카테고리는 최대 ${STEP2_MAX_INTERESTS_PER_CATEGORY}개까지 선택할 수 있어요.`;
    }
    return `각 카테고리는 최대 ${STEP2_MAX_INTERESTS_PER_CATEGORY}개까지 선택할 수 있어요.`;
  }

  const unmetCategoryTitles = getStep2UnmetCategoryTitles(selectedInterests);
  if (unmetCategoryTitles.length === 0) {
    return null;
  }

  if (unmetCategoryTitles.length <= 2) {
    return `${unmetCategoryTitles.join(", ")} 카테고리에서 관심사를 ${STEP2_MIN_INTERESTS_PER_CATEGORY}개씩 선택해주세요.`;
  }

  return `각 카테고리에서 관심사를 ${STEP2_MIN_INTERESTS_PER_CATEGORY}개씩 선택해주세요.`;
};

export const isStep2CategoryRuleSatisfied = (
  selectedInterests: string[],
): boolean => {
  return getStep2CategorySelectionCounts(selectedInterests).every(
    (category) =>
      category.selectedCount >= category.requiredCount &&
      category.selectedCount <= category.maxCount,
  );
};
