// components/ThemeToggler.tsx
'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function ThemeToggler() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="flex gap-2 items-center">
      <Button
        size="icon"
        variant={theme === 'light' ? 'default' : 'ghost'}
        onClick={() => setTheme('light')}
      >
        <Sun className="w-5 h-5" />
      </Button>
      <Button
        size="icon"
        variant={theme === 'dark' ? 'default' : 'ghost'}
        onClick={() => setTheme('dark')}
      >
        <Moon className="w-5 h-5" />
      </Button>
      <Button
        size="icon"
        variant={theme === 'system' ? 'default' : 'ghost'}
        onClick={() => setTheme('system')}
      >
        <Laptop className="w-5 h-5" />
      </Button>
    </div>
  );
}