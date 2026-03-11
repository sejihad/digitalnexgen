import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import animated_logo from "../assets/p-s/a-l.jpg";
import app_development from "../assets/p-s/app-d.jpg";
import book_design from "../assets/p-s/b-d.jpg";
import support_it from "../assets/p-s/s-i.jpg";
import social_media_video_editing from "../assets/p-s/s-m.jpg";
import video_editing from "../assets/p-s/v-e.png";
import visual_effects from "../assets/p-s/vi-e.jpg";
import website_development from "../assets/p-s/w-d.jpg";

const shuffleArray = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const PopularServices = () => {
  const scrollerRef = useRef(null);

  // base list (stable)
  const baseServices = useMemo(
    () => [
      {
        title: "Website Development",
        image: website_development,
        href: "/programming-tech/website-development",
      },
      {
        title: "Support & It",
        image: support_it,
        href: "/programming-tech/support-it",
      },
      {
        title: "Video Editing",
        image: video_editing,
        href: "/video-animation/video-editing",
      },
      {
        title: "Animated Logo",
        image: animated_logo,
        href: "/video-animation/animated-logos",
      },
      {
        title: "Visual Effects",
        image: visual_effects,
        href: "/video-animation/visual-effect",
      },
      {
        title: "Social Media Video Editing",
        image: social_media_video_editing,
        href: "/video-animation/social-media-videos",
      },
      // {
      //   title: "Book Cover Design",
      //   image: architecture_design,
      //   href: "/graphics-design/book-covers",
      // },
      {
        title: "Book Design",
        image: book_design,
        href: "/graphics-design/book-design",
      },
      {
        title: "UI/UX Design",
        image:
          "https://images.unsplash.com/photo-1559028012-481c04fa702d?q=80&w=1200&auto=format&fit=crop",
        href: "/graphics-design/ux-design",
      },
      {
        title: "Apps Development",
        image: app_development,
        href: "/programming-tech/mobile-app-development",
      },
    ],
    [],
  );

  // ✅ shuffled ONCE per page load
  const [services] = useState(() => shuffleArray(baseServices));

  const scrollByAmount = () => {
    const el = scrollerRef.current;
    if (!el) return 320;

    const card = el.querySelector("[data-card='true']");
    const cardWidth = card ? card.getBoundingClientRect().width : 240;
    return Math.max(220, Math.floor(cardWidth + 16));
  };

  const handleNext = () => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: scrollByAmount(), behavior: "smooth" });
  };

  const handlePrev = () => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: -scrollByAmount(), behavior: "smooth" });
  };

  return (
    <section className="w-11/12 max-w-[1440px] mx-auto py-8">
      <h2 className="text-[34px] sm:text-[42px] md:text-[58px] leading-none font-light text-gray-800 dark:text-white mb-6">
        Popular services
      </h2>

      <div className="relative">
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous"
          className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-10
                     w-11 h-11 rounded-full
                     bg-white/90 dark:bg-white/10
                     border border-gray-200 dark:border-white/20
                     shadow-md backdrop-blur
                     items-center justify-center
                     hover:scale-105 transition"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-white" />
        </button>

        <button
          type="button"
          onClick={handleNext}
          aria-label="Next"
          className="absolute -right-2 md:-right-5 top-1/2 -translate-y-1/2 z-10
                     w-12 h-12 rounded-full
                     bg-white/95 dark:bg-white/10
                     border border-gray-200 dark:border-white/20
                     shadow-[0_10px_30px_rgba(0,0,0,0.12)]
                     backdrop-blur
                     flex items-center justify-center
                     hover:scale-105 transition"
        >
          <ChevronRight className="w-6 h-6 text-gray-700 dark:text-white" />
        </button>

        <div
          ref={scrollerRef}
          className="flex gap-4 overflow-x-auto scroll-smooth pb-2 pr-10
                     [scrollbar-width:none] [-ms-overflow-style:none]
                     [&::-webkit-scrollbar]:hidden"
        >
          {services.map((svc, idx) => (
            <a
              key={svc.href} // ✅ better key than idx
              href={svc.href}
              data-card="true"
              className="
                min-w-[210px] sm:min-w-[220px]
                md:min-w-[220px] lg:min-w-[230px] xl:min-w-[240px]
                rounded-2xl
                bg-white dark:bg-white/10
                border border-gray-200/70 dark:border-white/15
                shadow-sm hover:shadow-lg
                transition-all duration-300
                hover:-translate-y-1
                overflow-hidden
              "
            >
              <div className="w-full h-[150px] md:h-[140px] lg:h-[150px] overflow-hidden">
                <img
                  src={svc.image}
                  alt={svc.title}
                  className="w-full h-full object-cover transition-transform duration-500"
                  loading="lazy"
                />
              </div>

              <div className="p-4">
                <h3 className="text-base md:text-[15px] font-semibold text-gray-800 dark:text-white line-clamp-2">
                  {svc.title}
                </h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-300">
                  Explore →
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularServices;
