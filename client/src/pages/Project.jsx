import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import ProjectSidebar from "../components/ProjectSidebar";
import { hideLoading, showLoading } from "../redux/loadingSlice";

const ProjectPage = () => {
  const [projects, setProjects] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("programming-tech");
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      dispatch(showLoading());
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/projects`,
        );
        setProjects(response.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        dispatch(hideLoading());
      }
    };
    fetchProjects();
  }, [dispatch]);

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    const categoryMatch =
      project.category.toLowerCase() === selectedCategory.toLowerCase();
    if (selectedSubCategory) {
      const subMatch =
        project.subCategory.toLowerCase() === selectedSubCategory.toLowerCase();
      return categoryMatch && subMatch;
    }
    return categoryMatch;
  });

  const formatText = (text) => text.replace(/-/g, " ");

  const pageTitle = selectedSubCategory
    ? `${formatText(selectedCategory)} → ${formatText(selectedSubCategory)} Projects`
    : `${formatText(selectedCategory)} Projects`;

  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };
  return (
    <div className="relative flex flex-col md:flex-row max-w-[1440px] mx-auto h-screen">
      {/* Sidebar */}
      <div className="md:w-64 flex-shrink-0">
        <ProjectSidebar
          setSelectedCategory={setSelectedCategory}
          selectedCategory={selectedCategory}
          selectedSubCategory={selectedSubCategory}
          setSelectedSubCategory={setSelectedSubCategory}
          isOpen={isOpen}
        />
      </div>

      {/* Mobile toggle button */}
      <button
        className="absolute top-2 left-8 z-40 bg-pink-500 text-white text-xs p-2 rounded-md md:hidden"
        onClick={toggleSidebar}
      >
        {isOpen ? "Close Sidebar" : "Open Sidebar"}
      </button>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto ml-0 md:ml-4 p-6">
        <h2 className="text-xl lg:text-3xl font-bold font-roboto text-primaryText dark:text-white text-center mt-12 md:mt-4 border-b-2 border-[#333333] w-[max-content] mx-auto pb-1 capitalize">
          {pageTitle}
        </h2>

        <div className="w-11/12 mx-auto max-w-[1440px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredProjects.map((project) => (
            <div
              key={project._id}
              className="group relative block transition-transform duration-300 transform hover:-translate-y-1 bg-white rounded-lg  px-0 py-0 dark:border dark:border-gray-100  shadow-[0_.14px_2.29266px_rgba(0,0,0,0.03),_0_.37px_4.42626px_rgba(0,0,0,0.047),_0_3px_7px_rgba(0,0,0,0.09)] dark:bg-white/10 dark:border-white/20 dark:shadow-lg overflow-hidden"
            >
              <img
                src={project.images[0].url || "/placeholder.jpg"}
                alt={project.title}
                className="w-full h-48 object-cover rounded-md group-hover:opacity-90 transition-opacity duration-300"
              />

              <div className="p-4">
                <h3 className="text-lg font-bold text-primaryText dark:text-white mb-2">
                  {project.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {project.description}
                </p>
              </div>

              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <button
                  onClick={() => navigate(`/project/${project._id}`)}
                  className="px-4 py-2 bg-pink-500 text-white rounded-lg text-sm font-semibold shadow-md transition"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}

          {filteredProjects.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-300 col-span-full">
              No projects found in this category.
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProjectPage;
