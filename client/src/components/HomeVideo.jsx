const HomeVideo = () => {
  return (
    <section className="relative mt-12 w-11/12 mx-auto max-w-[1440px] overflow-hidden rounded-xl border border-white/20">
      {/* Responsive container */}
      <div
        className="
          relative 
          h-[220px]            /* Mobile height */
          sm:h-[260px]         /* Small devices */
          md:h-[300px]         /* Tablet */
          lg:h-[450px]         /* Desktop (slim) */
          xl:h-[600px]         /* Large screen */
          overflow-hidden 
          rounded-xl
        "
      >
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src="https://www.youtube.com/embed/ynrLwZOrsBg?autoplay=1&mute=1&loop=1&playlist=ynrLwZOrsBg&controls=1&modestbranding=1&showinfo=0"
          title="Digital Nexgen video"
          frameBorder="0"
          allow="autoplay; fullscreen; encrypted-media"
          allowFullScreen
        ></iframe>
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30 pointer-events-none rounded-xl"></div>
    </section>
  );
};

export default HomeVideo;
