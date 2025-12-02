import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { PlusIcon } from '@heroicons/react/24/outline';
import TaskCard from './TaskCard';

export default function KanbanColumn({ column, tasks, onTaskClick, onTaskEdit, onTaskDelete, projectId, currentUserId }) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <div className="flex flex-col w-80 h-full">
      {/* Column Header */}
      <div className={`${column.headerColor} rounded-lg p-4 mb-4 border ${column.color} border-2 border-dashed`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{column.title}</h3>
          <div className="flex items-center space-x-2">
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
              {tasks.length}
            </span>
            <button className="text-gray-400 hover:text-gray-600">
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Column Content */}
      <div
        ref={setNodeRef}
        className="flex-1 min-h-0 space-y-3 overflow-y-auto"
      >
        <SortableContext items={tasks.map(task => task.id || task.taskId)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard 
              key={task.id || task.taskId} 
              task={task}
              onEdit={() => onTaskEdit?.(task)}
              onDelete={() => onTaskDelete?.(task)}
              onClick={() => onTaskClick?.(task)}
              projectId={projectId}
              currentUserId={currentUserId}
            />
          ))}
        </SortableContext>

        {/* Empty State */}
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
              <PlusIcon className="h-6 w-6" />
            </div>
            <p className="text-sm text-gray-500">Không có task nào</p>
            <p className="text-xs text-gray-400 mt-1">Kéo task vào đây</p>
          </div>
        )}
      </div>
    </div>
  );
  //
}