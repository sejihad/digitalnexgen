import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { hideLoading, showLoading } from "../redux/loadingSlice";

const AdminPartners = () => {
  const [partners, setPartners] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredPartners, setFilteredPartners] = useState([]);
  const dispatch = useDispatch();

  // Fetch partners
  useEffect(() => {
    const fetchPartners = async () => {
      dispatch(showLoading());
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/partners`,
          { withCredentials: true },
        );
        setPartners(res.data);
        setFilteredPartners(res.data);
      } catch (err) {
        toast.error("Failed to fetch partners.");
      } finally {
        dispatch(hideLoading());
      }
    };
    fetchPartners();
  }, [dispatch]);

  // Search filter
  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearch(query);
    setFilteredPartners(
      partners.filter((p) => p.name.toLowerCase().includes(query)),
    );
  };

  // Delete partner
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this partner?"))
      return;
    dispatch(showLoading());
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/partners/${id}`,
        { withCredentials: true },
      );
      const updated = partners.filter((p) => p._id !== id);
      setPartners(updated);
      setFilteredPartners(
        updated.filter((p) => p.name.toLowerCase().includes(search)),
      );
      toast.success("Partner deleted successfully.");
    } catch (err) {
      toast.error("Failed to delete partner.");
    } finally {
      dispatch(hideLoading());
    }
  };

  // Update partner
  const handleUpdate = (id) => {
    window.location.href = `/admin/partners/edit/${id}`;
  };

  return (
    <div className="p-4">
      <h1 className="text-black dark:text-white text-xl font-bold mb-4">
        Admin Partners
      </h1>

      {/* Search Input */}
      <div className="mb-4">
        <label
          htmlFor="searchPartners"
          className="text-black dark:text-white mr-2"
        >
          Search Partners:
        </label>
        <input
          id="searchPartners"
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by name..."
          className="bg-gray-800 text-white border border-gray-700 px-4 py-2 rounded w-full"
        />
      </div>

      {/* Partners Table */}
      {!filteredPartners.length ? (
        <p className="text-white">No partners available.</p>
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
              {filteredPartners.map((partner, index) => (
                <tr key={partner._id} className="bg-gray-900 hover:bg-gray-700">
                  <td className="border border-gray-700 px-4 py-2 text-center">
                    {index + 1}
                  </td>
                  <td className="border border-gray-700 px-4 py-2 text-center">
                    <img
                      src={partner.logo?.url}
                      alt={partner.name}
                      className="w-20 h-20 object-contain mx-auto rounded-md bg-gray-800"
                    />
                  </td>
                  <td className="border border-gray-700 px-4 py-2 text-center">
                    {partner.name}
                  </td>
                  <td className="border border-gray-700 px-4 py-2 flex justify-center gap-2">
                    <button
                      onClick={() => handleUpdate(partner._id)}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => handleDelete(partner._id)}
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
export default AdminPartners;
