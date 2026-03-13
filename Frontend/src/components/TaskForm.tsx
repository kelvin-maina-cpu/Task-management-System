import React, { useState } from "react";

interface TaskFormProps {
  addTask: (title: string) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ addTask }) => {
  const [title, setTitle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask(title);
    setTitle("");
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter task..."
        style={{ padding: "8px", marginRight: "10px", width: "70%" }}
      />
      <button 
        type="submit"
        style={{ padding: "8px 16px", backgroundColor: "#28a745", color: "#fff", border: "none", cursor: "pointer" }}
      >
        Add Task
      </button>
    </form>
  );
};

export default TaskForm;
