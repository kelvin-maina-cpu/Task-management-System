import clsx from 'clsx';
import { useThemeMode } from '../theme/ThemeProvider';

export const ThemeToggle = ({ className = '' }: { className?: string }) => {
  const { theme, toggleTheme } = useThemeMode();

  return (
    <button type="button" onClick={toggleTheme} className={clsx('theme-toggle', className)}>
      <span className="theme-toggle__icon" aria-hidden="true">
        {theme === 'dark' ? '☀' : '☾'}
      </span>
      <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
    </button>
  );
};
