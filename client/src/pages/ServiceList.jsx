import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "../components/Sidebar";
import SubCategoryServiceCard from "../components/SubCategoryServiceCard";
import axios from "axios";
import { showLoading, hideLoading } from "../redux/loadingSlice";

const ServiceList = () => {
  const [selectedCategory, setSelectedCategory] = useState("programming-tech");
  const [services, setServices] = useState([]);
  const [error, setError] = useState("");
  const isLoading = useSelector((state) => state.loading.isLoading);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchServices = async () => {
      dispatch(showLoading());
      setError("");

      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_API_BASE_URL
          }/api/services?category=${selectedCategory}`
        );

        setServices(response.data || []);
      } catch (err) {
        setError("Failed to fetch services. Please try again later.");
      } finally {
        dispatch(hideLoading());
      }
    };

    fetchServices();
  }, [selectedCategory, dispatch]);

  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="relative flex flex-col md:flex-row max-w-[1440px] mx-auto">
      <Sidebar
        setSelectedCategory={setSelectedCategory}
        selectedCategory={selectedCategory}
        isOpen={isOpen}
      />

      <button
        className="absolute top-2 left-8 z-40 bg-pink-500 text-white text-xs p-2 rounded-md md:hidden"
        onClick={toggleSidebar}
      >
        {isOpen ? "Close Sidebar" : "Open Sidebar"}
      </button>

      <main className="flex-1">
        <div className="p-0">
          <h2 className="text-gray-600 font-roboto text-center text-2xl lg:text-3xl font-bold mt-12 md:mt-4 border-b-2 border-[#333333] w-[max-content] mx-auto pb-1 dark:text-white">
            Featured {selectedCategory.replace("-", " & ")}
          </h2>
          {isLoading && <p className="text-white text-center">Loading...</p>}
          {error && <p className="text-red-500 text-center">{error}</p>}
          {!isLoading && !error && services.length === 0 && (
            <p className="text-gray-400 text-center">
              No services found for this category.
            </p>
          )}
          <div className="w-11/12 mx-auto max-w-[1440px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {services.map((service, index) => (
              <SubCategoryServiceCard key={index} service={service} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
export default ServiceList;
