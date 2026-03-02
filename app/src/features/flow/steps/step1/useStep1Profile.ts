import { useCallback, useState } from "react";
import {
  STEP1_NICKNAME_NUMBER_MAX,
  STEP1_NICKNAME_NUMBER_MIN,
  STEP1_NICKNAME_WORD_POOL,
} from "./step1.constants";

const getRandomIntInclusive = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const generateRandomNickname = (): string => {
  const wordIndex = Math.floor(Math.random() * STEP1_NICKNAME_WORD_POOL.length);
  const word = STEP1_NICKNAME_WORD_POOL[wordIndex] ?? STEP1_NICKNAME_WORD_POOL[0];
  const number = getRandomIntInclusive(
    STEP1_NICKNAME_NUMBER_MIN,
    STEP1_NICKNAME_NUMBER_MAX,
  );

  return `${word}${number}`;
};

export interface UseStep1ProfileResult {
  nickname: string;
  rerollNickname: () => string;
  ensureNickname: () => string;
}

export const useStep1Profile = (
  initialNickname?: string,
): UseStep1ProfileResult => {
  const initialValue = initialNickname?.trim() ?? "";
  const [nickname, setNickname] = useState<string>(() =>
    initialValue.length > 0 ? initialValue : generateRandomNickname(),
  );

  const rerollNickname = useCallback((): string => {
    const nextNickname = generateRandomNickname();
    setNickname(nextNickname);
    return nextNickname;
  }, []);

  const ensureNickname = useCallback((): string => {
    if (nickname.trim().length > 0) {
      return nickname;
    }

    const nextNickname = generateRandomNickname();
    setNickname(nextNickname);
    return nextNickname;
  }, [nickname]);

  return {
    nickname,
    rerollNickname,
    ensureNickname,
  };
};
