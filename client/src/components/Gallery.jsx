import axios from "axios";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Gallery = ({ category }) => {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchGalleries = async () => {
      try {
        setLoading(true);
        setError(null);

        let response;
        if (category === "hero section") {
          response = await axios.get(`${API_BASE_URL}/api/galleries`);
        } else {
          response = await axios.get(`${API_BASE_URL}/api/galleries`, {
            params: { category },
          });
        }

        setGalleries(response.data);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchGalleries();
  }, [category, API_BASE_URL]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        Loading...
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        Error: {error}
      </div>
    );

  return (
    <div className="p-3 max-w-[1440px] mt-10 mx-auto">
      {/* Masonry layout */}
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6">
        {galleries.map((gallery, index) => {
          const categorySlug = gallery.category
            ?.toLowerCase()
            .replace(/\s+/g, "-");

          return (
            <div
              key={gallery._id}
              className="group break-inside-avoid mb-6 rounded-2xl overflow-hidden relative cursor-pointer"
              onClick={() => {
                if (gallery.serviceId) {
                  navigate(`/${categorySlug}/${gallery.serviceId}`);
                }
              }}
            >
              {/* Image */}
              <img
                src={gallery.image?.url}
                alt={gallery.imageTitle}
                className={`w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                  index % 3 === 0 ? "h-72" : index % 2 === 0 ? "h-52" : "h-40"
                }`}
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="text-white text-sm md:text-base font-semibold text-center px-2">
                  {gallery.imageTitle}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Gallery;

Gallery.propTypes = {
  category: PropTypes.string,
};
