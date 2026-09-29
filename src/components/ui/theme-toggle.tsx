'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Laptop } from 'lucide-react';
import { motion } from 'framer-motion';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-[108px] h-9 rounded-full bg-slate-900/60 dark:bg-zinc-950/60 border border-slate-800 dark:border-zinc-800" />
    );
  }

  const modes = [
    { id: 'light', icon: Sun, label: 'Light' },
    { id: 'system', icon: Laptop, label: 'System' },
    { id: 'dark', icon: Moon, label: 'Dark' },
  ] as const;

  const isActiveThemeDark = resolvedTheme === 'dark';

  return (
    <div className="relative flex items-center justify-between p-1 rounded-full border bg-white/40 dark:bg-zinc-950/40 border-zinc-200 dark:border-zinc-800 backdrop-blur-md shadow-sm h-9 w-[108px] select-none z-40">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isSelected = theme === mode.id;

        let glowClass = '';
        if (isSelected) {
          if (mode.id === 'dark') {
            glowClass = 'text-white drop-shadow-[0_0_8px_#8b5cf6]';
          } else if (mode.id === 'light') {
            glowClass = 'text-white drop-shadow-[0_0_8px_#2563eb]';
          } else {
            glowClass = 'text-white drop-shadow-[0_0_8px_#06b6d4]';
          }
        } else {
          glowClass = 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200';
        }

        return (
          <motion.button
            key={mode.id}
            type="button"
            onClick={() => setTheme(mode.id)}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-[30px] h-[30px] flex items-center justify-center rounded-full transition-colors cursor-pointer outline-none border-none bg-transparent"
            title={`${mode.label} Mode`}
          >
            {isSelected && (
              <motion.div
                layoutId="activeThemeThumb"
                className={`absolute inset-0 rounded-full -z-10 ${
                  isActiveThemeDark
                    ? 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-400 shadow-[0_0_8px_rgba(37,99,235,0.3)]'
                }`}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <Icon className={`w-[14px] h-[14px] transition-all duration-300 ${glowClass}`} />
          </motion.button>
        );
      })}
    </div>
  );
}
export default ThemeToggle;
