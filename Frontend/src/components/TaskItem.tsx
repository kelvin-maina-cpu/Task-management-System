import React from "react";
import styles from "./TaskItem.module.css";

interface Task {
  _id: string;
  title: string;
  completed: boolean;
}

interface TaskItemProps {
  task: Task;
  toggleComplete: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, toggleComplete }) => {
  return (
    <li className={`${styles.taskItem} ${task.completed ? styles.completed : ""}`}>
      <span className={styles.taskTitle}>
        {task.title}
        {task.completed && <span className={styles.completedBadge}>(Completed)</span>}
      </span>
      <button 
        className={styles.toggleButton}
        onClick={() => toggleComplete(task._id)}
      >
        {task.completed ? "Mark Incomplete" : "Mark Complete"}
      </button>
    </li>
  );
};

export default TaskItem;
