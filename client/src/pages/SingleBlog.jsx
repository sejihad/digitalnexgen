import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const SingleBlog = () => {
  const [blog, setBlog] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { id } = useParams();

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/blogs/${id}`,
        );

        setBlog(response.data);
      } catch (error) {
        console.error("Error fetching blog:", error);
      }
    };

    fetchBlog();
  }, [id]);

  if (!blog) {
    return <div className="text-gray-400 text-center mt-10">Loading...</div>;
  }

  const handleThumbnailClick = (index) => {
    setSelectedImageIndex(index);
  };

  return (
    <div className="p-8 max-w-[1440px] w-11/12 mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 font-roboto">
        {blog.title}
      </h1>
      <p className="text-sm text-black dark:text-gray-400 mb-6">
        {" "}
        <span className="font-bold font-openSans">Created At: </span>
        {new Date(blog.createdAt).toLocaleDateString()}
      </p>

      {blog.images && blog.images.length > 0 && (
        <div className="mb-6">
          {/* Main Image */}
          <img
            src={blog.images?.[selectedImageIndex]?.url}
            alt={`Blog Image ${selectedImageIndex + 1}`}
            className="w-full h-[350px] object-cover rounded-md border border-gray-600"
          />
        </div>
      )}

      {/* Thumbnail Images */}
      {blog.images && blog.images.length > 0 && (
        <div
          className="flex gap-2 mt-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-600"
          style={{ whiteSpace: "nowrap" }}
        >
          {blog.images.map((image, index) => (
            <div
              key={index}
              className={`cursor-pointer ${
                selectedImageIndex === index
                  ? "border-red-500"
                  : "border-gray-600"
              }`}
              style={{ flex: "0 0 auto", width: "80px" }}
              onClick={() => handleThumbnailClick(index)}
            >
              <img
                src={image.url}
                alt={`Thumbnail ${index + 1}`}
                className="w-20 h-20 object-cover rounded-md border"
              />
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 text-black dark:text-gray-300 font-openSans">
        {blog.description}
      </div>
    </div>
  );
};

export default SingleBlog;
