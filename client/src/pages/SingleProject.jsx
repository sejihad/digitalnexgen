import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const SingleProject = () => {
  const [project, setProject] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoom, setZoom] = useState(1);

  const { id } = useParams();

  // Carousel removed; no nav refs needed

  useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = "hidden"; // disable background scroll
    } else {
      document.body.style.overflow = "auto"; // enable scroll back
    }

    // Clean up on unmount
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [selectedImage]);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/projects/${id}`,
        );
        setProject(response.data);
      } catch (error) {
        console.error("Error fetching project:", error);
      }
    };

    fetchProject();
  }, [id]);

  if (!project) {
    return <div className="text-gray-400 text-center mt-10">Loading...</div>;
  }

  return (
    <div className="p-6  md:p-12 max-w-[1200px] w-11/12 mx-auto ">
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold font-roboto tracking-tight text-primaryText dark:text-white mb-6">
        {project.title}
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
        {/* Gallery column */}

        <div className="lg:col-span-2">
          {project.videoUrl && (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg mb-6 bg-white/5 border border-white/10 hover:shadow-xl transition hover:ring-1 hover:ring-primaryRgb/60">
              <iframe
                src={project.videoUrl}
                title="Project Video"
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
              />
            </div>
          )}

          {/* Image Grid (carousel removed) */}
          {project.images && project.images.length > 0 && (
            <div className="w-full">
              <div className="columns-1 sm:columns-2 md:columns-3 gap-4 [column-fill:_balance]">
                {project.images.map((image, idx) => (
                  <div
                    key={idx}
                    className="mb-4 break-inside-avoid overflow-hidden rounded-2xl group relative cursor-zoom-in bg-white/5 border border-white/10 shadow-sm hover:shadow-lg transition hover:ring-1 hover:ring-primaryRgb/60"
                    onClick={() => setSelectedImage(image.url)}
                  >
                    <img
                      src={image.url}
                      alt={`img-${idx}`}
                      className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                    <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Details column */}
        <aside className="lg:col-span-1 lg:sticky lg:top-6 self-start">
          <div className="bg-white rounded-2xl shadow-sm p-6 dark:bg-white/10 dark:shadow-lg border border-gray-100 dark:border-white/20">
            <h2 className="text-2xl font-semibold mb-3 text-primaryText dark:text-[#ededed]">
              Project Details
            </h2>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {project.description}
            </p>

            {project.tags && (
              <div className="mb-4 flex flex-wrap gap-2">
                {project.tags.map((t, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-700 dark:bg-white/10 dark:text-white dark:border dark:border-white/10"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-6 text-sm text-gray-500">
              <div>
                <strong>Client:</strong> {project.client || "—"}
              </div>
              <div>
                <strong>Delivered:</strong>{" "}
                {new Date(project.createdAt).toLocaleDateString()}
              </div>
            </div>

            {/* Category / Technologies */}
            <div className="mt-6 text-sm text-gray-500">
              <div className="mb-2">
                <strong>Category:</strong> {project.category || "—"}
              </div>

              {project.technologies && (
                <div className="mt-2">
                  <div className="mb-1 font-medium text-gray-600 dark:text-gray-300">
                    Technologies Used
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(project.technologies) ? (
                      project.technologies.map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700 dark:bg-white/10 dark:text-white dark:border dark:border-white/10"
                        >
                          {tech}
                        </span>
                      ))
                    ) : (
                      <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700 dark:bg-white/10 dark:text-white dark:border dark:border-white/10">
                        {project.technologies}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full text-center bg-primaryRgb text-white px-4 py-2 rounded-lg font-semibold mt-6 shadow-lg hover:shadow-xl hover:opacity-95 transition transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primaryRgb/60"
              >
                View Live
              </a>
            )}
          </div>
        </aside>
      </div>

      {/* Modal Preview */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-[90vw] max-h-[90vh] w-full flex items-center justify-center">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full shadow-lg backdrop-blur-sm z-20 transition"
              aria-label="Close preview"
            >
              ✕
            </button>
            <img
              src={selectedImage}
              alt="Preview"
              className="rounded-lg shadow-xl max-w-full max-h-[90vh] object-contain transition-transform duration-300"
              style={{ transform: `scale(${zoom})` }}
              onClick={() => setZoom((prev) => (prev === 1 ? 2 : 1))}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleProject;
