import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { fetchTasks, createTask, updateTask, deleteTask } from '../store/slices/taskSlice';
import { fetchProjects } from '../store/slices/projectSlice';
import { projectsApi } from '../api/projects';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Select from '../components/ui/Select';
import ConfirmDeleteModal from '../components/ui/ConfirmDeleteModal';
import toast from 'react-hot-toast';
import { Plus, Search, Columns, List, Calendar, Clock, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, isToday, isPast, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';

const Tasks = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { tasks, loading } = useAppSelector((state) => state.task);
  const { projects } = useAppSelector((state) => state.project);
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'calendar'>('kanban');
  const [currentDate, setCurrentDate] = useState(new Date());

  const searchQuery = searchParams.get('search') || '';
  const statusFilter = searchParams.get('status') || 'all';
  const projectFilter = searchParams.get('project') || 'all';

  const updateSearchParam = (key: string, value: string) => {
    setSearchParams((prev) => {
      if (value && value !== 'all') {
        prev.set(key, value);
      } else {
        prev.delete(key);
      }
      return prev;
    }, { replace: true });
  };
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [deleteModalState, setDeleteModalState] = useState<{isOpen: boolean, taskId: string | null}>({isOpen: false, taskId: null});
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    projectId: '',
    status: 'todo' as const,
    priority: 'medium' as const,
    dueDate: '',
    assignees: [] as string[],
  });
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchProjects({}));
    dispatch(fetchTasks({
      status: statusFilter !== 'all' ? statusFilter : undefined,
      projectId: projectFilter !== 'all' ? projectFilter : undefined,
      search: searchQuery || undefined,
    }));
  }, [dispatch, statusFilter, projectFilter, searchQuery]);

  useEffect(() => {
    const taskId = searchParams.get('task');
    if (taskId && tasks.length > 0) {
      const task = tasks.find((t) => t._id === taskId);
      if (task) {
        setSelectedTask(task);
        setIsTaskModalOpen(true);
      }
    }
  }, [searchParams, tasks]);

  const loadProjectMembers = useCallback(async (projectId: string) => {
    if (!projectId) {
      setProjectMembers([]);
      return;
    }
    setMembersLoading(true);
    try {
      const response = await projectsApi.getById(projectId);
      const project = response.data;
      if (!project) { setProjectMembers([]); return; }

      const memberMap = new Map<string, any>();
      if (project.createdBy && typeof project.createdBy === 'object') {
        const creator = project.createdBy as any;
        memberMap.set(creator._id, creator);
      }
      (project.teamMembers as any[]).forEach((m: any) => {
        if (m && typeof m === 'object') memberMap.set(m._id, m);
      });
      setProjectMembers(Array.from(memberMap.values()));
    } catch (err) {
      console.error('Failed to load project members:', err);
      setProjectMembers([]);
    } finally {
      setMembersLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjectMembers(taskForm.projectId);
  }, [taskForm.projectId, loadProjectMembers]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (taskForm.assignees.length === 0) {
      toast.error('Please select an assignee.');
      return;
    }
    try {
      await dispatch(createTask({
        ...taskForm,
        dueDate: taskForm.dueDate ? new Date(taskForm.dueDate) : undefined,
      })).unwrap();
      toast.success('Task created successfully');
      setIsCreateModalOpen(false);
      setTaskForm({
        title: '',
        description: '',
        projectId: '',
        status: 'todo',
        priority: 'medium',
        dueDate: '',
        assignees: user ? [user._id] : [],
      });
    } catch (err: any) {
      toast.error(err || 'Failed to create task');
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (taskForm.assignees.length === 0) {
      toast.error('Please select an assignee.');
      return;
    }
    if (selectedTask) {
      try {
        await dispatch(updateTask({
          id: selectedTask._id,
          data: {
            ...taskForm,
            dueDate: taskForm.dueDate ? new Date(taskForm.dueDate) : undefined,
          },
        })).unwrap();
        toast.success('Task updated successfully');
        setIsTaskModalOpen(false);
        setSelectedTask(null);
        setTaskForm({
          title: '',
          description: '',
          projectId: '',
          status: 'todo',
          priority: 'medium',
          dueDate: '',
          assignees: user ? [user._id] : [],
        });
      } catch (err: any) {
        toast.error(err || 'Failed to update task');
      }
    }
  };

  const handleDelete = (id: string) => {
    setDeleteModalState({ isOpen: true, taskId: id });
  };

  const handleDeleteConfirm = async () => {
    if (deleteModalState.taskId) {
      try {
        await dispatch(deleteTask(deleteModalState.taskId)).unwrap();
        toast.success('Task deleted successfully');
        setDeleteModalState({ isOpen: false, taskId: null });
        if (selectedTask?._id === deleteModalState.taskId) {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
        }
      } catch (err: any) {
        toast.error(err || 'Failed to delete task');
      }
    }
  };

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      projectId: typeof task.projectId === 'object' ? task.projectId._id : task.projectId || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
      assignees: (task.assignees || []).map((a: any) =>
        typeof a === 'object' ? a._id : a
      ),
    });
    setIsTaskModalOpen(true);
  };

  const kanbanColumns = [
    { id: 'todo', title: 'To Do', color: 'bg-gray-100' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-blue-100' },
    { id: 'in_review', title: 'In Review', color: 'bg-yellow-100' },
    { id: 'done', title: 'Done', color: 'bg-green-100' },
    { id: 'blocked', title: 'Blocked', color: 'bg-red-100' },
  ];

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Tasks</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">Manage and track all your tasks</p>
        </div>
        <Button onClick={() => {
          setTaskForm(prev => ({ ...prev, assignees: user ? [user._id] : [] }));
          setIsCreateModalOpen(true);
        }} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => updateSearchParam('search', e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={statusFilter}
              onChange={(e) => updateSearchParam('status', e.target.value)}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'todo', label: 'To Do' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'in_review', label: 'In Review' },
                { value: 'done', label: 'Done' },
                { value: 'blocked', label: 'Blocked' },
              ]}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={projectFilter}
              onChange={(e) => updateSearchParam('project', e.target.value)}
              options={[
                { value: 'all', label: 'All Projects' },
                ...projects.map((p) => ({ value: p._id, label: p.name })),
              ]}
            />
          </div>
          <div className="flex items-center space-x-2 border border-gray-300 dark:border-gray-600 rounded-lg p-1 bg-white dark:bg-gray-700">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded transition-colors ${viewMode === 'kanban' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
            >
              <Columns className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-2 rounded transition-colors ${viewMode === 'calendar' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
            >
              <Calendar className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Card>

      {/* Tasks View */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 overflow-x-auto">
          {kanbanColumns.map((column) => {
            const columnTasks = getTasksByStatus(column.id);
            return (
              <div key={column.id} className="space-y-3">
                <div className={`${column.color} p-3 rounded-lg`}>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{column.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{columnTasks.length} tasks</p>
                </div>
                <div className="space-y-2">
                  {columnTasks.map((task: any) => (
                    <div
                      key={task._id}
                      onClick={() => handleTaskClick(task)}
                      className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
                    >
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-2">{task.title}</h4>
                      {task.dueDate && (
                        <div className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400 mb-2">
                          <Clock className="w-3 h-3" />
                          <span>
                            {isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate))
                              ? 'Overdue'
                              : isToday(new Date(task.dueDate))
                              ? 'Today'
                              : format(new Date(task.dueDate), 'MMM d')}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <Badge variant={getPriorityColor(task.priority) as any} size="sm">
                          {(task.priority).toUpperCase()}
                        </Badge>
                        {typeof task.projectId === 'object' && task.projectId && (
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: task.projectId.color || '#3b82f6' }}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : viewMode === 'list' ? (
        <Card>
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">No tasks found</p>
              </div>
            ) : (
              tasks.map((task: any) => (
                <div
                  key={task._id}
                  onClick={() => handleTaskClick(task)}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <input
                        type="checkbox"
                        checked={task.status === 'done'}
                        onChange={(e) => {
                          e.stopPropagation();
                          dispatch(updateTask({
                            id: task._id,
                            data: { status: e.target.checked ? 'done' : 'todo' },
                          }));
                        }}
                        className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <h4 className={`font-semibold ${task.status === 'done' ? 'line-through text-gray-500 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">{task.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {task.dueDate && (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {format(new Date(task.dueDate), 'MMM d')}
                        </span>
                      )}
                      <Badge variant={getPriorityColor(task.priority) as any} size="sm">
                        {task.priority}
                      </Badge>
                      <Badge variant={task.status === 'done' ? 'success' : 'default'} size="sm">
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      ) : (
        <Card>
          <div className="space-y-4">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 min-w-[200px] text-center">
                  {format(currentDate, 'MMMM yyyy')}
                </h2>
                <button
                  onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Today
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Day Headers */}
              <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div
                    key={day}
                    className="p-3 text-center text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7">
                {(() => {
                  const monthStart = startOfMonth(currentDate);
                  const monthEnd = endOfMonth(currentDate);
                  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
                  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
                  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

                  return days.map((day) => {
                    const dayTasks = tasks.filter((task: any) => {
                      if (!task.dueDate) return false;
                      const taskDate = new Date(task.dueDate);
                      return isSameDay(taskDate, day);
                    });

                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isTodayDate = isToday(day);

                    return (
                      <div
                        key={day.toISOString()}
                        className={`min-h-[100px] border-r border-b border-gray-200 dark:border-gray-700 p-2 ${
                          !isCurrentMonth ? 'bg-gray-50 dark:bg-gray-900/50' : 'bg-white dark:bg-gray-800'
                        } ${isTodayDate ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                      >
                        <div
                          className={`text-sm font-medium mb-1 ${
                            isTodayDate
                              ? 'text-blue-600 dark:text-blue-400'
                              : isCurrentMonth
                              ? 'text-gray-900 dark:text-gray-100'
                              : 'text-gray-400 dark:text-gray-600'
                          }`}
                        >
                          {format(day, 'd')}
                        </div>
                        <div className="space-y-1">
                          {dayTasks.slice(0, 3).map((task: any) => (
                            <div
                              key={task._id}
                              onClick={() => handleTaskClick(task)}
                              className={`text-xs p-1.5 rounded cursor-pointer truncate ${
                                task.priority === 'urgent'
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                  : task.priority === 'high'
                                  ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
                                  : task.priority === 'medium'
                                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                              } hover:opacity-80 transition-opacity`}
                              title={task.title}
                            >
                              {task.title}
                            </div>
                          ))}
                          {dayTasks.length > 3 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 px-1">
                              +{dayTasks.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        </Card>
      )}

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
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
          <Textarea
            label="Description"
            value={taskForm.description}
            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
            placeholder="Enter task description"
            rows={4}
          />
          <Select
            label="Project"
            value={taskForm.projectId}
            onChange={(e) => setTaskForm({ ...taskForm, projectId: e.target.value, assignees: user ? [user._id] : [] })}
            options={[
              { value: '', label: 'Select Project' },
              ...projects.map((p) => ({ value: p._id, label: p.name })),
            ]}
          />
          {/* Assignees — fetched fresh from server when project is selected */}
          {taskForm.projectId ? (
            <div>
              {membersLoading ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assign to</label>
                  <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg">
                    <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                    Loading members...
                  </div>
                </div>
              ) : projectMembers.length === 0 ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assign to</label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    No members in this project yet. Invite team members first.
                  </p>
                </div>
              ) : (
                <Select
                  label="Assign to"
                  options={[
                    { value: '', label: 'Select Assignee' },
                    ...projectMembers.map((m: any) => ({
                      value: m._id,
                      label: `${m.name}`
                    }))
                  ]}
                  value={taskForm.assignees[0] || ''}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, assignees: e.target.value ? [e.target.value] : [] }))}
                />
              )}
            </div>
          ) : null}
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
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Task</Button>
          </div>
        </form>
      </Modal>

      {/* Task Detail Modal */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
        }}
        title={selectedTask?.title || 'Task Details'}
        size="lg"
      >
        {selectedTask && (
          <form onSubmit={handleUpdateTask} className="space-y-4">
            <Input
              label="Task Title"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              required
            />
            <Textarea
              label="Description"
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              rows={4}
            />
            <Select
              label="Project"
              value={taskForm.projectId}
              onChange={(e) => setTaskForm({ ...taskForm, projectId: e.target.value, assignees: user ? [user._id] : [] })}
              options={[
                { value: '', label: 'Select Project' },
                ...projects.map((p) => ({ value: p._id, label: p.name })),
              ]}
            />
            {/* Assignees — fetched fresh from server when project is selected */}
            {taskForm.projectId ? (
              <div>
                {membersLoading ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assign to</label>
                    <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg">
                      <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                      Loading members...
                    </div>
                  </div>
                ) : projectMembers.length === 0 ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assign to</label>
                    <p className="text-sm text-gray-500 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                      No members in this project yet. Invite team members first.
                    </p>
                  </div>
                ) : (
                  <Select
                    label="Assign to"
                    options={[
                      { value: '', label: 'Select Assignee' },
                      ...projectMembers.map((m: any) => ({
                        value: m._id,
                        label: `${m.name}`
                      }))
                    ]}
                    value={taskForm.assignees[0] || ''}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, assignees: e.target.value ? [e.target.value] : [] }))}
                  />
                )}
              </div>
            ) : null}
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
                onClick={() => {
                  if (selectedTask) {
                    handleDelete(selectedTask._id);
                    setIsTaskModalOpen(false);
                    setSelectedTask(null);
                  }
                }}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsTaskModalOpen(false);
                  setSelectedTask(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDeleteModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, taskId: null })}
        onConfirm={handleDeleteConfirm}
        itemName="this task"
      />
    </div>
  );
};

export default Tasks;

