export type SummaryOption = {
  value: string;
  text: string;
  imageUrl: string;
  imageAlt: string;
};

export const STEP9_SUMMARY_OPTIONS: SummaryOption[] = [
  {
    value: "1",
    text: "우리 반은 생각보다\n다양하고 재밌을 것 같다.",
    imageAlt: "Group of diverse friends laughing together outdoors",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC7_Wood2YMa-D_8kyt_jvBZCXli4hVkqQfZhrv0EIiwpi1PbwKn0xfS4doG4Ol09fgOByZmdBJk-_zekMPt7rrn1ywHEaRoQw9RdaGYyUEi8DSMq4ETAAVHYvooaJvNPoZx1YE2cED072knnfM7bj2xYyfPXpv1DqszSUOQbKUF5sy3DvGJ5OJCeuysYLu8mJ82jxj5NlkSrbP58Tup20PwGXGuaJIHBGyXNDz8YVk4fCUH3VgGWKjXP9ypvM31UuBqzz38D7WtTw",
  },
  {
    value: "2",
    text: "처음은 어색하지만\n공통점만으로 대화는 시작된다.",
    imageAlt: "Two people talking intimately in a cozy cafe setting",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDFb6drhCd7AOx2Po2JQ89JQKi1ZK_SWaLqQwDMIcqUd2plFip80SwFFVebdEM4PwqhZjuxp0NKsnwm9_GgoaDgcntlFhjpGnFrci4h_X7Rd8h3Dp_UVjmwo5P6Z3rsp9FwGkcIIpW6vGXxxuhceG-QiwaiAIJNl9d5nBzMgtX45xqST0IHbIExVLNFPt_Am1bZdnhslpuB9cZ5VH4Te6EwSAbNsPdwixS2bVYhiRLEXWL0Bhwnmws0dUQh9h2uPBTVDDyxOA5Ta3A",
  },
  {
    value: "3",
    text: "완벽할 필요 없이\n한 번 더 인사하면 충분하다.",
    imageAlt: "A warm friendly handshake or greeting gesture",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAuSPLYYTBZvOIm_nYb8yPawHoOGrPKdlw_lOXytPRWkJpPvxtLhGsX66mg6TaiLWXQ3Jan83sxOr5xxeV7WnfkpAisMw3m1umiKGReNiuDZSc3slB72mCcM62TPfyxqB7y-iWHlilF6H9EEIx7YtLfEwNJfYN3KramQyb9D09nNAK364VgP6UM94GVOr3lLu7MfNX_07csNFZCPa03ASCDpdtdJgc1TDdGvn6kduotlEdEx0ZzAp9oHPiBOKx1_ZPqRuhVY35_qLQ",
  },
];

export const STEP9_DEFAULT_SUMMARY_VALUE = "3";
