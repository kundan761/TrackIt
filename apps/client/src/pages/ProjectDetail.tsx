import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { fetchProject, removeTeamMemberFromProject } from '../store/slices/projectSlice';
import { fetchTasks, createTask } from '../store/slices/taskSlice';
import { teamApi } from '../api/team';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import ConfirmDeleteModal from '../components/ui/ConfirmDeleteModal';
import toast from 'react-hot-toast';
import { Plus, Users, FileText, Calendar, ArrowLeft, X } from 'lucide-react';
import { format } from 'date-fns';
import Select from '../components/ui/Select';

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { currentProject, loading } = useAppSelector((state) => state.project);
  const { tasks } = useAppSelector((state) => state.task);
  const { user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'team' | 'files' | 'timeline'>('overview');
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [deleteModalState, setDeleteModalState] = useState<{isOpen: boolean, memberId: string | null}>({isOpen: false, memberId: null});
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState<'admin' | 'manager' | 'member' | 'viewer'>('member');
  const [isInviteLoading, setIsInviteLoading] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'todo' as const,
    priority: 'medium' as const,
    dueDate: '',
    assignees: user ? [user._id] : [] as string[],
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
      setIsInviteLoading(true);
      try {
        await teamApi.inviteMember({
          email: memberEmail,
          role: memberRole,
          projectId: id,
        });
        toast.success('Invitation sent successfully');
        setIsAddMemberModalOpen(false);
        setMemberEmail('');
        setMemberRole('member');
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to send invitation');
      } finally {
        setIsInviteLoading(false);
      }
    }
  };

  const handleRemoveMemberConfirm = async () => {
    if (id && deleteModalState.memberId) {
      try {
        await dispatch(removeTeamMemberFromProject({ id, userId: deleteModalState.memberId })).unwrap();
        toast.success('Team member removed successfully');
        setDeleteModalState({ isOpen: false, memberId: null });
      } catch (err: any) {
        toast.error(err || 'Failed to remove team member');
      }
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (taskForm.assignees.length === 0) {
      toast.error('Please select an assignee.');
      return;
    }
    if (id) {
      try {
        await dispatch(createTask({
          ...taskForm,
          projectId: id,
          dueDate: taskForm.dueDate ? new Date(taskForm.dueDate) : undefined,
        })).unwrap();
        toast.success('Task created successfully');
        setIsCreateTaskModalOpen(false);
        setTaskForm({
          title: '',
          description: '',
          status: 'todo',
          priority: 'medium',
          dueDate: '',
          assignees: user ? [user._id] : [],
        });
      } catch (err: any) {
        toast.error(err || 'Failed to create task');
      }
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
  
  const teamMembers = currentProject.teamMembers ? [...currentProject.teamMembers] : [];
  if (currentProject.createdBy) {
    const creatorId = typeof currentProject.createdBy === 'object' ? (currentProject.createdBy as any)._id : currentProject.createdBy;
    if (!teamMembers.some((m: any) => (m._id || m) === creatorId)) {
      teamMembers.unshift(currentProject.createdBy);
    }
  }

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
      <div className="flex items-center justify-between space-x-4">
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
        <Link to="/projects">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
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
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg text-center relative group"
                  >
                    {typeof member === 'object' && member._id && (
                      <button
                        onClick={() => setDeleteModalState({ isOpen: true, memberId: member._id })}
                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove member"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
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
          <Select
            label="Role"
            value={memberRole}
            onChange={(e) => setMemberRole(e.target.value as any)}
            options={[
              { value: 'member', label: 'Member' },
              { value: 'manager', label: 'Manager' },
              { value: 'admin', label: 'Admin' },
              { value: 'viewer', label: 'Viewer' },
            ]}
          />
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-300">
            <span>
              When accepted, this person will automatically be added to <strong>{currentProject?.name}</strong>.
            </span>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsAddMemberModalOpen(false);
                setMemberEmail('');
                setMemberRole('member');
              }}
              disabled={isInviteLoading}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isInviteLoading}>Send Invitation</Button>
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
          <Select
            label="Assign to"
            options={[
              { value: '', label: 'Select Assignee' },
              ...teamMembers.map((m: any) => ({
                value: m._id,
                label: `${m.name}`
              }))
            ]}
            value={taskForm.assignees[0] || ''}
            onChange={(e) => setTaskForm(prev => ({ ...prev, assignees: e.target.value ? [e.target.value] : [] }))}
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

      <ConfirmDeleteModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, memberId: null })}
        onConfirm={handleRemoveMemberConfirm}
        itemName="this team member from the project"
      />
    </div>
  );
};

export default ProjectDetail;

