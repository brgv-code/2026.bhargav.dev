"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

interface SoundContextType {
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  playClick: () => void;
  playSuccess: () => void;
  playToggle: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

function createOscillatorSound(
  frequency: number,
  duration: number,
  type: OscillatorType = "square"
) {
  if (typeof window === "undefined") return;

  const audioContext = new (
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext
  )();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = type;

  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + duration
  );

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
}

export function SoundProvider({ children }: { children: ReactNode }) {
  const [soundEnabled, setSoundEnabled] = useState(false);

  // TODO: improve this in future
  useEffect(() => {
    const stored = localStorage.getItem("soundEnabled");
    if (stored !== null) {
      setSoundEnabled(stored === "true");
    }
  }, []);

  // Save preference
  useEffect(() => {
    localStorage.setItem("soundEnabled", String(soundEnabled));
  }, [soundEnabled]);

  const playClick = useCallback(() => {
    if (!soundEnabled) return;
    createOscillatorSound(800, 0.05, "square");
  }, [soundEnabled]);

  const playSuccess = useCallback(() => {
    if (!soundEnabled) return;
    createOscillatorSound(523, 0.08, "square");
    setTimeout(() => createOscillatorSound(659, 0.08, "square"), 80);
    setTimeout(() => createOscillatorSound(784, 0.1, "square"), 160);
  }, [soundEnabled]);

  const playToggle = useCallback(() => {
    if (!soundEnabled) return;
    createOscillatorSound(440, 0.04, "square");
  }, [soundEnabled]);

  return (
    <SoundContext.Provider
      value={{
        soundEnabled,
        setSoundEnabled,
        playClick,
        playSuccess,
        playToggle,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error("useSound must be used within a SoundProvider");
  }
  return context;
}
