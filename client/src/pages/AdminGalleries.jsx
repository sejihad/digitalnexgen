import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { hideLoading, showLoading } from "../redux/loadingSlice";

const AdminGalleries = () => {
  const [galleries, setGalleries] = useState([]);
  const [error, setError] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchGalleries = async () => {
      dispatch(showLoading());
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/galleries`
        );
        setGalleries(response.data);
      } catch (error) {
        setError("Failed to fetch galleries. Please try again later.");
      } finally {
        dispatch(hideLoading());
      }
    };

    fetchGalleries();
  }, [dispatch]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this gallery item?"
    );
    if (!confirmDelete) return;

    dispatch(showLoading());
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/galleries/${id}`,
        {
          withCredentials: true,
        }
      );
      setGalleries(galleries.filter((gallery) => gallery._id !== id));
      alert("Gallery item deleted successfully.");
    } catch (error) {
      alert("Failed to delete the gallery item. Please try again.");
    } finally {
      dispatch(hideLoading());
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-white text-xl font-bold mb-4">Admin Galleries</h1>
      {error && <p className="text-red-500">{error}</p>}

      {!galleries.length && !error && (
        <p className="text-white">No galleries available.</p>
      )}
      {galleries.length > 0 && (
        <div className="overflow-x-auto">
          <table className="table-auto w-full text-white border-collapse border border-gray-700">
            <thead>
              <tr className="bg-gray-800">
                <th className="border border-gray-700 px-4 py-2">#</th>
                <th className="border border-gray-700 px-4 py-2">ID</th>
                <th className="border border-gray-700 px-4 py-2">Title</th>
                <th className="border border-gray-700 px-4 py-2">Category</th>
                <th className="border border-gray-700 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {galleries.map((gallery, index) => (
                <tr key={gallery._id} className="bg-gray-900 hover:bg-gray-700">
                  <td className="border border-gray-700 px-4 py-2">
                    {index + 1}
                  </td>
                  <td className="border border-gray-700 px-4 py-2">
                    {gallery._id}
                  </td>
                  <td className="border border-gray-700 px-4 py-2">
                    {gallery.imageTitle}
                  </td>
                  <td className="border border-gray-700 px-4 py-2">
                    {gallery.category}
                  </td>
                  <td className="border border-gray-700 px-4 py-2">
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
