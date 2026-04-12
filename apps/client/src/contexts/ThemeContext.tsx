import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type ThemeColor = 'slack' | 'blue' | 'green' | 'purple' | 'red' | 'orange';

export interface Theme {
  mode: ThemeMode;
  color: ThemeColor;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Partial<Theme>) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const colorSchemes: Record<ThemeColor, { light: string; dark: string; primary: string; accent: string }> = {
  slack: {
    light: '#f8f9fa',
    dark: '#1a1d21',
    primary: '#4a154b',
    accent: '#350d36',
  },
  blue: {
    light: '#f0f4f8',
    dark: '#1a2332',
    primary: '#1264a3',
    accent: '#0f4c75',
  },
  green: {
    light: '#f0f7f4',
    dark: '#1a2e1f',
    primary: '#0b8043',
    accent: '#0a6b38',
  },
  purple: {
    light: '#f5f3f8',
    dark: '#241f2e',
    primary: '#611f69',
    accent: '#4a154b',
  },
  red: {
    light: '#faf5f5',
    dark: '#2e1f1f',
    primary: '#c21313',
    accent: '#9d0f0f',
  },
  orange: {
    light: '#faf7f3',
    dark: '#2e241f',
    primary: '#d97008',
    accent: '#b85d06',
  },
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { mode: 'light', color: 'slack' };
      }
    }
    return { mode: 'light', color: 'slack' };
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    if (theme.mode === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme.mode;
  });

  useEffect(() => {
    localStorage.setItem('theme', JSON.stringify(theme));
    
    let resolved: 'light' | 'dark' = theme.mode === 'auto' 
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme.mode;
    
    setResolvedTheme(resolved);

    const root = document.documentElement;
    const body = document.body;
    
    root.classList.remove('light', 'dark', 'slack', 'blue', 'green', 'purple', 'red', 'orange');
    
    root.classList.add(resolved, theme.color);
    
    const scheme = colorSchemes[theme.color];
    root.style.setProperty('--theme-bg-light', scheme.light);
    root.style.setProperty('--theme-bg-dark', scheme.dark);
    root.style.setProperty('--theme-primary', scheme.primary);
    root.style.setProperty('--theme-accent', scheme.accent);
    
    if (resolved === 'dark') {
      body.style.backgroundColor = scheme.dark;
      body.style.color = '#f3f4f6';
    } else {
      body.style.backgroundColor = scheme.light;
      body.style.color = '#111827';
    }
  }, [theme]);

  useEffect(() => {
    if (theme.mode === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        setResolvedTheme(e.matches ? 'dark' : 'light');
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme.mode]);

  const setTheme = (newTheme: Partial<Theme>) => {
    setThemeState((prev) => ({ ...prev, ...newTheme }));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
