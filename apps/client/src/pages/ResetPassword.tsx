import { useState, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authApi } from '../api/auth';
import Input from '../components/ui/Input';
import Logo from '../components/Logo';
import { Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const isDark = resolvedTheme === 'dark';

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (!token) {
      toast.error('Invalid or missing reset token');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      toast.success('Password reset successfully. You can now login.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex overflow-hidden relative" style={{ backgroundColor: isDark ? 'var(--theme-bg-dark)' : 'var(--theme-bg-light)' }}>
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div 
          className="absolute top-1/4 -left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 dark:opacity-10 transition-opacity duration-700"
          style={{ backgroundColor: 'var(--theme-primary)' }}
        />
        <div 
          className="absolute bottom-1/4 -right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 dark:opacity-10 transition-opacity duration-700"
          style={{ backgroundColor: 'var(--theme-primary)' }}
        />
      </div>

      <div className="w-full flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-6">
              <Logo size="lg" />
            </div>
            <h1 className="text-3xl font-bold mb-3" style={{ color: isDark ? '#f3f4f6' : '#111827' }}>
              Create New Password
            </h1>
            <p className="text-base" style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
              Please enter your new password below
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="relative">
              <Input
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter new password"
                autoComplete="new-password"
                error={password && password.length < 6 ? 'Password must be at least 6 characters' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm new password"
                autoComplete="new-password"
                error={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-9 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || password !== confirmPassword || password.length < 6}
              className="w-full px-4 py-2 rounded-lg font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: 'var(--theme-primary)',
              }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = 'var(--theme-accent)';
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = 'var(--theme-primary)';
                }
              }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 inline" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
            
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm font-medium transition-colors hover:underline"
                style={{ color: 'var(--theme-primary)' }}
              >
                Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
