import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Task } from '../tasksApi';

interface TaskColumnProps {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
  onAddTask: () => void;
}

export const TaskColumn = ({ id, title, color, tasks, onAddTask }: TaskColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-80 bg-slate-800/50 rounded-xl p-4 transition-colors ${
        isOver ? 'bg-slate-700/50' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${color}`}></div>
          <h3 className="font-semibold text-white">{title}</h3>
          <span className="text-gray-400 text-sm">({tasks.length})</span>
        </div>
        <button
          onClick={onAddTask}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <SortableContext items={tasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task._id}
              className="bg-slate-700/50 border border-gray-600 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-gray-500 transition-colors"
            >
              <h4 className="text-white font-medium mb-2">{task.title}</h4>
              {task.description && (
                <p className="text-gray-400 text-sm mb-2 line-clamp-2">{task.description}</p>
              )}
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded text-xs ${
                  task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                  task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {task.priority}
                </span>
                {task.dueDate && (
                  <span className="text-gray-500 text-xs">
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </SortableContext>

      {tasks.length === 0 && (
        <div className="text-center py-8 text-gray-500 text-sm">
          No tasks yet
        </div>
      )}
    </div>
  );
};

