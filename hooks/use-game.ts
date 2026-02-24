import { useCallback, useEffect, useRef, useState } from "react";
import { TextInput } from "react-native";

import { useSettings } from "@/context/settings";
import data from "@/data.json";
import type {
  Element,
  GameState,
  GuessMode,
  ReactionEntry,
} from "@/types/game";
import { getCorrectAnswer, pickRandom } from "@/utils/game";

export function useGame() {
  const { autoSend } = useSettings();

  const [gameState, setGameState] = useState<GameState>("idle");
  const [guessMode, setGuessMode] = useState<GuessMode>("name");
  const [remaining, setRemaining] = useState<Element[]>([]);
  const [current, setCurrent] = useState<Element | null>(null);
  const [score, setScore] = useState(0);
  const [skipCount, setSkipCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [input, setInput] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [lastReactionMs, setLastReactionMs] = useState<number | null>(null);
  const [reactionKey, setReactionKey] = useState(0);
  const [finalReactionTimes, setFinalReactionTimes] = useState<ReactionEntry[]>(
    [],
  );

  const inputRef = useRef<TextInput>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elementStartRef = useRef(0);
  const reactionTimesRef = useRef<ReactionEntry[]>([]);

  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current);
    },
    [],
  );

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    const start = Date.now();
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed(Date.now() - start), 20);
  }, [stopTimer]);

  const showReaction = useCallback((ms: number) => {
    setLastReactionMs(ms);
    setReactionKey(k => k + 1);
  }, []);

  const advanceToNext = useCallback(
    (pool: Element[]) => {
      if (pool.length === 0) {
        stopTimer();
        setFinalReactionTimes([...reactionTimesRef.current]);
        setGameState("finished");
        return;
      }
      const next = pickRandom(pool);
      setRemaining(pool.filter(e => e.atomicNumber !== next.atomicNumber));
      setCurrent(next);
      setInput("");
      elementStartRef.current = Date.now();
      inputRef.current?.focus();
    },
    [stopTimer],
  );

  const startGame = useCallback(() => {
    const pool = [...data.elements];
    const first = pickRandom(pool);
    setRemaining(pool.filter(e => e.atomicNumber !== first.atomicNumber));
    setCurrent(first);
    setScore(0);
    setSkipCount(0);
    setErrorCount(0);
    setInput("");
    reactionTimesRef.current = [];
    elementStartRef.current = Date.now();
    setGameState("playing");
    startTimer();
    setTimeout(() => inputRef.current?.focus(), 150);
  }, [startTimer]);

  const handleSubmit = useCallback(() => {
    if (!current) return;
    const answer = input.trim().toLowerCase();
    const correct = getCorrectAnswer(current, guessMode);
    if (answer === correct) {
      const ms = Date.now() - elementStartRef.current;
      reactionTimesRef.current.push({
        atomicNumber: current.atomicNumber,
        ms,
        skipped: false,
      });
      showReaction(ms);
      setScore(s => s + 1);
      advanceToNext(remaining);
    } else {
      setErrorCount(e => e + 1);
      setInput("");
      inputRef.current?.focus();
    }
  }, [current, input, guessMode, remaining, advanceToNext, showReaction]);

  const handleSkip = useCallback(() => {
    if (!current) return;
    const ms = Date.now() - elementStartRef.current;
    reactionTimesRef.current.push({
      atomicNumber: current.atomicNumber,
      ms,
      skipped: true,
    });
    showReaction(ms);
    setSkipCount(s => s + 1);
    advanceToNext(remaining);
  }, [current, remaining, advanceToNext, showReaction]);

  const handleChangeText = useCallback(
    (text: string) => {
      setInput(text);
      if (autoSend && current) {
        const answer = text.trim().toLowerCase();
        const correct = getCorrectAnswer(current, guessMode);
        if (answer === correct) {
          const ms = Date.now() - elementStartRef.current;
          reactionTimesRef.current.push({
            atomicNumber: current.atomicNumber,
            ms,
            skipped: false,
          });
          showReaction(ms);
          setScore(s => s + 1);
          advanceToNext(remaining);
        }
      }
    },
    [autoSend, guessMode, current, remaining, advanceToNext, showReaction],
  );

  return {
    gameState,
    guessMode,
    setGuessMode,
    current,
    score,
    skipCount,
    errorCount,
    input,
    elapsed,
    lastReactionMs,
    setLastReactionMs,
    reactionKey,
    finalReactionTimes,
    inputRef,
    startGame,
    handleSubmit,
    handleSkip,
    handleChangeText,
  };
}
