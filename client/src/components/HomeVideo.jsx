import React from "react";
import HeroVideo from "../assets/Videos/home-video.mp4";

const HomeVideo = () => {
  return (
    <section className="relative mt-8 w-11/12 mx-auto max-w-[1440px] overflow-hidden">
      <video
        src={HeroVideo}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover rounded-xl border border-white/20"
      ></video>
      <div className="absolute inset-0 bg-black/30"></div>
    </section>
  );
};

export default HomeVideo;
