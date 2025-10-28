import axios from "axios";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
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

  if (loading) return <div className="text-center">Loading...</div>;
  if (error)
    return <div className="text-center text-red-500">Error: {error}</div>;

  return (
    <div className="w-11/12 mx-auto">
      <h2 className="text-center mt-6 mb-16 font-roboto text-primaryText text-2xl font-bold my-6">
        Made on Digital Nexgen
      </h2>
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6">
        {galleries.map((gallery) => (
          <div
            key={gallery._id}
            className="group break-inside-avoid mb-6 rounded-2xl bg-white/5 border border-white/10 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden hover:ring-1 hover:ring-white/20 dark:hover:ring-white/20 hover:-translate-y-0.5 transform-gpu will-change-transform"
          > 
            <div
              className="relative cursor-pointer"
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
                  const subCategory = svc.subCategory || svc.category || "services";
                  navigate(`/${subCategory}/${svc._id}`);
                  return;
                }

                try {
                  const res = await axios.get(`${API_BASE_URL}/api/services/single-service/${rawRef}`);
                  const svc = res.data;
                  const subCategory = svc.subCategory || svc.category || "services";
                  navigate(`/${subCategory}/${svc._id}`);
                } catch (err) {
                  // Fallback to services with helpful filters
                  console.error("Failed to fetch linked service for gallery", err);
                  const qp = new URLSearchParams({
                    category: gallery.category || "",
                    q: gallery.imageTitle || "",
                  }).toString();
                  navigate(`/services?${qp}`);
                }
              }}
            >
              <img
                src={gallery.imageUrl}
                alt={gallery.imageTitle || "Gallery Image"}
                loading="lazy"
                onLoad={() => setLoadedMap((m) => ({ ...m, [gallery._id]: true }))}
                className={`block w-full h-auto object-cover transition-all duration-500 group-hover:scale-[1.01] ${loadedMap[gallery._id] ? "opacity-100" : "opacity-0"} transform-gpu will-change-transform`}
              />
              {!loadedMap[gallery._id] && (
                <div className="absolute inset-0 animate-pulse bg-gray-800/40" />
              )}
              <button
                type="button"
                className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto"
                aria-label="Save"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41.81 4.5 2.09C12.59 4.81 14.26 4 16 4 18.5 4 20.5 6 20.5 8.5c0 3.78-3.4 6.86-8.05 11.54L12 21.35z" />
                </svg>
              </button>
              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                <div className=" rounded-lg p-3  ">
                  <h3 className="text-white text-sm font-medium truncate">{gallery.imageTitle}</h3>
                  <p className="text-white/80 text-xs mt-1 truncate">{gallery.category}</p>
                  
                </div>
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
