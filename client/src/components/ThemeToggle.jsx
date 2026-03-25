import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

export default function ThemeToggle() {
  const { isDark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="w-9 h-9 rounded-xl flex items-center justify-center
                 bg-dark-card dark:bg-dark-card border border-dark-border dark:border-dark-border
                 hover:border-brand-orange/50 hover:text-brand-orange
                 text-gray-400 transition-all duration-200 active:scale-90"
    >
      {isDark
        ? <Sun  size={16} className="text-brand-yellow" />
        : <Moon size={16} className="text-gray-500" />
      }
    </button>
  );
}
