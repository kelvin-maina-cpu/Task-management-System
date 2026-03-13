const API_URL = "http://localhost:5000/api/tasks";

export interface Task {
  _id: string;
  title: string;
  completed: boolean;
}

export const fetchTasks = async (): Promise<Task[]> => {
  const res = await fetch(API_URL);
  if (!res.ok) {
    throw new Error("Failed to fetch tasks");
  }
  return res.json();
};

export const createTask = async (task: { title: string; completed?: boolean }): Promise<Task> => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  if (!res.ok) {
    throw new Error("Failed to create task");
  }
  return res.json();
};

export const updateTask = async (id: string, updates: { completed: boolean }): Promise<Task> => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    throw new Error("Failed to update task");
  }
  return res.json();
};
