import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Palette } from 'lucide-react';
import { ThemeMode, ThemeColor } from '../contexts/ThemeContext';

const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const modes: { id: ThemeMode; name: string; icon: string }[] = [
    { id: 'light', name: 'Light', icon: '☀️' },
    { id: 'dark', name: 'Dark', icon: '🌙' },
    { id: 'auto', name: 'Auto', icon: '🔄' },
  ];

  const colors: { id: ThemeColor; name: string; preview: string }[] = [
    { id: 'slack', name: 'Slack', preview: 'bg-gradient-to-r from-purple-600 to-purple-800' },
    { id: 'blue', name: 'Blue', preview: 'bg-gradient-to-r from-blue-500 to-blue-700' },
    { id: 'green', name: 'Green', preview: 'bg-gradient-to-r from-green-500 to-green-700' },
    { id: 'purple', name: 'Purple', preview: 'bg-gradient-to-r from-purple-500 to-purple-700' },
    { id: 'red', name: 'Red', preview: 'bg-gradient-to-r from-red-500 to-red-700' },
    { id: 'orange', name: 'Orange', preview: 'bg-gradient-to-r from-orange-500 to-orange-700' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        <Palette className="w-5 h-5" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 origin-top-right bg-white dark:bg-gray-800 rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50 border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3">
            {/* Theme Mode */}
            <div className="mb-4">
              <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Appearance
              </div>
              <div className="mt-2 space-y-1">
                {modes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => {
                      setTheme({ mode: mode.id });
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      theme.mode === mode.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-base">{mode.icon}</span>
                      <span className="font-medium">{mode.name}</span>
                    </div>
                    {theme.mode === mode.id && (
                      <span className="text-blue-600 dark:text-blue-400">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-3"></div>

            {/* Theme Color */}
            <div>
              <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Color
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {colors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => {
                      setTheme({ color: color.id });
                      setIsOpen(false);
                    }}
                    className={`relative p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                      theme.color === color.id
                        ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-900'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    title={color.name}
                  >
                    <div className={`w-full h-8 rounded ${color.preview} mb-1.5`} />
                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
                      {color.name}
                    </div>
                    {theme.color === color.id && (
                      <div className="absolute top-1 right-1 w-4 h-4 bg-blue-500 dark:bg-blue-400 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;
