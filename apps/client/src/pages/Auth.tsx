import { useState, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { loginUser, registerUser } from '../store/slices/authSlice';
import Input from '../components/ui/Input';
import Logo from '../components/Logo';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { authApi } from '../api/auth';
import toast from 'react-hot-toast';

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);
  const { resolvedTheme } = useTheme();
  
  const isSignup = location.pathname === '/signup';

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);

  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false);

  const handleSwitch = (toSignup: boolean) => {
    setIsForgotPassword(false);
    navigate(toSignup ? '/signup' : '/login', { replace: true });
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    const result = await dispatch(loginUser({ email: loginEmail, password: loginPassword }));
    if (loginUser.fulfilled.match(result)) {
      navigate('/');
    }
  };

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!loginEmail) {
      toast.error('Please enter your email address');
      return;
    }
    setIsForgotPasswordLoading(true);
    try {
      const response = await authApi.forgotPassword(loginEmail);
      toast.success(response?.message || 'Password reset link sent to your email');
      setIsForgotPassword(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setIsForgotPasswordLoading(false);
    }
  };

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    if (signupPassword !== signupConfirmPassword) {
      return;
    }
    const result = await dispatch(registerUser({ name: signupName, email: signupEmail, password: signupPassword }));
    if (registerUser.fulfilled.match(result)) {
      navigate('/');
    }
  };

  const isDark = resolvedTheme === 'dark';

  const features = [
    'Track your projects with real-time analytics',
    'Collaborate seamlessly with your team members',
    'Streamline workflow with powerful tools',
    'Enterprise-grade security for your data',
  ];

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

      <div className="w-full flex flex-col lg:flex-row min-h-screen">
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 md:p-12 lg:p-16 relative z-10 min-h-[50vh] lg:min-h-screen">
          <div className="w-full max-w-md lg:max-w-lg">
            <div className="mb-8">
              <Logo size="lg" />
            </div>

            <div className="mb-8">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight" style={{ color: isDark ? '#f3f4f6' : '#111827' }}>
                Project Management
                <br />
                <span style={{ color: 'var(--theme-primary)' }}>Made Simple</span>
              </h2>
              <p className="text-lg leading-relaxed mb-6" style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                Streamline your workflow, collaborate with your team, and achieve your goals faster with our comprehensive project management platform.
              </p>
            </div>

            <div className="space-y-4">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="flex items-start space-x-4 transition-all"
                >
                  <div 
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                    style={{ 
                      backgroundColor: 'var(--theme-primary)',
                    }}
                  >
                    <CheckCircle2 
                      className="w-6 h-6" 
                      style={{ 
                        color: '#ffffff',
                        fill: 'var(--theme-primary)',
                      }}
                      strokeWidth={2}
                    />
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-base leading-relaxed" style={{ color: isDark ? '#f3f4f6' : '#111827' }}>
                      {feature}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 md:p-12 lg:p-16 relative z-10 min-h-[50vh] lg:min-h-screen">
          <div className="w-full max-w-md mx-auto">
            <div className="flex items-center space-x-2 mb-8 p-1 rounded-xl" style={{ backgroundColor: isDark ? 'rgba(31, 41, 55, 0.5)' : 'rgba(249, 250, 251, 0.8)' }}>
              <button
                type="button"
                onClick={() => handleSwitch(false)}
                className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-300 ${
                  !isSignup 
                    ? 'text-white shadow-lg' 
                    : isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
                }`}
                style={!isSignup ? { 
                  backgroundColor: 'var(--theme-primary)',
                } : {}}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleSwitch(true)}
                className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-300 ${
                  isSignup 
                    ? 'text-white shadow-lg' 
                    : isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
                }`}
                style={isSignup ? { 
                  backgroundColor: 'var(--theme-primary)',
                } : {}}
              >
                Sign Up
              </button>
            </div>

            {!isSignup && (
              <div className="animate-fadeIn">
                <div className="mb-8">
                  <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ color: isDark ? '#f3f4f6' : '#111827' }}>
                    {isForgotPassword ? 'Reset Password' : 'Welcome Back'}
                  </h1>
                  <p className="text-lg" style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                    {isForgotPassword ? 'Enter your email to receive a reset link' : 'Sign in to continue to your account'}
                  </p>
                </div>

                <form onSubmit={isForgotPassword ? handleForgotPassword : handleLogin} className="space-y-6">
                  {error && !isSignup && (
                    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-4 rounded">
                      <p className="font-medium">{error}</p>
                    </div>
                  )}

                  <Input
                    label="Email Address"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    autoComplete="email"
                  />

                  {!isForgotPassword && (
                    <div className="relative">
                      <Input
                        label="Password"
                        type={showLoginPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        placeholder="Enter your password"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-9 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                      >
                        {showLoginPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  )}

                  {!isForgotPassword && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          id="remember-me"
                          name="remember-me"
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-offset-0"
                          style={{ accentColor: 'var(--theme-primary)' }}
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm" style={{ color: isDark ? '#d1d5db' : '#374151' }}>
                          Remember me
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsForgotPassword(true)}
                        className="text-sm font-medium transition-colors"
                        style={{ color: 'var(--theme-primary)' }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={(loading && !isSignup) || isForgotPasswordLoading}
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
                    {(loading && !isSignup) || isForgotPasswordLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 inline" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Loading...
                      </>
                    ) : (
                      isForgotPassword ? 'Send Reset Link' : 'Sign In'
                    )}
                  </button>

                  {isForgotPassword && (
                    <div className="text-center mt-4 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsForgotPassword(false)}
                        className="text-sm font-medium transition-colors hover:underline"
                        style={{ color: 'var(--theme-primary)' }}
                      >
                        Back to Login
                      </button>
                    </div>
                  )}
                </form>
              </div>
            )}

            {isSignup && (
              <div className="animate-fadeIn">
                <div className="mb-8">
                  <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ color: isDark ? '#f3f4f6' : '#111827' }}>
                    Get Started
                  </h1>
                  <p className="text-lg" style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                    Create your account to start managing projects
                  </p>
                </div>

                <form onSubmit={handleSignup} className="space-y-6">
                  {error && isSignup && (
                    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-4 rounded">
                      <p className="font-medium">{error}</p>
                    </div>
                  )}

                  <Input
                    label="Full Name"
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                    placeholder="Enter your full name"
                    autoComplete="name"
                  />

                  <Input
                    label="Email Address"
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    autoComplete="email"
                  />

                  <div className="relative">
                    <Input
                      label="Password"
                      type={showSignupPassword ? 'text' : 'password'}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                      placeholder="Create a password"
                      autoComplete="new-password"
                      error={signupPassword && signupPassword.length < 6 ? 'Password must be at least 6 characters' : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-3 top-9 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                      {showSignupPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  <div className="relative">
                    <Input
                      label="Confirm Password"
                      type={showSignupConfirmPassword ? 'text' : 'password'}
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      required
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      error={signupConfirmPassword && signupPassword !== signupConfirmPassword ? 'Passwords do not match' : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}
                      className="absolute right-3 top-9 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                      {showSignupConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading && isSignup || signupPassword !== signupConfirmPassword || signupPassword.length < 6}
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
                    {loading && isSignup ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 inline" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Loading...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
