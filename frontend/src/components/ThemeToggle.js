import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

/**
 * ThemeToggle — Animated toggle button for light/dark mode.
 * Place this anywhere (typically in Navbar).
 */
export default function ThemeToggle({ size = 'md' }) {
  const { toggleTheme, isDark } = useTheme();

  const sizeMap = {
    sm: { btn: 32, icon: 14 },
    md: { btn: 36, icon: 16 },
    lg: { btn: 42, icon: 20 },
  };
  const s = sizeMap[size] || sizeMap.md;

  return (
    <motion.button
      onClick={toggleTheme}
      className="theme-toggle-btn"
      whileTap={{ scale: 0.88 }}
      whileHover={{ scale: 1.08 }}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      style={{
        width: s.btn,
        height: s.btn,
        borderRadius: '50%',
        border: '1px solid var(--border)',
        background: 'var(--bg-toggle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
        boxShadow: isDark
          ? '0 0 12px rgba(168,85,247,0.15)'
          : '0 0 12px rgba(245,158,11,0.2)',
      }}
    >
      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Moon size={s.icon} color="var(--theme-toggle-icon)" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Sun size={s.icon} color="var(--theme-toggle-icon)" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
