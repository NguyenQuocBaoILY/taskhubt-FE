import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import {
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import KanbanColumn from '../components/KanbanColumn';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import { useApp } from '../hooks/useContext';
import toast from 'react-hot-toast';

// Mock data cho tasks
const mockTasks = [
  {
    id: 1,
    title: 'Setup project structure',
    description: 'Initialize React project with Vite and setup folder structure',
    status: 'completed',
    priority: 'high',
    assignee: { id: 2, name: 'Trần Thị B', avatar: null },
    createdAt: '2024-01-16',
    updatedAt: '2024-01-20',
    dueDate: '2024-01-25',
    labels: ['Frontend', 'Setup'],
    projectId: 1,
  },
  {
    id: 2,
    title: 'Design user authentication flow',
    description: 'Create wireframes and mockups for login/register pages with best UX practices',
    status: 'completed',
    priority: 'high',
    assignee: { id: 4, name: 'Phạm Văn D', avatar: null },
    createdAt: '2024-01-17',
    updatedAt: '2024-01-22',
    dueDate: '2024-01-30',
    labels: ['Design', 'UX'],
    projectId: 1,
  },
  {
    id: 3,
    title: 'Implement user authentication API',
    description: 'Build authentication endpoints with JWT tokens, password hashing and validation',
    status: 'in-progress',
    priority: 'high',
    assignee: { id: 3, name: 'Lê Văn C', avatar: null },
    createdAt: '2024-01-20',
    updatedAt: '2024-11-10',
    dueDate: '2024-11-15',
    labels: ['Backend', 'Security'],
    projectId: 1,
  },
  {
    id: 4,
    title: 'Create product catalog UI',
    description: 'Build responsive product listing and detail pages with filters and search',
    status: 'in-progress',
    priority: 'medium',
    assignee: { id: 2, name: 'Trần Thị B', avatar: null },
    createdAt: '2024-02-01',
    updatedAt: '2024-11-08',
    dueDate: '2024-11-20',
    labels: ['Frontend', 'UI'],
    projectId: 1,
  },
  {
    id: 5,
    title: 'Setup database schema',
    description: 'Design and implement PostgreSQL database schema for products, users, orders',
    status: 'in-progress',
    priority: 'high',
    assignee: { id: 3, name: 'Lê Văn C', avatar: null },
    createdAt: '2024-02-10',
    updatedAt: '2024-11-09',
    dueDate: '2024-11-18',
    labels: ['Backend', 'Database'],
    projectId: 1,
  },
  {
    id: 6,
    title: 'Integration with payment gateway',
    description: 'Integrate Stripe/PayPal payment processing with security compliance',
    status: 'pending',
    priority: 'high',
    assignee: { id: 3, name: 'Lê Văn C', avatar: null },
    createdAt: '2024-02-15',
    updatedAt: '2024-02-15',
    dueDate: '2024-12-01',
    labels: ['Backend', 'Payment'],
    projectId: 1,
  },
  {
    id: 7,
    title: 'Mobile responsive testing',
    description: 'Test and optimize for mobile devices, tablets and different screen sizes',
    status: 'pending',
    priority: 'medium',
    assignee: { id: 4, name: 'Phạm Văn D', avatar: null },
    createdAt: '2024-03-01',
    updatedAt: '2024-03-01',
    dueDate: '2024-11-25',
    labels: ['Testing', 'Mobile'],
    projectId: 1,
  },
  {
    id: 8,
    title: 'SEO optimization',
    description: 'Implement meta tags, sitemap, structured data for better search engine ranking',
    status: 'pending',
    priority: 'low',
    assignee: { id: 2, name: 'Trần Thị B', avatar: null },
    createdAt: '2024-03-10',
    updatedAt: '2024-03-10',
    dueDate: '2024-12-10',
    labels: ['SEO', 'Marketing'],
    projectId: 1,
  },
];

const columns = [
  {
    id: 'pending',
    title: 'Chờ thực hiện',
    color: 'bg-yellow-100 border-yellow-300',
    headerColor: 'bg-yellow-50',
    count: 0,
  },
  {
    id: 'in-progress',
    title: 'Đang thực hiện',
    color: 'bg-blue-100 border-blue-300',
    headerColor: 'bg-blue-50',
    count: 0,
  },
  {
    id: 'completed',
    title: 'Hoàn thành',
    color: 'bg-green-100 border-green-300',
    headerColor: 'bg-green-50',
    count: 0,
  },
];

export default function TaskBoard() {
  const { id: projectId } = useParams();
  const { currentProject } = useApp();
  
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      // For now using mock data filtered by projectId
      // const response = await tasksAPI.getTasks({ projectId });
      // setTasks(response.data.data);
      const projectTasks = mockTasks.filter(task => task.projectId.toString() === projectId);
      setTasks(projectTasks);
    } catch {
      toast.error('Lỗi tải danh sách tasks');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  const filterTasks = useCallback(() => {
    let filtered = tasks;

    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.assignee.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (priorityFilter) {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    if (assigneeFilter) {
      filtered = filtered.filter(task => task.assignee.id.toString() === assigneeFilter);
    }

    setFilteredTasks(filtered);
  }, [tasks, searchTerm, priorityFilter, assigneeFilter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    filterTasks();
  }, [filterTasks]);

  const getTasksByStatus = (status) => {
    return filteredTasks.filter(task => task.status === status);
  };

  const getTaskCounts = () => {
    return columns.map(column => ({
      ...column,
      count: getTasksByStatus(column.id).length,
    }));
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find the active task
    const activeTask = tasks.find(task => task.id.toString() === activeId.toString());
    if (!activeTask) return;

    // Determine if we're dropping on a column or another task
    const overTask = tasks.find(task => task.id.toString() === overId.toString());
    const overColumn = columns.find(col => col.id === overId);

    if (overColumn) {
      // Dropping on a column
      if (activeTask.status !== overColumn.id) {
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === activeTask.id 
              ? { ...task, status: overColumn.id, updatedAt: new Date().toISOString().split('T')[0] }
              : task
          )
        );
        toast.success(`Task được chuyển sang ${overColumn.title}`);
      }
    } else if (overTask) {
      // Dropping on another task
      if (activeTask.status !== overTask.status) {
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === activeTask.id 
              ? { ...task, status: overTask.status, updatedAt: new Date().toISOString().split('T')[0] }
              : task
          )
        );
        toast.success(`Task được chuyển sang ${columns.find(col => col.id === overTask.status)?.title}`);
      }
    }
  };

  const handleDragEnd = (event) => {
    setActiveId(null);
    
    const { active, over } = event;
    
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeTask = tasks.find(task => task.id.toString() === activeId.toString());
    const overTask = tasks.find(task => task.id.toString() === overId.toString());
    
    // If both tasks are in the same column, reorder them
    if (activeTask && overTask && activeTask.status === overTask.status) {
      const tasksInColumn = tasks.filter(task => task.status === activeTask.status);
      const oldIndex = tasksInColumn.findIndex(task => task.id === activeTask.id);
      const newIndex = tasksInColumn.findIndex(task => task.id === overTask.id);
      
      const reorderedTasks = arrayMove(tasksInColumn, oldIndex, newIndex);
      
      // Update the tasks array with new order
      setTasks(prevTasks => {
        const otherTasks = prevTasks.filter(task => task.status !== activeTask.status);
        return [...otherTasks, ...reorderedTasks];
      });
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      // const response = await tasksAPI.createTask({ ...taskData, projectId });
      // setTasks([response.data.data, ...tasks]);
      const newTask = {
        id: Date.now(),
        ...taskData,
        assignee: currentProject?.members.find(m => m.id === taskData.assigneeId),
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        labels: [],
        projectId: parseInt(projectId),
      };
      setTasks([...tasks, newTask]);
      toast.success('Tạo task thành công!');
      setShowTaskModal(false);
    } catch {
      toast.error('Lỗi tạo task');
    }
  };

  const uniqueAssignees = [...new Map(tasks.map(task => [task.assignee.id, task.assignee])).values()];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to={`/projects/${projectId}`}
              className="text-gray-400 hover:text-gray-600"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {currentProject?.name || 'Task Board'}
              </h1>
              <p className="text-sm text-gray-500">
                {currentProject?.key} • {filteredTasks.length} tasks
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowTaskModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Tạo task
          </button>
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="">Tất cả mức độ</option>
              <option value="high">Cao</option>
              <option value="medium">Trung bình</option>
              <option value="low">Thấp</option>
            </select>
          </div>

          {/* Assignee Filter */}
          <div>
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="">Tất cả người phụ trách</option>
              {uniqueAssignees.map((assignee) => (
                <option key={assignee.id} value={assignee.id}>
                  {assignee.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="h-full flex gap-6 p-6 overflow-x-auto">
            {getTaskCounts().map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={getTasksByStatus(column.id)}
              />
            ))}
          </div>

          <DragOverlay>
            {activeId ? (
              <TaskCard
                task={tasks.find(task => task.id.toString() === activeId.toString())}
                isOverlay
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSubmit={handleCreateTask}
        project={currentProject}
      />
    </div>
  );
}