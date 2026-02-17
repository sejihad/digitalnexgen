import axios from "axios";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AdminProjects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/projects?admin=true`,
        { withCredentials: true },
      );
      setProjects(response.data);
    } catch (error) {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?"))
      return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/projects/${id}`,
        { withCredentials: true },
      );
      toast.success("Project deleted successfully");
      fetchProjects();
    } catch (error) {
      toast.error("Failed to delete project");
    }
  };

  const handleEdit = (id) => navigate(`/admin/projects/edit/${id}`);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Projects
          </h1>
          <button
            onClick={() => navigate("/admin/add-project")}
            className="flex items-center gap-2  px-6 py-3 rounded-lg font-semibold bg-white transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            Add New Project
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              No projects yet
            </p>
            <button
              onClick={() => navigate("/admin/add-project")}
              className=" text-black px-6 py-3 rounded-lg font-semibold bg-white"
            >
              Create First Project
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {projects.map((project) => (
              <div
                key={project._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                        {project.title}
                      </h3>
                      <span className="px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-full text-xs font-semibold">
                        {project.client || "—"}
                      </span>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 mb-3">
                      {project.description}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div>
                        <span className="font-semibold">Technologies:</span>{" "}
                        {Array.isArray(project.technologies)
                          ? project.technologies.slice(0, 3).join(", ")
                          : project.technologies || "—"}
                      </div>
                      <div>
                        <span className="font-semibold">Category:</span>{" "}
                        {project.category || "—"}
                      </div>
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-2">
                    <button
                      onClick={() => handleEdit(project._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg font-semibold hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="hidden md:inline">Edit</span>
                    </button>

                    <button
                      onClick={() => handleDelete(project._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg font-semibold hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden md:inline">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProjects;
