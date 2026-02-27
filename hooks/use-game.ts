import { useCallback, useEffect, useRef, useState } from "react";
import { TextInput } from "react-native";

import { useSettings } from "@/context/settings";
import { useElements } from "@/hooks/use-elements";
import type {
  Element,
  ElementFilter,
  GameState,
  GuessMode,
  OrderMode,
  ReactionEntry,
} from "@/types/game";
import { buildPool, getCorrectAnswer, pickRandom } from "@/utils/game";

export function useGame() {
  const { autoSend } = useSettings();

  const [gameState, setGameState] = useState<GameState>("idle");
  const [guessMode, setGuessMode] = useState<GuessMode>("name");
  const [elementFilter, setElementFilter] = useState<ElementFilter>("all");
  const [orderMode, setOrderMode] = useState<OrderMode>("random");
  const [poolSize, setPoolSize] = useState(0);
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

  // Auto-correct invalid combo: guessing atomic number sorted by atomic number
  // would make answers trivially sequential (1, 2, 3 ...).
  useEffect(() => {
    if (guessMode === "atomicNumber" && orderMode === "atomicNumber") {
      setOrderMode("random");
    }
  }, [guessMode, orderMode]);

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
      const next = orderMode === "random" ? pickRandom(pool) : pool[0];
      const newRemaining =
        orderMode === "random"
          ? pool.filter(e => e.atomicNumber !== next.atomicNumber)
          : pool.slice(1);
      setRemaining(newRemaining);
      setCurrent(next);
      setInput("");
      elementStartRef.current = Date.now();
      inputRef.current?.focus();
    },
    [stopTimer, orderMode],
  );

  const { data: elements } = useElements();

  const startGame = useCallback(() => {
    if (!elements) return;
    const pool = buildPool(elements, elementFilter, orderMode, guessMode);
    const first = orderMode === "random" ? pickRandom(pool) : pool[0];
    const rest =
      orderMode === "random"
        ? pool.filter(e => e.atomicNumber !== first.atomicNumber)
        : pool.slice(1);

    setPoolSize(pool.length);
    setRemaining(rest);
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
  }, [startTimer, elementFilter, orderMode, guessMode, elements]);

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

  const goHome = useCallback(() => {
    stopTimer();
    setGameState("idle");
  }, [stopTimer]);

  return {
    gameState,
    goHome,
    guessMode,
    setGuessMode,
    elementFilter,
    setElementFilter,
    orderMode,
    setOrderMode,
    poolSize,
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
