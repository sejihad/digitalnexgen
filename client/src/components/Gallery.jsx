import axios from "axios";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Gallery = ({ category }) => {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadedMap, setLoadedMap] = useState({});
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
      {/* <h2 className="text-center text-3xl font-bold text-gray-700 dark:text-white mb-12">
        Made on Digital NexGen
      </h2> */}

      {/* Masonry / column layout */}
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6">
        {galleries.map((gallery, index) => (
          <div
            key={gallery._id}
            className="group break-inside-avoid mb-6 rounded-2xl overflow-hidden"
          >
            <img
              src={gallery.image?.url}
              className={`w-full object-cover ${
                index % 3 === 0 ? "h-72" : index % 2 === 0 ? "h-52" : "h-40"
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;

Gallery.propTypes = {
  category: PropTypes.string,
};
