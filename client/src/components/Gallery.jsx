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
    <div className="w-11/12 mx-auto py-12">
      <h2 className="text-center text-3xl font-bold text-gray-700 dark:text-white mb-12">
        Made on Digital NexGen
      </h2>

      {/* Masonry / column layout */}
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6">
        {galleries.map((gallery) => (
          <div
            key={gallery._id}
            className="group break-inside-avoid mb-6 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 relative cursor-pointer"
            onClick={async () => {
              const rawRef = gallery.serviceId || gallery.service || null;
              if (!rawRef) {
                const qp = new URLSearchParams({
                  category: gallery.category || "",
                  q: gallery.imageTitle || "",
                }).toString();
                navigate(`/services?${qp}`);
                return;
              }

              if (typeof rawRef === "object" && rawRef !== null) {
                const svc = rawRef._id ? rawRef : rawRef.serviceId || rawRef;
                const subCategory =
                  svc.subCategory || svc.category || "services";
                navigate(`/${subCategory}/${svc._id}`);
                return;
              }

              try {
                const res = await axios.get(
                  `${API_BASE_URL}/api/services/single-service/${rawRef}`,
                );
                const svc = res.data;
                const subCategory =
                  svc.subCategory || svc.category || "services";
                navigate(`/${subCategory}/${svc._id}`);
              } catch (err) {
                const qp = new URLSearchParams({
                  category: gallery.category || "",
                  q: gallery.imageTitle || "",
                }).toString();
                navigate(`/services?${qp}`);
              }
            }}
          >
            {/* Image */}
            <img
              src={gallery.image?.url}
              alt={gallery.imageTitle || "Gallery Image"}
              loading="lazy"
              onLoad={() =>
                setLoadedMap((m) => ({ ...m, [gallery._id]: true }))
              }
              className={`w-full object-cover rounded-t-2xl transition-transform duration-500 group-hover:scale-105 ${
                loadedMap[gallery._id] ? "opacity-100" : "opacity-0"
              }`}
            />

            {/* Skeleton / placeholder */}
            {!loadedMap[gallery._id] && (
              <div className="absolute inset-0 bg-gray-300 dark:bg-gray-700 animate-pulse" />
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Title / category */}
            <div className="absolute bottom-0 w-full p-4 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
              <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2">
                <h3 className="text-white text-sm font-semibold truncate">
                  {gallery.imageTitle}
                </h3>
                <p className="text-white/80 text-xs mt-1 truncate">
                  {gallery.category}
                </p>
              </div>
            </div>
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
