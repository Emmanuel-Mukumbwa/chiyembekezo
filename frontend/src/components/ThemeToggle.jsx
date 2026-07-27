import React from 'react';
import { Button } from 'react-bootstrap';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Button
      variant="outline-secondary"
      size="sm"
      onClick={toggleTheme}
      className="ms-2"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? '☀️' : '🌙'}
    </Button>
  );
};

export default ThemeToggle;
