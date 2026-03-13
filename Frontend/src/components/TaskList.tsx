import React from "react";
import TaskItem from "./TaskItem";
import TaskForm from "./TaskForm";

interface Task {
  _id: string;
  title: string;
  completed: boolean;
}

interface TaskListProps {
  tasks: Task[];
  addTask: (title: string) => void;
  toggleComplete: (id: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, addTask, toggleComplete }) => {
  return (
    <div>
      <TaskForm addTask={addTask} />
      <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
        {tasks.map((task) => (
          <TaskItem key={task._id} task={task} toggleComplete={toggleComplete} />
        ))}
      </ul>
    </div>
  );
};

export default TaskList;
