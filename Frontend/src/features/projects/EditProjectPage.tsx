import { useParams, useNavigate } from 'react-router-dom';
import { useGetProjectByIdQuery, useUpdateProjectMutation } from './projectsApi';
import { useState, useEffect } from 'react';

export const EditProjectPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading } = useGetProjectByIdQuery(id!);
  const [updateProject] = useUpdateProjectMutation();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        description: project.description,
      });
    }
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProject({ id: id!, updates: formData }).unwrap();
      navigate(`/projects/${id}`);
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  if (isLoading) return <div className="text-white p-8">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-white">Edit Project</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-slate-800 p-6 rounded-lg">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg bg-slate-700 border-slate-600 text-white focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg bg-slate-700 border-slate-600 text-white h-32 focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 font-semibold"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={() => navigate(`/projects/${id}`)}
            className="border border-slate-600 text-white px-6 py-2 rounded-lg hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

