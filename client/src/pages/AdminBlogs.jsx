import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { hideLoading, showLoading } from "../redux/loadingSlice";

const AdminBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      dispatch(showLoading());
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/blogs`,
          { withCredentials: true },
        );
        setBlogs(response.data);
        setFilteredBlogs(response.data);
      } catch (error) {
        setError("Failed to fetch blogs. Please try again later.");
      } finally {
        dispatch(hideLoading());
      }
    };

    fetchBlogs();
  }, [dispatch]);

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearch(query);
    setFilteredBlogs(
      blogs.filter((blog) => blog.title.toLowerCase().includes(query)),
    );
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this blog?",
    );
    if (!confirmDelete) return;

    dispatch(showLoading());
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/blogs/${id}`,
        {
          withCredentials: true,
        },
      );

      const updatedBlogs = blogs.filter((blog) => blog._id !== id);
      setBlogs(updatedBlogs);
      setFilteredBlogs(
        updatedBlogs.filter((blog) =>
          blog.title.toLowerCase().includes(search),
        ),
      );

      alert("Blog deleted successfully.");
    } catch (error) {
      alert("Failed to delete the blog. Please try again.");
    } finally {
      dispatch(hideLoading());
    }
  };

  const handleUpdate = (id) => {
    navigate(`/admin/blogs/edit/${id}`);
  };

  return (
    <div className="p-4">
      <h1 className="text-gray-900 dark:text-white text-xl font-bold mb-4">
        Admin Blogs
      </h1>
      {error && <p className="text-red-500">{error}</p>}

      <div className="mb-4">
        <label
          htmlFor="searchBlogs"
          className="text-gray-900  dark:text-white mr-2"
        >
          Search Blogs:
        </label>
        <input
          id="searchBlogs"
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by title..."
          className="bg-gray-800 text-white border border-gray-700 px-4 py-2 rounded w-full"
        />
      </div>

      {!filteredBlogs.length && !error && (
        <p className="text-white">No blogs available.</p>
      )}
      {filteredBlogs.length > 0 && (
        <div className="overflow-x-auto">
          <table className="table-auto w-full text-white border-collapse border border-gray-700">
            <thead>
              <tr className="bg-gray-800">
                <th className="border border-gray-700 px-4 py-2 text-center">
                  #
                </th>
                <th className="border border-gray-700 px-4 py-2 text-center">
                  Title
                </th>
                <th className="border border-gray-700 px-4 py-2 text-center">
                  Description
                </th>
                <th className="border border-gray-700 px-4 py-2 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredBlogs.map((blog, index) => (
                <tr key={blog._id} className="bg-gray-900 hover:bg-gray-700">
                  <td className="border text-center border-gray-700 px-4 py-2">
                    {index + 1}
                  </td>
                  <td className="border text-center border-gray-700 px-4 py-2">
                    {blog.title}
                  </td>
                  <td className="border text-center border-gray-700 px-4 py-2">
                    {blog.description.length > 100
                      ? `${blog.description.slice(0, 100)}...`
                      : blog.description}
                  </td>
                  <td className="border border-gray-700 px-4 py-2 flex justify-center space-x-2">
                    <button
                      onClick={() => handleUpdate(blog._id)}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => handleDelete(blog._id)}
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

export default AdminBlogs;
