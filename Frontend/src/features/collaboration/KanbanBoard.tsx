import { useParams } from 'react-router-dom';
import { DndContext, type DragEndEvent, closestCorners } from '@dnd-kit/core';
import { useGetTasksByProjectQuery, useUpdateTaskMutation, type Task } from './tasksApi';
import { TaskColumn } from './components/TaskColumn';

const COLUMNS = [
  { id: 'todo', title: 'To Do', color: 'bg-gray-500' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-blue-500' },
  { id: 'review', title: 'Review', color: 'bg-yellow-500' },
  { id: 'completed', title: 'Completed', color: 'bg-green-500' },
];

export const KanbanBoard = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: tasks, refetch } = useGetTasksByProjectQuery(projectId || '');
  const [updateTask] = useUpdateTaskMutation();

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    
    const taskId = active.id as string;
    const newStatus = over.id as Task['status'];
    
    try {
      await updateTask({ id: taskId, updates: { status: newStatus } }).unwrap();
      refetch();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleAddTask = async (_columnId: string) => {
    const title = prompt('Enter task title:');
    if (!title || !projectId) return;
    
    try {
      // This would call createTask - omitted for brevity
      refetch();
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-gray-700 px-6 py-4">
        <h1 className="text-2xl font-bold text-white">Project Collaboration</h1>
        <p className="text-gray-400 text-sm">Drag and drop tasks to update their status</p>
      </div>

      {/* Kanban Board */}
      <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="flex-1 flex gap-4 p-4 overflow-x-auto">
          {COLUMNS.map((column) => (
            <TaskColumn
              key={column.id}
              id={column.id}
              title={column.title}
              color={column.color}
              tasks={tasks?.filter((t) => t.status === column.id) || []}
              onAddTask={() => handleAddTask(column.id)}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
};

