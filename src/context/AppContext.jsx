import { createContext, useReducer } from 'react';

// Initial state
const initialState = {
  currentProject: null,
  projects: [],
  tasks: [],
  selectedTask: null,
  isLoading: false,
  error: null,
  filters: {
    status: '',
    assignee: '',
    search: '',
  },
};

// Action types
const APP_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // Projects
  SET_PROJECTS: 'SET_PROJECTS',
  ADD_PROJECT: 'ADD_PROJECT',
  UPDATE_PROJECT: 'UPDATE_PROJECT',
  DELETE_PROJECT: 'DELETE_PROJECT',
  SET_CURRENT_PROJECT: 'SET_CURRENT_PROJECT',
  
  // Tasks
  SET_TASKS: 'SET_TASKS',
  ADD_TASK: 'ADD_TASK',
  UPDATE_TASK: 'UPDATE_TASK',
  DELETE_TASK: 'DELETE_TASK',
  SET_SELECTED_TASK: 'SET_SELECTED_TASK',
  
  // Filters
  SET_FILTERS: 'SET_FILTERS',
  CLEAR_FILTERS: 'CLEAR_FILTERS',
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case APP_ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };
    
    case APP_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };
    
    case APP_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    
    // Projects
    case APP_ACTIONS.SET_PROJECTS:
      return { ...state, projects: action.payload };
    
    case APP_ACTIONS.ADD_PROJECT:
      return { ...state, projects: [action.payload, ...state.projects] };
    
    case APP_ACTIONS.UPDATE_PROJECT:
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.id ? action.payload : project
        ),
        currentProject: state.currentProject?.id === action.payload.id 
          ? action.payload 
          : state.currentProject,
      };
    
    case APP_ACTIONS.DELETE_PROJECT:
      return {
        ...state,
        projects: state.projects.filter(project => project.id !== action.payload),
        currentProject: state.currentProject?.id === action.payload 
          ? null 
          : state.currentProject,
      };
    
    case APP_ACTIONS.SET_CURRENT_PROJECT:
      return { ...state, currentProject: action.payload };
    
    // Tasks
    case APP_ACTIONS.SET_TASKS:
      return { ...state, tasks: action.payload };
    
    case APP_ACTIONS.ADD_TASK:
      return { ...state, tasks: [action.payload, ...state.tasks] };
    
    case APP_ACTIONS.UPDATE_TASK:
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        ),
        selectedTask: state.selectedTask?.id === action.payload.id 
          ? action.payload 
          : state.selectedTask,
      };
    
    case APP_ACTIONS.DELETE_TASK:
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
        selectedTask: state.selectedTask?.id === action.payload 
          ? null 
          : state.selectedTask,
      };
    
    case APP_ACTIONS.SET_SELECTED_TASK:
      return { ...state, selectedTask: action.payload };
    
    // Filters
    case APP_ACTIONS.SET_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };
    
    case APP_ACTIONS.CLEAR_FILTERS:
      return {
        ...state,
        filters: { status: '', assignee: '', search: '' },
      };
    
    default:
      return state;
  }
}

// Create context
const AppContext = createContext(null);

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Helper functions
  const setLoading = (loading) => {
    dispatch({ type: APP_ACTIONS.SET_LOADING, payload: loading });
  };

  const setError = (error) => {
    dispatch({ type: APP_ACTIONS.SET_ERROR, payload: error });
  };

  const clearError = () => {
    dispatch({ type: APP_ACTIONS.CLEAR_ERROR });
  };

  // Project actions
  const setProjects = (projects) => {
    dispatch({ type: APP_ACTIONS.SET_PROJECTS, payload: projects });
  };

  const addProject = (project) => {
    dispatch({ type: APP_ACTIONS.ADD_PROJECT, payload: project });
  };

  const updateProject = (project) => {
    dispatch({ type: APP_ACTIONS.UPDATE_PROJECT, payload: project });
  };

  const deleteProject = (projectId) => {
    dispatch({ type: APP_ACTIONS.DELETE_PROJECT, payload: projectId });
  };

  const setCurrentProject = (project) => {
    dispatch({ type: APP_ACTIONS.SET_CURRENT_PROJECT, payload: project });
  };

  // Task actions
  const setTasks = (tasks) => {
    dispatch({ type: APP_ACTIONS.SET_TASKS, payload: tasks });
  };

  const addTask = (task) => {
    dispatch({ type: APP_ACTIONS.ADD_TASK, payload: task });
  };

  const updateTask = (task) => {
    dispatch({ type: APP_ACTIONS.UPDATE_TASK, payload: task });
  };

  const deleteTask = (taskId) => {
    dispatch({ type: APP_ACTIONS.DELETE_TASK, payload: taskId });
  };

  const setSelectedTask = (task) => {
    dispatch({ type: APP_ACTIONS.SET_SELECTED_TASK, payload: task });
  };

  // Filter actions
  const setFilters = (filters) => {
    dispatch({ type: APP_ACTIONS.SET_FILTERS, payload: filters });
  };

  const clearFilters = () => {
    dispatch({ type: APP_ACTIONS.CLEAR_FILTERS });
  };

  // Computed values
  const filteredTasks = state.tasks.filter(task => {
    const { status, assignee, search } = state.filters;
    
    if (status && task.status !== status) return false;
    if (assignee && task.assignee_id !== assignee) return false;
    if (search) {
      const searchLower = search.toLowerCase();
      if (!task.title.toLowerCase().includes(searchLower) &&
          !task.description?.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    
    return true;
  });

  const tasksByStatus = {
    pending: filteredTasks.filter(task => task.status === 'pending'),
    'in-progress': filteredTasks.filter(task => task.status === 'in-progress'),
    completed: filteredTasks.filter(task => task.status === 'completed'),
  };

  const contextValue = {
    ...state,
    filteredTasks,
    tasksByStatus,
    
    // Actions
    setLoading,
    setError,
    clearError,
    
    setProjects,
    addProject,
    updateProject,
    deleteProject,
    setCurrentProject,
    
    setTasks,
    addTask,
    updateTask,
    deleteTask,
    setSelectedTask,
    
    setFilters,
    clearFilters,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export default AppContext;