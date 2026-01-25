import { useState } from "react";

const GalleryDemo = () => {
  const [loadedMap, setLoadedMap] = useState({});

  // Demo images - online URLs
  const galleries = [
    {
      _id: 1,
      image: {
        url: "https://cloudinary-marketing-res.cloudinary.com/images/w_1000,c_scale/v1679921049/Image_URL_header/Image_URL_header-png?_i=AA",
      },
      imageTitle: "Mountain View",
      category: "Nature",
    },
    {
      _id: 2,
      image: {
        url: "https://the7eagles.com/wp-content/uploads/2024/05/What-is-an-Image-URL_.webp",
      },
      imageTitle: "City Lights",
      category: "Urban",
    },
    {
      _id: 3,
      image: {
        url: "https://www.shutterstock.com/image-vector/address-navigation-bar-https-www-260nw-2572492335.jpg",
      },
      imageTitle: "Forest Trail",
      category: "Adventure",
    },
    {
      _id: 4,
      image: {
        url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9p0uVB1_DdviNeNSs8M2ooGru_QHPGn1ocg&s",
      },
      imageTitle: "Beach Sunset",
      category: "Travel",
    },
    {
      _id: 5,
      image: {
        url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1V773EWGF3ZpYGnIP4GdOg3dc2lI9HiUsZA&s",
      },
      imageTitle: "Desert Dunes",
      category: "Nature",
    },
  ];

  return (
    <div className="w-11/12 mx-auto py-12">
      <h2 className="text-center mb-12 font-roboto text-gray-600 dark:text-white text-2xl font-bold">
        Made on Digital NexGen
      </h2>

      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6">
        {galleries.map((gallery) => (
          <div
            key={gallery._id}
            className="group break-inside-avoid mb-6 rounded-2xl bg-white/5 border border-white/10 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden hover:ring-1 hover:ring-white/20 dark:hover:ring-white/20 hover:-translate-y-0.5 transform-gpu will-change-transform"
          >
            <div className="relative cursor-pointer">
              <img
                src={gallery.image.url}
                alt={gallery.imageTitle || "Gallery Image"}
                loading="lazy"
                onLoad={() =>
                  setLoadedMap((m) => ({ ...m, [gallery._id]: true }))
                }
                className={`block w-full h-auto object-cover transition-all duration-500 group-hover:scale-[1.01] ${
                  loadedMap[gallery._id] ? "opacity-100" : "opacity-0"
                } transform-gpu will-change-transform`}
              />
              {!loadedMap[gallery._id] && (
                <div className="absolute inset-0 animate-pulse bg-gray-800/40" />
              )}

              {/* Gradient overlay */}
              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

              {/* Title & Category */}
              <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                <div className="rounded-lg p-3">
                  <h3 className="text-white text-sm font-medium truncate">
                    {gallery.imageTitle}
                  </h3>
                  <p className="text-white/80 text-xs mt-1 truncate">
                    {gallery.category}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GalleryDemo;
