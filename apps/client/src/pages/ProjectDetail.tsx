import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { fetchProject, updateProject, addTeamMemberToProject } from '../store/slices/projectSlice';
import { fetchTasks, createTask } from '../store/slices/taskSlice';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { Plus, Users, FileText, Calendar, Settings, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { currentProject, loading } = useAppSelector((state) => state.project);
  const { tasks } = useAppSelector((state) => state.task);
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'team' | 'files' | 'timeline'>('overview');
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'todo' as const,
    priority: 'medium' as const,
    dueDate: '',
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchProject(id));
      dispatch(fetchTasks({ projectId: id }));
    }
  }, [id, dispatch]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (id) {
      await dispatch(addTeamMemberToProject({ id, email: memberEmail }));
      setIsAddMemberModalOpen(false);
      setMemberEmail('');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (id) {
      await dispatch(createTask({
        ...taskForm,
        projectId: id,
        dueDate: taskForm.dueDate ? new Date(taskForm.dueDate) : undefined,
      }));
      setIsCreateTaskModalOpen(false);
      setTaskForm({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        dueDate: '',
      });
    }
  };

  if (loading || !currentProject) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const projectTasks = tasks.filter((task) => task.projectId === id || (typeof task.projectId === 'object' && task.projectId._id === id));
  const teamMembers = currentProject.teamMembers || [];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'tasks', label: 'Tasks', icon: FileText },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'files', label: 'Files', icon: FileText },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link to="/projects">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: currentProject.color || '#3b82f6' }}
            />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{currentProject.name}</h1>
            <Badge variant={currentProject.status === 'active' ? 'success' : 'default'}>
              {currentProject.status}
            </Badge>
          </div>
          {currentProject.description && (
            <p className="text-gray-600 dark:text-gray-400 mt-2">{currentProject.description}</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Project Information">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</label>
                  <div className="mt-1">
                    <Badge variant={currentProject.status === 'active' ? 'success' : 'default'}>
                      {currentProject.status}
                    </Badge>
                  </div>
                </div>
                {currentProject.startDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Start Date</label>
                    <p className="mt-1 text-gray-900 dark:text-gray-100">
                      {format(new Date(currentProject.startDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                )}
                {currentProject.endDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">End Date</label>
                    <p className="mt-1 text-gray-900 dark:text-gray-100">
                      {format(new Date(currentProject.endDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            <Card title="Quick Stats">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{projectTasks.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Team Members</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{teamMembers.length}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'tasks' && (
          <Card
            title="Tasks"
            action={
              <Button size="sm" onClick={() => setIsCreateTaskModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </Button>
            }
          >
            {projectTasks.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">No tasks yet</p>
                <Button onClick={() => setIsCreateTaskModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Task
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {projectTasks.map((task: any) => (
                  <Link
                    key={task._id}
                    to={`/tasks?task=${task._id}`}
                    className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">{task.title}</h4>
                        {task.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{task.description}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Badge variant={task.priority === 'urgent' ? 'danger' : task.priority === 'high' ? 'warning' : 'info'} size="sm">
                          {task.priority}
                        </Badge>
                        <Badge variant={task.status === 'done' ? 'success' : 'default'} size="sm">
                          {task.status}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        )}

        {activeTab === 'team' && (
          <Card
            title="Team Members"
            action={
              <Button size="sm" onClick={() => setIsAddMemberModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            }
          >
            {teamMembers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">No team members yet</p>
                <Button onClick={() => setIsAddMemberModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Team Member
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamMembers.map((member: any) => (
                  <div
                    key={member._id || member}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg text-center"
                  >
                    <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-semibold text-xl">
                      {typeof member === 'object' && member.name
                        ? member.name.charAt(0).toUpperCase()
                        : 'U'}
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                      {typeof member === 'object' ? member.name : 'Unknown'}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {typeof member === 'object' ? member.email : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {activeTab === 'files' && (
          <Card title="Files">
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">File management coming soon</p>
            </div>
          </Card>
        )}

        {activeTab === 'timeline' && (
          <Card title="Timeline">
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Timeline view coming soon</p>
            </div>
          </Card>
        )}
      </div>

      {/* Add Member Modal */}
      <Modal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        title="Add Team Member"
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            value={memberEmail}
            onChange={(e) => setMemberEmail(e.target.value)}
            required
            placeholder="Enter member's email"
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsAddMemberModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Add Member</Button>
          </div>
        </form>
      </Modal>

      {/* Create Task Modal */}
      <Modal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        title="Create Task"
        size="lg"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input
            label="Task Title"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            required
            placeholder="Enter task title"
          />
          <Input
            label="Description"
            value={taskForm.description}
            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
            placeholder="Enter task description"
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Status"
              value={taskForm.status}
              onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value as any })}
              options={[
                { value: 'todo', label: 'To Do' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'in_review', label: 'In Review' },
                { value: 'done', label: 'Done' },
                { value: 'blocked', label: 'Blocked' },
              ]}
            />
            <Select
              label="Priority"
              value={taskForm.priority}
              onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as any })}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'urgent', label: 'Urgent' },
              ]}
            />
          </div>
          <Input
            label="Due Date"
            type="date"
            value={taskForm.dueDate}
            onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsCreateTaskModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Task</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectDetail;

