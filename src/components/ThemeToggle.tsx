import React from 'react';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className="mac-theme-toggle"
      onClick={toggleTheme}
      title={theme === 'light' ? '切换到深色模式' : '切换到浅色模式'}
      aria-label={theme === 'light' ? '切换到深色模式' : '切换到浅色模式'}
    >
      <div className="mac-theme-toggle-track">
        <div className={`mac-theme-toggle-thumb ${theme === 'dark' ? 'dark' : 'light'}`}>
          {theme === 'light' ? (
            <SunOutlined className="mac-theme-icon" />
          ) : (
            <MoonOutlined className="mac-theme-icon" />
          )}
        </div>
      </div>
    </button>
  );
};

export default ThemeToggle; 