import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first, then system preference
    const savedTheme = localStorage.getItem('memreport-theme') as Theme;
    if (savedTheme) {
      return savedTheme;
    }

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  });

  useEffect(() => {
    // Apply theme to document immediately
    const root = document.documentElement;

    // Disable transitions temporarily during theme switch
    root.style.transitionDuration = '0ms';

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Force reflow before re-enabling transitions
    root.offsetHeight;

    // Re-enable transitions after a frame
    requestAnimationFrame(() => {
      root.style.transitionDuration = '';
    });

    // Save to localStorage
    localStorage.setItem('memreport-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    // Add switching class to disable transitions
    document.documentElement.classList.add('theme-switching');

    setTheme(prev => prev === 'light' ? 'dark' : 'light');

    // Remove switching class after animation frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.documentElement.classList.remove('theme-switching');
      });
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}