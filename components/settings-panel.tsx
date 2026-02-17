"use client";

import { useState } from "react";
import { useSound } from "./providers/sound-provider";
import { useTheme, themeConfig, type ThemePalette } from "./providers/theme-provider";
import { PixelGear, PixelSound, PixelSoundOff, PixelRss } from "./pixel-icons";

export function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { soundEnabled, setSoundEnabled, playClick, playToggle } = useSound();
  const { theme, setTheme } = useTheme();

  const handleToggle = () => {
    playClick();
    setIsOpen(!isOpen);
  };

  const handleSoundToggle = () => {
    playToggle();
    setSoundEnabled(!soundEnabled);
  };

  const handleThemeChange = (newTheme: ThemePalette) => {
    playClick();
    setTheme(newTheme);
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Settings"
      >
        <PixelGear className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border p-4 z-50">
            {/* Sound Toggle */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-muted-foreground">sound</span>
              <button
                onClick={handleSoundToggle}
                className={`p-1.5 transition-colors ${
                  soundEnabled
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {soundEnabled ? (
                  <PixelSound className="w-4 h-4" />
                ) : (
                  <PixelSoundOff className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Theme Palette */}
            <div className="mb-4">
              <span className="text-xs text-muted-foreground block mb-2">
                palette
              </span>
              <div className="flex gap-2">
                {(Object.keys(themeConfig) as ThemePalette[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => handleThemeChange(key)}
                    className={`w-6 h-6 transition-all ${
                      theme === key
                        ? "ring-1 ring-foreground ring-offset-1 ring-offset-background"
                        : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: themeConfig[key].preview }}
                    title={themeConfig[key].name}
                  />
                ))}
              </div>
            </div>

            {/* RSS Link */}
            <div className="pt-3 border-t border-border/50">
              <a
                href="/rss.xml"
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => playClick()}
              >
                <PixelRss className="w-3.5 h-3.5" />
                <span>rss feed</span>
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
