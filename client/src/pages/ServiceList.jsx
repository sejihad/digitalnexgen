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

  const [selectedCategory, setSelectedCategory] = useState("programming-tech");
  const [selectedGroup, setSelectedGroup] = useState(null); // ✅ NEW (breadcrumb)
  const [selectedSubCategories, setSelectedSubCategories] = useState([]); // ✅ array for backend

  const [services, setServices] = useState([]);
  const [projects, setProjects] = useState([]);

  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const shuffleArray = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // ✅ URL -> STATE
  useEffect(() => {
    const cat = searchParams.get("category");
    const group = searchParams.get("group"); // ✅ NEW
    const subs = searchParams.getAll("subcategory"); // ✅ array

    if (cat && cat !== selectedCategory) setSelectedCategory(cat);

    const nextGroup = group || null;
    if (nextGroup !== selectedGroup) setSelectedGroup(nextGroup);

    const nextSubs = subs || [];
    if (JSON.stringify(nextSubs) !== JSON.stringify(selectedSubCategories)) {
      setSelectedSubCategories(nextSubs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // ✅ STATE -> URL
  useEffect(() => {
    const next = new URLSearchParams();
    next.set("category", selectedCategory);

    if (selectedGroup) next.set("group", selectedGroup); // ✅ NEW
    selectedSubCategories.forEach((s) => next.append("subcategory", s));

    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedGroup, selectedSubCategories]);

  // ✅ FETCH SERVICES
  useEffect(() => {
    const fetchServices = async () => {
      dispatch(showLoading());
      setError("");

      try {
        const params = new URLSearchParams();
        params.set("category", selectedCategory);
        selectedSubCategories.forEach((s) => params.append("subcategory", s));

        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/services/list?${params.toString()}`,
        );

        const list = res.data || [];
        setServices(shuffleArray(list));
      } catch (err) {
        setServices([]);
        setError("Failed to fetch services. Please try again later.");
      } finally {
        dispatch(hideLoading());
      }
    };

    fetchServices();
  }, [selectedCategory, selectedSubCategories, dispatch]);

  // ✅ FETCH PROJECTS (optional)
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data: allProjects } = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/projects`,
        );

        let filtered = (allProjects || []).filter(
          (p) => p.category?.toLowerCase() === selectedCategory?.toLowerCase(),
        );

        if (selectedSubCategories.length > 0) {
          const subs = selectedSubCategories.map((s) => s.toLowerCase());
          filtered = filtered.filter((p) => {
            const ps = (p.subCategory || p.subcategory || "").toLowerCase();
            return subs.some((s) => ps.includes(s));
          });
        }

        setProjects(filtered);
      } catch (e) {
        setProjects([]);
      }
    };

    fetchProjects();
  }, [selectedCategory, selectedSubCategories]);

  const toggleSidebar = () => setIsOpen((p) => !p);

  return (
    <div className="relative flex flex-col md:flex-row max-w-[1440px] mx-auto">
      <ServiceListSidebar
        setSelectedCategory={(cat) => {
          setSelectedCategory(cat);
          setSelectedGroup(null);
          setSelectedSubCategories([]);
        }}
        selectedCategory={selectedCategory}
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
        setSelectedSubCategories={setSelectedSubCategories}
        isOpen={isOpen}
      />

      <button
        className="absolute top-2 left-8 z-40 bg-pink-500 text-white text-xs p-2 rounded-md md:hidden"
        onClick={toggleSidebar}
      >
        {isOpen ? "Close Sidebar" : "Open Sidebar"}
      </button>

      <main className="flex-1 h-screen overflow-y-auto">
        {/* ✅ breadcrumb only group */}
        <h2 className="text-center text-2xl lg:text-3xl font-bold mt-12 md:mt-4 border-b-2 border-[#333333] w-max mx-auto pb-1 dark:text-white">
          Featured {selectedCategory.replaceAll("-", " ")}
          {selectedGroup ? ` → ${selectedGroup}` : ""}
        </h2>

        {isLoading && <p className="text-center">Loading...</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}

        {!isLoading && !error && services.length === 0 && (
          <p className="text-gray-400 text-center">
            No services found for this selection.
          </p>
        )}

        <div className="w-11/12 mx-auto max-w-[1440px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {services.map((service) => (
            <SubCategoryServiceCard key={service._id} service={service} />
          ))}
        </div>

        {/* Related Projects... unchanged */}
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
