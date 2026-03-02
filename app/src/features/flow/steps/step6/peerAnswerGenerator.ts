export type PeerDraft = {
  peerNickname: string;
  peerAnswerMain: string;
  peerAnswerSub: string;
};

const hasKeyword = (items: string[], pattern: RegExp): boolean =>
  items.some((item) => pattern.test(item));

export const generatePeerDraft = (interests: string[] | undefined): PeerDraft => {
  const normalizedInterests = (interests ?? []).map((interest) => interest.trim());
  const number = Math.floor(Math.random() * 90) + 10;
  const peerNickname = `A${number}`;

  if (hasKeyword(normalizedInterests, /축구|농구|운동|수영/)) {
    return {
      peerNickname,
      peerAnswerMain: '"축구 하이라이트 모음"',
      peerAnswerSub: "경기 영상을 보면 에너지가 생겨요",
    };
  }

  if (hasKeyword(normalizedInterests, /게임/)) {
    return {
      peerNickname,
      peerAnswerMain: '"요즘 인기 게임 스트리밍"',
      peerAnswerSub: "친구랑 같이 보면 더 재밌어요",
    };
  }

  if (hasKeyword(normalizedInterests, /음악|케이팝/)) {
    return {
      peerNickname,
      peerAnswerMain: '"좋아하는 가수의 라이브 영상"',
      peerAnswerSub: "가사가 공감돼서 자주 들어요",
    };
  }

  return {
    peerNickname,
    peerAnswerMain: '"최근 재미있게 본 드라마 1편"',
    peerAnswerSub: "캐릭터가 매력적이라 몰입해서 봤어요",
  };
};
