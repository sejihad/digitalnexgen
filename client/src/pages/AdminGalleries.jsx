import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { hideLoading, showLoading } from "../redux/loadingSlice";

const AdminGalleries = () => {
  const [galleries, setGalleries] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredGalleries, setFilteredGalleries] = useState([]);
  const dispatch = useDispatch();

  // Fetch galleries
  useEffect(() => {
    const fetchGalleries = async () => {
      dispatch(showLoading());
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/galleries`,
          { withCredentials: true },
        );
        setGalleries(res.data);
        setFilteredGalleries(res.data);
      } catch (err) {
        toast.error("Failed to fetch galleries.");
      } finally {
        dispatch(hideLoading());
      }
    };
    fetchGalleries();
  }, [dispatch]);

  // Search filter
  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearch(query);
    setFilteredGalleries(
      galleries.filter((g) => g.name.toLowerCase().includes(query)),
    );
  };

  // Delete gallery
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this partner?"))
      return;
    dispatch(showLoading());
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/galleries/${id}`,
        { withCredentials: true },
      );
      const updated = galleries.filter((g) => g._id !== id);
      setGalleries(updated);
      setFilteredGalleries(
        updated.filter((g) => g.name.toLowerCase().includes(search)),
      );
      toast.success("Gallery deleted successfully.");
    } catch (err) {
      toast.error("Failed to delete gallery.");
    } finally {
      dispatch(hideLoading());
    }
  };

  // Update gallery
  const handleUpdate = (id) => {
    window.location.href = `/admin/galleries/edit/${id}`;
  };

  return (
    <div className="p-4">
      <h1 className="text-black dark:text-white text-xl font-bold mb-4">
        Admin Galleries
      </h1>

      {/* Search Input */}
      <div className="mb-4">
        <label
          htmlFor="searchGalleries"
          className="text-black dark:text-white mr-2"
        >
          Search Galleries:
        </label>
        <input
          id="searchGalleries"
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by name..."
          className="bg-gray-800 text-white border border-gray-700 px-4 py-2 rounded w-full"
        />
      </div>

      {/* Galleries Table */}
      {!filteredGalleries.length ? (
        <p className="text-white">No galleries available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-auto w-full text-white border-collapse border border-gray-700">
            <thead>
              <tr className="bg-gray-800">
                <th className="border border-gray-700 px-4 py-2 text-center">
                  #
                </th>
                <th className="border border-gray-700 px-4 py-2 text-center">
                  Logo
                </th>
                <th className="border border-gray-700 px-4 py-2 text-center">
                  Name
                </th>
                <th className="border border-gray-700 px-4 py-2 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredGalleries.map((gallery, index) => (
                <tr key={gallery._id} className="bg-gray-900 hover:bg-gray-700">
                  <td className="border border-gray-700 px-4 py-2 text-center">
                    {index + 1}
                  </td>
                  <td className="border border-gray-700 px-4 py-2 text-center">
                    <img
                      src={gallery.image?.url}
                      alt={gallery.name}
                      className="w-20 h-20 object-contain mx-auto rounded-md bg-gray-800"
                    />
                  </td>
                  <td className="border border-gray-700 px-4 py-2 text-center">
                    {gallery.imageTitle}
                  </td>
                  <td className="border border-gray-700 px-4 py-2 flex justify-center gap-2">
                    <button
                      onClick={() => handleUpdate(gallery._id)}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => handleDelete(gallery._id)}
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
export default AdminGalleries;
