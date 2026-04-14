// Get API URL from environment or use /api fallback
const getApiUrl = () => {
  const baseUrl = import.meta.env.VITE_API_URL || '/api';
  return `${baseUrl}/tasks`;
};

export interface Task {
  _id: string;
  title: string;
  completed: boolean;
}

export const fetchTasks = async (): Promise<Task[]> => {
  const API_URL = getApiUrl();
  const res = await fetch(API_URL, {
    credentials: 'include',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`
    }
  });
  if (!res.ok) {
    throw new Error("Failed to fetch tasks");
  }
  return res.json();
};

export const createTask = async (task: { title: string; completed?: boolean }): Promise<Task> => {
  const API_URL = getApiUrl();
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`
    },
    body: JSON.stringify(task),
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error("Failed to create task");
  }
  return res.json();
};

export const updateTask = async (id: string, updates: { completed: boolean }): Promise<Task> => {
  const API_URL = getApiUrl();
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json",
      'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`
    },
    body: JSON.stringify(updates),
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error("Failed to update task");
  }
  return res.json();
};
