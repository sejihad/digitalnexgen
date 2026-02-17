import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { hideLoading, showLoading } from "../redux/loadingSlice";

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [error, setError] = useState("");
  const [categories] = useState([
    "programming-tech",
    "graphics-design",
    "digital-marketing",
    "video-animation",
    "business",
    "writing-translation",
  ]);
  const [filter, setFilter] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      dispatch(showLoading());
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/services`,
          {
            params: {
              category: filter,
            },
          },
        );
        setServices(response.data);
        setFilteredServices(response.data);
      } catch (error) {
        setError("Failed to fetch services. Please try again later.");
      } finally {
        dispatch(hideLoading());
      }
    };

    fetchServices();
  }, [filter, dispatch]);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this service?",
    );
    if (!confirmDelete) return;

    dispatch(showLoading());
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/services/${id}`,
        {
          withCredentials: true,
        },
      );
      setServices(services.filter((service) => service._id !== id));
      alert("Service deleted successfully.");
    } catch (error) {
      alert("Failed to delete the service. Please try again.");
    } finally {
      dispatch(hideLoading());
    }
  };

  const handleUpdate = (id) => {
    navigate(`/admin/services/edit/${id}`);
  };

  return (
    <div className="p-4">
      <h1 className="text-white text-xl font-bold mb-4">Admin Services</h1>
      {error && <p className="text-red-500">{error}</p>}

      <div className="mb-4">
        <label htmlFor="categoryFilter" className="text-white mr-2">
          Filter by Category:
        </label>
        <select
          id="categoryFilter"
          value={filter}
          onChange={handleFilterChange}
          className="bg-gray-800 text-white border border-gray-700 px-4 py-2 rounded"
        >
          <option value="">All Categories</option>
          {categories.map((category, index) => (
            <option key={index} value={category}>
              {category.replace(/-/g, " ").toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {!filteredServices.length && !error && (
        <p className="text-white">No services available.</p>
      )}
      {filteredServices.length > 0 && (
        <div className="overflow-x-auto">
          <table className="table-auto w-full text-white border-collapse border border-gray-700">
            <thead>
              <tr className="bg-gray-800">
                <th className="border border-gray-700 px-4 py-2">#</th>
                <th className="border border-gray-700 px-4 py-2">Title</th>
                <th className="border border-gray-700 px-4 py-2">
                  Description
                </th>
                <th className="border border-gray-700 px-4 py-2">Category</th>
                <th className="border border-gray-700 px-4 py-2">
                  Subcategory
                </th>
                <th className="border border-gray-700 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map((service, index) => (
                <tr key={service._id} className="bg-gray-900 hover:bg-gray-700">
                  <td className="border border-gray-700 px-4 py-2">
                    {index + 1}
                  </td>
                  <td className="border border-gray-700 px-4 py-2">
                    {service.title}
                  </td>
                  <td className="border border-gray-700 px-4 py-2">
                    {service.description}
                  </td>
                  <td className="border border-gray-700 px-4 py-2">
                    {service.category || "N/A"}
                  </td>
                  <td className="border border-gray-700 px-4 py-2">
                    {service.subCategory || "N/A"}
                  </td>
                  <td className="border border-gray-700 px-4 py-2 space-x-2">
                    <button
                      onClick={() => handleUpdate(service._id)}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => handleDelete(service._id)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminServices;
