import { useState, useEffect, useCallback, createContext, useContext } from 'react';

/* ── Theme Context ── */
const ThemeContext = createContext(undefined);

/**
 * Detects the user's system color-scheme preference.
 * Falls back to 'dark' if the API is not available.
 */
const getSystemPreference = () => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  return 'dark';
};

/**
 * Reads the persisted theme from localStorage.
 * Falls back to system preference, then 'dark'.
 */
const getInitialTheme = () => {
  try {
    const stored = localStorage.getItem('bookexchange-theme');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch { /* localStorage not available */ }
  return getSystemPreference();
};

/**
 * ThemeProvider — wraps the app and provides theme state + toggle.
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  /* Apply data-theme attribute on <html> whenever theme changes */
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem('bookexchange-theme', theme); } catch { /* noop */ }
  }, [theme]);

  /* Listen for OS-level preference changes */
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const handler = (e) => {
      // Only auto-switch if user hasn't manually picked a theme
      const stored = localStorage.getItem('bookexchange-theme');
      if (!stored) setTheme(e.matches ? 'light' : 'dark');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * useTheme — custom hook to access theme state from any component.
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default useTheme;
