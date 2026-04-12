import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { fetchDashboardData } from '../store/slices/dashboardSlice';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Calendar, CheckCircle, Clock, Users, AlertCircle, Plus, ArrowRight } from 'lucide-react';
import { format, isToday, isPast } from 'date-fns';

const Dashboard = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { data, loading } = useAppSelector((state) => state.dashboard);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const stats = data?.stats || {
    totalProjects: 0,
    activeTasks: 0,
    completedTasksThisWeek: 0,
    overdueTasks: 0,
    teamSize: 0,
  };

  const projects = data?.projects || [];
  const urgentTasks = data?.urgentTasks || [];
  const upcomingEvents = data?.upcomingEvents || [];
  const teamMembers = data?.teamMembers || [];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'success',
      medium: 'info',
      high: 'warning',
      urgent: 'danger',
    };
    return colors[priority as keyof typeof colors] || 'default';
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
          Welcome back, {user?.name || 'User'}!
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">Here's what's happening with your projects today</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Projects</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.totalProjects}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Tasks</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.activeTasks}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Team Members</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.teamSize}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Overdue Tasks</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.overdueTasks}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <Card title="Recent Projects" className="lg:col-span-2" action={
          <Link to="/projects">
            <Button variant="ghost" size="sm">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        }>
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">No projects yet</p>
              <Link to="/projects">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Project
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project: any) => (
                <Link
                  key={project._id}
                  to={`/projects/${project._id}`}
                  className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: project.color || '#3b82f6' }}
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">{project.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{project.description || 'No description'}</p>
                      </div>
                    </div>
                    <Badge variant={project.status === 'active' ? 'success' : 'default'}>
                      {project.status}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card title="Quick Actions">
          <div className="space-y-3">
            <Link to="/projects">
              <Button className="w-full" variant="secondary">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </Link>
            <Link to="/tasks">
              <Button className="w-full" variant="secondary">
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </Button>
            </Link>
            <Link to="/calendar">
              <Button className="w-full" variant="secondary">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Event
              </Button>
            </Link>
            <Link to="/team">
              <Button className="w-full" variant="secondary">
                <Users className="w-4 h-4 mr-2" />
                Invite Team Member
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Urgent Tasks */}
      {urgentTasks.length > 0 && (
        <Card title="Urgent Tasks">
          <div className="space-y-3">
            {urgentTasks.map((task: any) => (
              <div
                key={task._id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-red-500 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">{task.title}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      {task.dueDate && (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                        </span>
                      )}
                      <Badge variant={getPriorityColor(task.priority) as any} size="sm">
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                  {task.projectId && (
                    <div
                      className="w-3 h-3 rounded-full ml-4"
                      style={{ backgroundColor: task.projectId.color || '#3b82f6' }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <Card title="Upcoming Events">
          <div className="space-y-3">
            {upcomingEvents.map((event: any) => (
              <div
                key={event._id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">{event.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {format(new Date(event.startTime), 'MMM d, yyyy • h:mm a')}
                    </p>
                  </div>
                  <Calendar className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
