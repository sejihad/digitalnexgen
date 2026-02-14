import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import ServiceListSidebar from "../components/ServiceListSidebar.jsx";
import SubCategoryServiceCard from "../components/SubCategoryServiceCard";
import { hideLoading, showLoading } from "../redux/loadingSlice";

const ServiceList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoading = useSelector((state) => state.loading.isLoading);

  const [searchParams, setSearchParams] = useSearchParams();

  // state
  const [selectedCategory, setSelectedCategory] = useState("programming-tech");
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);

  const [services, setServices] = useState([]);
  const [projects, setProjects] = useState([]);

  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  /* =====================================
     1️⃣ URL → STATE (supports refresh + back/forward)
  ===================================== */
  useEffect(() => {
    const cat = searchParams.get("category");
    const sub = searchParams.get("subcategory");

    if (cat && cat !== selectedCategory) setSelectedCategory(cat);

    // subcategory can be null
    const nextSub = sub || null;
    if (nextSub !== selectedSubCategory) setSelectedSubCategory(nextSub);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  /* =====================================
     2️⃣ STATE → URL (sync + loop-safe)
  ===================================== */
  useEffect(() => {
    const next = new URLSearchParams();
    next.set("category", selectedCategory);
    if (selectedSubCategory) next.set("subcategory", selectedSubCategory);

    // prevent unnecessary updates
    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedSubCategory]);

  /* =====================================
     3️⃣ FETCH SERVICES
  ===================================== */
  useEffect(() => {
    const fetchServices = async () => {
      dispatch(showLoading());
      setError("");

      try {
        const params = new URLSearchParams();
        params.set("category", selectedCategory);
        if (selectedSubCategory) params.set("subcategory", selectedSubCategory);

        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/services?${params.toString()}`,
        );

        setServices(res.data || []);
      } catch (err) {
        setServices([]);
        setError("Failed to fetch services. Please try again later.");
      } finally {
        dispatch(hideLoading());
      }
    };

    fetchServices();
  }, [selectedCategory, selectedSubCategory, dispatch]);

  /* =====================================
     4️⃣ FETCH RELATED PROJECTS (filtered client-side)
  ===================================== */
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data: allProjects } = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/projects`,
        );

        let filtered = (allProjects || []).filter(
          (p) => p.category?.toLowerCase() === selectedCategory?.toLowerCase(),
        );

        if (selectedSubCategory) {
          const sub = selectedSubCategory.toLowerCase();
          filtered = filtered.filter((p) => {
            const ps = (p.subCategory || p.subcategory || "").toLowerCase();
            return ps.includes(sub);
          });
        }

        setProjects(filtered);
      } catch (e) {
        setProjects([]);
      }
    };

    fetchProjects();
  }, [selectedCategory, selectedSubCategory]);

  const toggleSidebar = () => setIsOpen((p) => !p);

  return (
    <div className="relative flex flex-col md:flex-row max-w-[1440px] mx-auto">
      {/* Sidebar */}
      <ServiceListSidebar
        setSelectedCategory={(cat) => {
          setSelectedCategory(cat);
          setSelectedSubCategory(null); // reset when category changes
        }}
        selectedCategory={selectedCategory}
        selectedSubCategory={selectedSubCategory}
        setSelectedSubCategory={setSelectedSubCategory}
        isOpen={isOpen}
      />

      {/* Mobile toggle */}
      <button
        className="absolute top-2 left-8 z-40 bg-pink-500 text-white text-xs p-2 rounded-md md:hidden"
        onClick={toggleSidebar}
      >
        {isOpen ? "Close Sidebar" : "Open Sidebar"}
      </button>

      {/* Content */}
      <main className="flex-1 h-screen overflow-y-auto">
        <h2 className="text-center text-2xl lg:text-3xl font-bold mt-12 md:mt-4 border-b-2 border-[#333333] w-max mx-auto pb-1 dark:text-white">
          Featured {selectedCategory.replaceAll("-", " ")}
          {selectedSubCategory
            ? ` → ${selectedSubCategory.replaceAll("-", " ")}`
            : ""}
        </h2>

        {isLoading && <p className="text-center">Loading...</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}

        {!isLoading && !error && services.length === 0 && (
          <p className="text-gray-400 text-center">
            No services found for this selection.
          </p>
        )}

        {/* Services */}
        <div className="w-11/12 mx-auto max-w-[1440px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {services.map((service) => (
            <SubCategoryServiceCard key={service._id} service={service} />
          ))}
        </div>

        {/* Related Projects */}
        <div className="mt-12 w-11/12 mx-auto max-w-[1440px]">
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
                    src={
                      project.images?.[0]?.url ||
                      project.images?.[0] ||
                      "/placeholder.jpg"
                    }
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
                No related projects found.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ServiceList;
