import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, BarChart3, Settings, LogOut, Users, FolderKanban, FileText, X } from 'lucide-react';
import { useAppDispatch } from '../../hooks/redux';
import { logout } from '../../store/slices/authSlice';
import { cn } from '../../utils/cn';
import Logo from '../Logo';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ isOpen = true, onClose }: SidebarProps) => {
  const location = useLocation();
  const dispatch = useAppDispatch();

  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/projects', icon: FolderKanban, label: 'Projects' },
    { path: '/tasks', icon: FileText, label: 'Tasks' },
    { path: '/calendar', icon: Calendar, label: 'Calendar' },
    { path: '/team', icon: Users, label: 'Team' },
    { path: '/reports', icon: BarChart3, label: 'Reports' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 dark:bg-gray-800 min-h-screen flex flex-col transition-transform duration-300 ease-in-out lg:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ backgroundColor: 'var(--theme-accent, #350d36)' }}
      >
        <div className="p-6 flex items-center justify-between">
          <Link to="/" onClick={handleLinkClick}>
            <Logo size="md" showText={true} className="text-white" />
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-300 hover:text-white p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleLinkClick}
                className={cn(
                  'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                  isActive(item.path)
                    ? 'text-white'
                    : 'text-gray-300 hover:bg-black/20 hover:text-white'
                )}
                style={isActive(item.path) ? { backgroundColor: 'var(--theme-primary, #4a154b)' } : {}}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800 space-y-1">
          <Link
            to="/settings"
            onClick={handleLinkClick}
            className={cn(
              'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
              location.pathname === '/settings'
                ? 'text-white'
                : 'text-gray-300 hover:bg-black/20 hover:text-white'
            )}
            style={location.pathname === '/settings' ? { backgroundColor: 'var(--theme-primary, #4a154b)' } : {}}
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </Link>
          <button
            onClick={() => {
              dispatch(logout());
              handleLinkClick();
            }}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 bg-gray-900 dark:bg-gray-800 min-h-screen flex-col transition-colors" style={{ backgroundColor: 'var(--theme-accent, #350d36)' }}>
        <div className="p-6">
          <Link to="/">
            <Logo size="md" showText={true} className="text-white" />
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                  isActive(item.path)
                    ? 'text-white'
                    : 'text-gray-300 hover:bg-black/20 hover:text-white'
                )}
                style={isActive(item.path) ? { backgroundColor: 'var(--theme-primary, #4a154b)' } : {}}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800 space-y-1">
          <Link
            to="/settings"
            className={cn(
              'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
              location.pathname === '/settings'
                ? 'text-white'
                : 'text-gray-300 hover:bg-black/20 hover:text-white'
            )}
            style={location.pathname === '/settings' ? { backgroundColor: 'var(--theme-primary, #4a154b)' } : {}}
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </Link>
          <button
            onClick={() => dispatch(logout())}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

