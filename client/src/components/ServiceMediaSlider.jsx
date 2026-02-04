// components/ServiceMediaSlider.jsx
import { useState } from "react";

const ServiceMediaSlider = ({ mediaList, videoUrl }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Combine video with images
  const allMedia = [
    ...(videoUrl ? [{ type: "video", url: videoUrl }] : []),
    ...(mediaList?.map((item) => ({ type: "image", url: item.url })) || []),
  ];

  if (allMedia.length === 0) return null;

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? allMedia.length - 1 : prevIndex - 1,
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === allMedia.length - 1 ? 0 : prevIndex + 1,
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const renderMedia = (media) => {
    if (media.type === "video") {
      // Extract YouTube video ID
      const getYouTubeId = (url) => {
        const regExp =
          /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11 ? match[2] : null;
      };

      const videoId = getYouTubeId(media.url);

      if (videoId) {
        return (
          <div className="relative w-full h-[400px]">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`}
              title="Service Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full rounded-lg"
            />
          </div>
        );
      } else {
        return (
          <div className="w-full h-[400px] flex items-center justify-center bg-gray-800 rounded-lg">
            <p className="text-gray-400">Invalid video URL</p>
          </div>
        );
      }
    } else {
      return (
        <img
          src={media.url}
          alt="Service media"
          className="w-full h-[400px] object-cover rounded-lg"
        />
      );
    }
  };

  return (
    <div className="relative">
      {/* Main Media Display */}
      <div className="mb-4">{renderMedia(allMedia[currentIndex])}</div>

      {/* Navigation Buttons */}
      {allMedia.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full z-10"
          >
            ❮
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full z-10"
          >
            ❯
          </button>
        </>
      )}

      {/* Thumbnails */}
      {allMedia.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto py-2">
          {allMedia.map((media, index) => (
            <div
              key={index}
              className={`cursor-pointer border-2 transition-all flex-shrink-0 ${
                currentIndex === index
                  ? "border-red-500 scale-105"
                  : "border-transparent hover:border-gray-400"
              }`}
              onClick={() => goToSlide(index)}
            >
              {media.type === "video" ? (
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded">
                    <span className="text-white text-2xl">▶</span>
                  </div>
                  <div className="w-20 h-20 bg-gray-800 rounded flex items-center justify-center">
                    <span className="text-gray-400 text-xs">Video</span>
                  </div>
                </div>
              ) : (
                <img
                  src={media.url}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-20 h-20 object-cover rounded"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Indicators/Dots */}
      {allMedia.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {allMedia.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full ${
                currentIndex === index ? "bg-red-500" : "bg-gray-600"
              }`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ServiceMediaSlider;
