import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { FiMenu } from "react-icons/fi";
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

  // States
  const [selectedCategory, setSelectedCategory] = useState("programming-tech");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false); // For Mobile Drawer

  const drawerRef = useRef(null);

  // Helper: Shuffle Array
  const shuffleArray = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // ✅ 1. URL Sync -> State
  useEffect(() => {
    const cat = searchParams.get("category");
    const group = searchParams.get("group");
    const subs = searchParams.getAll("subcategory");

    if (cat && cat !== selectedCategory) setSelectedCategory(cat);
    if (group !== selectedGroup) setSelectedGroup(group);
    if (JSON.stringify(subs) !== JSON.stringify(selectedSubCategories)) {
      setSelectedSubCategories(subs);
    }
  }, [searchParams]);

  // ✅ 2. State Sync -> URL
  useEffect(() => {
    const next = new URLSearchParams();
    next.set("category", selectedCategory);
    if (selectedGroup) next.set("group", selectedGroup);
    selectedSubCategories.forEach((s) => next.append("subcategory", s));

    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }
  }, [selectedCategory, selectedGroup, selectedSubCategories]);

  // ✅ 3. Fetch Services
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
        setServices(shuffleArray(res.data || []));
      } catch (err) {
        setServices([]);
        setError("Failed to fetch services.");
      } finally {
        dispatch(hideLoading());
      }
    };
    fetchServices();
  }, [selectedCategory, selectedSubCategories, dispatch]);

  // ✅ 4. Fetch Projects
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

  // ✅ 5. Drawer Controls & Accessibility
  const closeDrawer = () => setIsOpen(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => e.key === "Escape" && closeDrawer();
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden"; // Lock scroll
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  return (
    <div className="max-w-[1440px] mx-auto min-h-screen flex flex-col md:flex-row relative">
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden md:block w-72 flex-shrink-0 border-r border-black/5 dark:border-white/5 h-screen sticky top-0 p-6 overflow-y-auto premium-scrollbar">
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
          isOpen={true}
        />
      </aside>

      {/* --- MOBILE ACTION BAR --- */}
      <div className="md:hidden sticky top-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-black/10 dark:border-white/10 px-4 py-3 flex justify-between items-center">
        <button
          className="flex items-center gap-2  hover:bg-green-600 hover:text-white dark:text-white text-xs px-4 py-2 rounded-lg transition-all border-green-500 border-2 font-bold text-black"
          onClick={() => setIsOpen(true)}
        >
          <FiMenu size={16} />
          Categories
        </button>
        <span className="text-xs font-medium dark:text-gray-300 text-gray-600 truncate max-w-[150px]">
          {selectedGroup || selectedCategory.replace("-", " ")}
        </span>
      </div>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 px-4 md:px-8 pb-20">
        <div className="pt-6">
          <h2 className="flex flex-wrap justify-center items-center gap-2 text-center text-xl md:text-3xl font-bold border-b-2 border-pink-500 pb-2 dark:text-white capitalize font-roboto max-w-full">
            {/* ক্যাটাগরি নাম */}
            <span className="whitespace-nowrap">
              {selectedCategory.replaceAll("-", " ")}
            </span>
          </h2>

          {/* Loader/Error States */}
          {isLoading && (
            <div className="flex justify-center mt-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500"></div>
            </div>
          )}
          {error && (
            <p className="text-red-500 text-center mt-10 font-medium">
              {error}
            </p>
          )}

          {!isLoading && !error && services.length === 0 && (
            <div className="text-center mt-20">
              <p className="text-gray-400 text-lg">
                No services found for this selection.
              </p>
            </div>
          )}

          {/* Services Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {!isLoading &&
              services.map((service) => (
                <SubCategoryServiceCard key={service._id} service={service} />
              ))}
          </div>

          {/* Related Projects */}
          <section className="mt-20">
            <h3 className="text-2xl font-bold mb-8 text-center dark:text-gray-100 text-primaryText font-roboto">
              Related Projects
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {projects.length > 0 ? (
                projects.map((project) => (
                  <div
                    key={project._id}
                    className="group relative rounded-2xl overflow-hidden border border-black/5 dark:border-white/10 shadow-sm hover:shadow-xl transition-all duration-300 bg-white dark:bg-[#111]"
                  >
                    <img
                      src={
                        project.images?.[0]?.url ||
                        project.images?.[0] ||
                        "/placeholder.jpg"
                      }
                      alt={project.title}
                      className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="p-4">
                      <h4 className="text-md font-bold text-primaryText dark:text-white mb-1 truncate">
                        {project.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                        {project.description}
                      </p>
                    </div>
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => navigate(`/project/${project._id}`)}
                        className="px-5 py-2 bg-pink-500 text-white rounded-full text-xs font-bold transform translate-y-4 group-hover:translate-y-0 transition-all"
                      >
                        View Project
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center col-span-full py-10">
                  No related projects found.
                </p>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* --- MOBILE DRAWER --- */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={closeDrawer}
          />

          {/* Drawer Content */}
          <div
            ref={drawerRef}
            className="absolute left-0 top-0 h-full w-[85%] max-w-sm bg-white dark:bg-[#0b0b0b] shadow-2xl flex flex-col animate-slide-in"
          >
            <div className="p-4 border-b border-black/5 dark:border-white/10 flex justify-between items-center">
              <span className="font-bold text-lg dark:text-white">
                Categories
              </span>
              <button
                onClick={closeDrawer}
                className="p-2 text-gray-500 hover:text-black dark:hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <ServiceListSidebar
                setSelectedCategory={(cat) => {
                  setSelectedCategory(cat);
                  setSelectedGroup(null);
                  setSelectedSubCategories([]);
                  closeDrawer(); // Close drawer on select
                }}
                selectedCategory={selectedCategory}
                selectedGroup={selectedGroup}
                setSelectedGroup={setSelectedGroup}
                setSelectedSubCategories={setSelectedSubCategories}
                isOpen={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceList;
