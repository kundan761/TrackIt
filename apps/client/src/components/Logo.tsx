import { useTheme } from '../contexts/ThemeContext';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  textColor?: 'default' | 'white';
}

const Logo = ({ size = 'md', showText = true, className = '', textColor = 'default' }: LogoProps) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const sizeClasses = {
    sm: { icon: 'w-8 h-8', text: 'text-xl' },
    md: { icon: 'w-10 h-10', text: 'text-2xl' },
    lg: { icon: 'w-12 h-12', text: 'text-3xl' },
  };

  const { icon: iconSize, text: textSize } = sizeClasses[size];
  const useWhiteText = textColor === 'white' || className.includes('text-white');

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div 
        className={`${iconSize} rounded-xl flex items-center justify-center transition-all duration-300`}
        style={{ 
          backgroundColor: 'var(--theme-primary)',
          boxShadow: `0 4px 12px -2px var(--theme-primary)`
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-2/3 h-2/3"
          style={{ color: '#ffffff' }}
        >
          <path
            d="M3 7V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V7M3 7V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V7M3 7H21M7 3V7M17 3V7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7 11H17M7 15H13"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      
      {showText && (
        <span 
          className={`font-bold ${textSize} tracking-tight ${useWhiteText ? 'text-white' : ''}`}
          style={useWhiteText ? {} : { color: isDark ? '#f3f4f6' : '#111827' }}
        >
          <span style={{ color: useWhiteText ? '#ffffff' : 'var(--theme-primary)' }}>Track</span>It
        </span>
      )}
    </div>
  );
};

export default Logo;
