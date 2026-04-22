import { useState, FormEvent, useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { updateProfile, changePassword, getCurrentUser } from '../store/slices/authSlice';
import { authApi } from '../api/auth';
import { useTheme } from '../contexts/ThemeContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Eye, EyeOff, User, Lock, Bell, Palette, Upload } from 'lucide-react';
import { config } from '../config/index.js';

const PreferencesTab = () => {
  const { theme, setTheme } = useTheme();
  
  const modes = [
    { id: 'light' as const, name: 'Light', icon: '☀️', description: 'Light mode' },
    { id: 'dark' as const, name: 'Dark', icon: '🌙', description: 'Dark mode' },
    { id: 'auto' as const, name: 'Auto', icon: '🔄', description: 'Match system' },
  ];

  const colors = [
    { id: 'slack' as const, name: 'Slack', preview: 'bg-gradient-to-r from-purple-600 to-purple-800' },
    { id: 'blue' as const, name: 'Blue', preview: 'bg-gradient-to-r from-blue-500 to-blue-700' },
    { id: 'green' as const, name: 'Green', preview: 'bg-gradient-to-r from-green-500 to-green-700' },
    { id: 'purple' as const, name: 'Purple', preview: 'bg-gradient-to-r from-purple-500 to-purple-700' },
    { id: 'red' as const, name: 'Red', preview: 'bg-gradient-to-r from-red-500 to-red-700' },
    { id: 'orange' as const, name: 'Orange', preview: 'bg-gradient-to-r from-orange-500 to-orange-700' },
  ];

  return (
    <Card title="Preferences">
      <div className="space-y-8">
        {/* Appearance Mode */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Appearance
          </label>
          <div className="grid grid-cols-3 gap-3">
            {modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setTheme({ mode: mode.id })}
                className={`p-4 border-2 rounded-lg transition-all text-left ${
                  theme.mode === mode.id
                    ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-900 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                }`}
              >
                <div className="text-2xl mb-2">{mode.icon}</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{mode.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{mode.description}</div>
                {theme.mode === mode.id && (
                  <div className="mt-2 text-blue-600 dark:text-blue-400 text-xs font-medium">✓ Selected</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Color Scheme */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Color Scheme
          </label>
          <div className="grid grid-cols-3 gap-3">
            {colors.map((color) => (
              <button
                key={color.id}
                onClick={() => setTheme({ color: color.id })}
                className={`relative p-4 border-2 rounded-lg transition-all ${
                  theme.color === color.id
                    ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-900'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className={`w-full h-16 rounded-lg mb-2 ${color.preview}`} />
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 text-center">
                  {color.name}
                </div>
                {theme.color === color.id && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 dark:bg-blue-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

const NotificationsTab = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [preferences, setPreferences] = useState({
    email: user?.preferences?.notifications?.email ?? true,
    inApp: user?.preferences?.notifications?.inApp ?? true,
    taskAssignments: user?.preferences?.notifications?.taskAssignments ?? true,
    taskUpdates: user?.preferences?.notifications?.taskUpdates ?? true,
    comments: user?.preferences?.notifications?.comments ?? true,
    mentions: user?.preferences?.notifications?.mentions ?? true,
    projectUpdates: user?.preferences?.notifications?.projectUpdates ?? true,
    deadlineReminders: user?.preferences?.notifications?.deadlineReminders ?? true,
  });

  useEffect(() => {
    if (user?.preferences?.notifications) {
      setPreferences({
        email: user.preferences.notifications.email ?? true,
        inApp: user.preferences.notifications.inApp ?? true,
        taskAssignments: user.preferences.notifications.taskAssignments ?? true,
        taskUpdates: user.preferences.notifications.taskUpdates ?? true,
        comments: user.preferences.notifications.comments ?? true,
        mentions: user.preferences.notifications.mentions ?? true,
        projectUpdates: user.preferences.notifications.projectUpdates ?? true,
        deadlineReminders: user.preferences.notifications.deadlineReminders ?? true,
      });
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await dispatch(updateProfile({
        preferences: {
          ...user?.preferences,
          notifications: preferences,
        },
      })).unwrap();
      setSuccess('Notification preferences saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Notification Preferences">
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-4 rounded">
            <p className="font-medium">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 text-green-700 dark:text-green-400 p-4 rounded">
            <p className="font-medium">{success}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Email Notifications</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Receive notifications via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.email}
                onChange={(e) => setPreferences({ ...preferences, email: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">In-App Notifications</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Show notifications in the app</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.inApp}
                onChange={(e) => setPreferences({ ...preferences, inApp: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Task Assignments</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Notify when tasks are assigned to you</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.taskAssignments}
                onChange={(e) => setPreferences({ ...preferences, taskAssignments: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Task Updates</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Notify when tasks are updated</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.taskUpdates}
                onChange={(e) => setPreferences({ ...preferences, taskUpdates: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Comments</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Notify when someone comments on your tasks</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.comments}
                onChange={(e) => setPreferences({ ...preferences, comments: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Mentions</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Notify when you are mentioned</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.mentions}
                onChange={(e) => setPreferences({ ...preferences, mentions: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Project Updates</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Notify when projects are updated</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.projectUpdates}
                onChange={(e) => setPreferences({ ...preferences, projectUpdates: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Deadline Reminders</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Notify about upcoming deadlines</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.deadlineReminders}
                onChange={(e) => setPreferences({ ...preferences, deadlineReminders: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} isLoading={loading}>
            Save Preferences
          </Button>
        </div>
      </div>
    </Card>
  );
};

const Settings = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  
  const [activeTab, setActiveTab] = useState<'account' | 'password' | 'notifications' | 'preferences'>('account');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!name || name.trim() === '') {
      setError('Name is required');
      setLoading(false);
      return;
    }

    if (!email || email.trim() === '') {
      setError('Email is required');
      setLoading(false);
      return;
    }

    try {
      const result = await dispatch(updateProfile({ name: name.trim(), email: email.trim() })).unwrap();
      setSuccess('Profile updated successfully');
      if (result) {
        setName(result.name || '');
        setEmail(result.email || '');
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      const errorMessage = err.payload || err.message || 'Failed to update profile';
      setError(errorMessage);
      console.error('Profile update error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword) {
      setError('Please enter your current password');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await dispatch(changePassword({ currentPassword, newPassword })).unwrap();
      setSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      const errorMessage = err.message || err.response?.data?.message || 'Failed to change password';
      setError(errorMessage);
      console.error('Password change error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      setError('File size must be less than 1MB');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only image files (JPEG, PNG, GIF) are allowed');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setAvatarLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authApi.uploadAvatar(file);
      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
        await dispatch(getCurrentUser()).unwrap();
        setSuccess('Avatar updated successfully');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error('No data received from server');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to upload avatar';
      setError(errorMessage);
      console.error('Avatar upload error:', err);
    } finally {
      setAvatarLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Palette },
  ];

  const getAvatarUrl = () => {
    if (user?.avatar) {
      if (user.avatar.startsWith('http')) {
        return user.avatar;
      }
      return `${config.get('VITE_API_URL')?.replace('/api', '')}${user.avatar}`;
    } 
    return null;
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </Card>
        </div>

        <div className="lg:col-span-3">
          {activeTab === 'account' && (
            <Card title="Account Settings">
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                {error && !success && (
                  <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-4 rounded">
                    <p className="font-medium">{error}</p>
                  </div>
                )}
                {success && (
                  <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 text-green-700 dark:text-green-400 p-4 rounded">
                    <p className="font-medium">{success}</p>
                  </div>
                )}

                <div className="flex items-center space-x-4 mb-6">
                  {getAvatarUrl() ? (
                    <img
                      src={getAvatarUrl()!}
                      alt={user?.name}
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      isLoading={avatarLoading}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {avatarLoading ? 'Uploading...' : 'Change Photo'}
                    </Button>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">JPG, GIF or PNG. 1MB max.</p>
                  </div>
                </div>

                <Input
                  label="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Enter your name"
                />

                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />

                <div className="flex justify-end pt-4">
                  <Button type="submit" isLoading={loading}>
                    Save Changes
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === 'password' && (
            <Card title="Change Password">
              <form onSubmit={handleChangePassword} className="space-y-4">
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-4 rounded">
                    <p className="font-medium">{error}</p>
                  </div>
                )}
                {success && (
                  <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 text-green-700 dark:text-green-400 p-4 rounded">
                    <p className="font-medium">{success}</p>
                  </div>
                )}

                <div className="relative">
                  <Input
                    label="Current Password"
                    type={showPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="Enter current password"
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
                    label="New Password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-9 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-9 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" isLoading={loading}>
                    Change Password
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === 'notifications' && <NotificationsTab />}

          {activeTab === 'preferences' && <PreferencesTab />}
        </div>
      </div>
    </div>
  );
};

export default Settings;
