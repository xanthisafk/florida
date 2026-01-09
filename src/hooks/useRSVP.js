import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { saveReadingState } from '../utils/db';
import { metronome } from '../utils/audio';

/**
 * Characters that should SPLIT words
 * (not punctuation pauses)
 */
const SPLIT_CHARS_REGEX = /(--|—|–)/;

/**
 * Characters that should be STRIPPED entirely
 */
const CLEANUP_REGEX = /^[^a-zA-Z0-9]+|[^a-zA-Z0-9.?!,]+$/g;

function getFocusIndex(length) {
  if (length === 0) return 0;
  if (length === 1) return 0;
  if (length <= 5) return 1;
  if (length <= 9) return 2;
  if (length <= 13) return 3;
  return 4;
}

function preprocessWords(words = []) {
  return words.flatMap(word => {
    if (!word?.text) return [];

    let text = word.text.trim();

    if (!text || text === '-' || text === '--') return [];

    if (SPLIT_CHARS_REGEX.test(text)) {
      return text
        .split(SPLIT_CHARS_REGEX)
        .map(part => part.trim())
        .filter(part => part && part.length > 0 && !SPLIT_CHARS_REGEX.test(part))
        .map(part => ({
          ...word,
          text: part,
          focusIndex: getFocusIndex(part.length)
        }));
    }

    text = text.replace(CLEANUP_REGEX, '');

    if (!text || /^[^a-zA-Z0-9]+$/.test(text)) return [];

    return [{
      ...word,
      text,
      focusIndex: getFocusIndex(text.length)
    }];
  });
}

export function useRSVP(document, initialState, settings) {
  const words = useMemo(
    () => preprocessWords(document.words),
    [document.words]
  );

  const [currentIndex, setCurrentIndex] = useState(
    Math.min(initialState?.currentWordIndex || 0, words.length - 1)
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(initialState?.wpm || settings.reading.wpm);

  const timerRef = useRef(null);
  const lastTickRef = useRef(Date.now());
  const saveIntervalRef = useRef(null);
  const currentIndexRef = useRef(currentIndex);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Calculate interval in milliseconds
  const getInterval = useCallback(
    (wordIndex) => {
      const baseInterval = 60000 / wpm;
      const word = words[wordIndex];

      if (!word) return baseInterval;

      if (word.flags?.punctuation && settings.reading.autoPause) {
        return baseInterval * settings.reading.punctuationMultiplier;
      }

      if (word.flags?.paragraphBreak) {
        return baseInterval * 2;
      }

      return baseInterval;
    },
    [wpm, settings, words]
  );

  // Auto-save reading position
  useEffect(() => {
    if (!isPlaying) return;

    saveIntervalRef.current = setInterval(() => {
      saveReadingState({
        documentId: document.id,
        currentWordIndex: currentIndexRef.current,
        wpm,
      });
    }, 1000);

    return () => clearInterval(saveIntervalRef.current);
  }, [isPlaying, wpm, document.id]);


  // RSVP timing engine
  useEffect(() => {
    if (!isPlaying) return;

    const tick = () => {
      const now = Date.now();
      const elapsed = now - lastTickRef.current;
      const expectedInterval = getInterval(currentIndex);

      setCurrentIndex(prev => {
        const next = prev + 1;
        if (next >= words.length) {
          setIsPlaying(false);
          return prev;
        }
        return next;
      });

      lastTickRef.current = now;

      if (settings.audio?.enabled) {
        switch (settings.audio.soundType) {
          case 'beep':
            metronome.playBeep();
            break;
          case 'click':
            metronome.playTone();
            break;
          case 'pop':
            metronome.playPop();
            break;
          case 'zap':
            metronome.playZap();
            break;
          case 'powerUp':
            metronome.playPowerUp();
            break;
          case 'buzz':
            metronome.playBuzz();
            break;
          case 'chime':
            metronome.playChime();
            break;
          case 'tick':
            metronome.playTick();
            break;
        }
      }

      const nextInterval = getInterval(currentIndex + 1);
      const drift = elapsed - expectedInterval;
      timerRef.current = setTimeout(
        tick,
        Math.max(0, nextInterval - drift)
      );
    };

    lastTickRef.current = Date.now();
    timerRef.current = setTimeout(tick, getInterval(currentIndex));

    return () => clearTimeout(timerRef.current);
  }, [isPlaying, currentIndex, getInterval, words.length, settings.audio]);

  const play = useCallback(() => {
    if (currentIndex >= words.length - 1) {
      setCurrentIndex(0);
    }
    setIsPlaying(true);
  }, [currentIndex, words.length]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    saveReadingState({
      documentId: document.id,
      currentWordIndex: currentIndex,
      wpm,
    });
  }, [document.id, currentIndex, wpm]);

  const jump = useCallback(
    (amount) => {
      setCurrentIndex(prev =>
        Math.max(0, Math.min(prev + amount, words.length - 1))
      );
    },
    [words.length]
  );

  const restart = useCallback(() => {
    setCurrentIndex(0);
    setIsPlaying(false);
  }, []);

  const changeWPM = useCallback((newWPM) => {
    setWpm(Math.max(50, Math.min(1000, newWPM)));
  }, []);

  return {
    currentIndex,
    currentWord: words[currentIndex],
    isPlaying,
    wpm,
    progress: words.length ? (currentIndex / words.length) * 100 : 0,
    play,
    pause,
    jump,
    restart,
    changeWPM,
  };
}
