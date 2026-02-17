import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import SubCategoryServiceCard from "../components/SubCategoryServiceCard";
import { hideLoading, showLoading } from "../redux/loadingSlice";

const SubCategory = () => {
  const { subCategory } = useParams();
  const [services, setServices] = useState([]);
  const [projects, setProjects] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Fetch all services for this subcategory
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/services?subcategory=${subCategory}`,
        );
        setServices(response.data);
      } catch (error) {}
    };
    fetchServices();
  }, [subCategory]);

  // ✅ Fetch related projects (project.category === service.category)
  useEffect(() => {
    const fetchProjects = async () => {
      dispatch(showLoading());
      try {
        // 1️⃣ Fetch all services in this subcategory
        const { data: serviceData } = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/services?subcategory=${subCategory}`,
        );

        if (serviceData.length > 0) {
          // 2️⃣ Get category name from first service
          const mainCategory = serviceData[0].category;

          // 3️⃣ Fetch all projects
          const { data: allProjects } = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/api/projects`,
          );

          // 4️⃣ Filter only projects whose category matches the service category
          const filtered = allProjects.filter(
            (project) =>
              project.category?.toLowerCase() === mainCategory?.toLowerCase(),
          );

          // 5️⃣ (Optional) further filter by subcategory name if project.subcategory exists
          const finalFiltered = filtered.filter((project) =>
            project.subcategory
              ? project.subcategory.toLowerCase() === subCategory.toLowerCase()
              : true,
          );

          setProjects(finalFiltered);
        } else {
          setProjects([]);
        }
      } catch (error) {
      } finally {
        dispatch(hideLoading());
      }
    };

    fetchProjects();
  }, [dispatch, subCategory]);

  return (
    <section className="max-w-[1440px] w-11/12 mt-4 rounded-md mx-auto p-6 bg-light-bg dark:bg-[#222222]">
      {/* ---------- Subcategory Title ---------- */}
      <h2 className="text-3xl font-roboto font-bold border-b-2 pb-2 border-[#333333] dark:text-gray-100 text-primaryText capitalize mb-6 text-center">
        {subCategory.replace("-", " ")}
      </h2>

      {/* ---------- Services Section ---------- */}
      <div>
        <h3 className="text-2xl font-semibold mb-4 text-center dark:text-gray-200 text-primaryText">
          Services under this subcategory
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.length > 0 ? (
            services.map((service) => (
              <SubCategoryServiceCard key={service._id} service={service} />
            ))
          ) : (
            <p className="dark:text-gray-400 text-gray-600 text-center col-span-full">
              No services found for this subcategory.
            </p>
          )}
        </div>
      </div>

      {/* ---------- Related Projects Section ---------- */}
      <div className="mt-12">
        <h3 className="text-2xl font-semibold mb-4 text-center dark:text-gray-200 text-primaryText">
          Related Projects
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {projects.length > 0 ? (
            projects.map((project) => (
              <div
                key={project._id}
                className="group relative rounded-2xl overflow-hidden border border-white/20 shadow-md hover:shadow-2xl transition"
              >
                <img
                  src={project.images?.[0].url || "/placeholder.jpg"}
                  alt={project.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h4 className="text-lg font-bold text-primaryText dark:text-white mb-2">
                    {project.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {project.description}
                  </p>
                </div>

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <button
                    onClick={() => navigate(`/project/${project._id}`)}
                    className="px-4 py-2 bg-pink-500 text-white rounded-lg text-sm font-semibold shadow-md transition"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="dark:text-gray-400 text-gray-600 text-center col-span-full">
              No related projects found for this subcategory.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default SubCategory;
