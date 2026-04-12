import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { fetchReportsData } from '../store/slices/reportsSlice';
import Card from '../components/ui/Card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, Legend, Label 
} from 'recharts';
import { Calendar, CheckCircle, Users, TrendingUp, FolderOpen, BarChart3 } from 'lucide-react';
import { CustomTooltip } from '../components/ui/CustomChartTooltip';

const Reports = () => {
  const dispatch = useAppDispatch();
  const { data, loading } = useAppSelector((state) => state.reports);

  useEffect(() => {
    dispatch(fetchReportsData());
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
    activeProjects: 0,
    activeTasks: 0,
    completedTasks: 0,
    completedTasksThisWeek: 0,
    overdueTasks: 0,
    teamSize: 0,
  };

  const COLORS = ['#3b82f6', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6'];

  const taskStatusData = data?.taskStatusData || [];
  const taskPriorityData = (data?.taskPriorityData || []).map((d: any, i: number) => ({ ...d, fillColor: COLORS[i % COLORS.length] }));
  const projectProgressData = data?.projectProgressData || [];
  const tasksCompletedOverTime = data?.tasksCompletedOverTime || [];

  const hasData = stats.totalProjects > 0 || stats.activeTasks > 0;

  const axisStyle = {
    fontSize: 12,
    fill: '#888888',
    stroke: 'none'
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Reports & Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Insights into your projects and team performance</p>
      </div>

      {!hasData ? (
        <Card>
          <div className="text-center py-16">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No Data Available</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start creating projects and tasks to see analytics and reports here.
            </p>
          </div>
        </Card>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Projects</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.totalProjects}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stats.activeProjects} active</p>
                </div>
                <div className="p-3 bg-blue-100/50 dark:bg-blue-900/30 rounded-xl">
                  <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Tasks</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.activeTasks}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stats.completedTasks} completed</p>
                </div>
                <div className="p-3 bg-green-100/50 dark:bg-green-900/30 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Team Size</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.teamSize}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">members</p>
                </div>
                <div className="p-3 bg-purple-100/50 dark:bg-purple-900/30 rounded-xl">
                  <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Completed This Week</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.completedTasksThisWeek}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stats.overdueTasks} overdue</p>
                </div>
                <div className="p-3 bg-yellow-100/50 dark:bg-yellow-900/30 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {taskStatusData.length > 0 ? (
              <Card title="Task Status Distribution">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={taskStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={5}
                      cornerRadius={5}
                      labelLine={false}
                      dataKey="value"
                      stroke="none"
                    >
                      {taskStatusData.map((entry, index) => (
                         <Cell 
                           key={`cell-${index}`} 
                           fill={COLORS[index % COLORS.length]} 
                           className="hover:opacity-80 transition-opacity duration-300 outline-none"
                         />
                      ))}
                      <Label
                        content={({ viewBox }) => {
                          const { cx, cy } = viewBox as any;
                          const totalTasksCount = taskStatusData.reduce((acc, curr) => acc + curr.value, 0);
                          return (
                            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
                              <tspan x={cx} y={cy - 5} className="fill-gray-900 dark:fill-white font-bold" style={{ fontSize: '32px' }}>
                                {totalTasksCount}
                              </tspan>
                              <tspan x={cx} y={cy + 18} className="fill-gray-500 dark:fill-gray-400 font-medium" style={{ fontSize: '12px' }}>
                                Total Tasks
                              </tspan>
                            </text>
                          );
                        }}
                      />
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      iconType="circle" 
                      wrapperStyle={{ fontSize: '12px', color: '#888' }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            ) : (
              <Card title="Task Status Distribution">
                <div className="flex items-center justify-center h-[300px]">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 dark:text-gray-400">No task data available</p>
                  </div>
                </div>
              </Card>
            )}

            {projectProgressData.length > 0 ? (
              <Card title="Project Progress">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={projectProgressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" strokeOpacity={0.2} />
                    <XAxis 
                      dataKey="name" 
                      tickLine={false} 
                      axisLine={false} 
                      tick={axisStyle} 
                      dy={10} 
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      tickLine={false} 
                      axisLine={false} 
                      tick={axisStyle} 
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                    <Bar 
                      dataKey="progress" 
                      fill="url(#colorProgress)" 
                      radius={[4, 4, 0, 0]} 
                      name="Progress %" 
                      barSize={40}
                      animationDuration={1500}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            ) : (
              <Card title="Project Progress">
                <div className="flex items-center justify-center h-[300px]">
                  <div className="text-center">
                    <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 dark:text-gray-400">No project data available</p>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Additional Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {taskPriorityData.length > 0 ? (
              <Card title="Task Priority Distribution">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={taskPriorityData} margin={{ top: 10, right: 30, left:0, bottom: 0 }} layout="vertical">
                    <defs>
                      {COLORS.map((color, index) => (
                        <linearGradient key={`colorPriority-${index}`} id={`colorPriority-${index}`} x1="0" y1="0" x2="1" y2="0">
                          <stop offset="5%" stopColor={color} stopOpacity={0.9}/>
                          <stop offset="95%" stopColor={color} stopOpacity={0.3}/>
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" strokeOpacity={0.2} />
                    <XAxis 
                      type="number" 
                      tickLine={false} 
                      axisLine={false} 
                      tick={axisStyle} 
                      allowDecimals={false}
                    />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      tickLine={false} 
                      axisLine={false} 
                      tick={axisStyle} 
                      dx={-10}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                    <Bar 
                      dataKey="value" 
                      radius={[0, 4, 4, 0]} 
                      name="Tasks" 
                      barSize={32}
                      animationDuration={1500}
                    >
                      {taskPriorityData.map((_, index) => (
                         <Cell 
                           key={`cell-${index}`} 
                           fill={`url(#colorPriority-${index % COLORS.length})`} 
                         />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            ) : (
              <Card title="Task Priority Distribution">
                <div className="flex items-center justify-center h-[300px]">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 dark:text-gray-400">No priority data available</p>
                  </div>
                </div>
              </Card>
            )}

            {tasksCompletedOverTime.length > 0 && tasksCompletedOverTime.some((d) => d.completed > 0) ? (
              <Card title="Tasks Completed Over Time (Last 7 Days)">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={tasksCompletedOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" strokeOpacity={0.2} />
                    <XAxis 
                      dataKey="date" 
                      tickLine={false} 
                      axisLine={false} 
                      tick={axisStyle} 
                      dy={10}
                    />
                    <YAxis 
                      tickLine={false} 
                      axisLine={false} 
                      tick={axisStyle} 
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="completed" 
                      stroke="#10b981" 
                      fillOpacity={1} 
                      fill="url(#colorCompleted)" 
                      strokeWidth={3} 
                      name="Completed Tasks" 
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            ) : (
              <Card title="Tasks Completed Over Time (Last 7 Days)">
                <div className="flex items-center justify-center h-[300px]">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 dark:text-gray-400">No completion data available</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
