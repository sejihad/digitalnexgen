import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Hero from "../components/Hero";
import { hideLoading, showLoading } from "../redux/loadingSlice";

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      dispatch(showLoading());
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/blogs`,
        );

        setBlogs(response.data);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        dispatch(hideLoading());
      }
    };

    fetchBlogs();
  }, [dispatch]);

  return (
    <>
      <Hero
        bloomColor1="rgba(100, 160, 255, 0.8)"
        bloomColor2="rgba(255, 122, 94, 0.8)"
        heroHeight="300px"
        bloomSize="500px"
        title="Voices Behind the Screen"
        paragraph="Explore stories, insights, and ideas shared from every corner of the world."
      />

      <div className="py-8 max-w-[1440px] w-11/12 mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-gray-200 font-roboto">
          Our Blogs
        </h1>
        {blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <div
                key={blog._id}
                className="dark:bg-[#2b2b2b] text-gray-300 shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                onClick={() => navigate(`/blog/${blog._id}`)}
              >
                <img
                  src={blog.images?.[0]?.url}
                  alt={blog.title}
                  className="w-full h-48 object-cover"
                />

                <div className="p-4">
                  <h2 className="text-xl text-gray-900 dark:text-gray-200 font-semibold mb-2 font-roboto">
                    {blog.title}
                  </h2>
                  <p className="text-gray-900 dark:text-gray-400 line-clamp-3 font-openSans">
                    {blog.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500">No blogs available.</div>
        )}
      </div>
    </>
  );
};

export default Blog;
