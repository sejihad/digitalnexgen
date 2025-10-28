import Hero from "../components/Hero";
// import noise from "../assets/noise.svg";
import CategoryCard from "../components/CategoryCard";
import Animation from "../assets/VideoAnimation/Animation.jpg";
import EditingPostProduction from "../assets/VideoAnimation/EditingPostProduction.jpg";
import MotionGraphics from "../assets/VideoAnimation/MotionGraphics.jpg";
import SocialMarketingVideo from "../assets/VideoAnimation/SocialMarketingVideo.jpg";

const VideoAnimation = () => {
  const categories = [
    {
      image: EditingPostProduction,
      title: "Editing & Post Production",
      links: [
        {
          label: "Video Editing",
          url: "/video-animation/video-editing",
        },
        {
          label: "Visual Effect",
          url: "/video-animation/visual-effect",
        },
        {
          label: "Intro & Outro Videos",
          url: "/video-animation/intro-outro-videos",
        },
        {
          label: "Video Templates Editing",
          url: "/video-animation/video-templates-editing",
        },
        {
          label: "Subtitle & Captions",
          url: "/video-animation/subtitle-captions",
        },
      ],
        //  backgroundImage: noise,
    },
    {
      image: Animation,
      title: "Animation",
      links: [
        {
          label: "2D Animation",
          url: "/video-animation/2d-animation",
        },
        {
          label: "3D Animation",
          url: "/video-animation/3d-animation",
        },
        {
          label: "Character Animation",
          url: "/video-animation/character-animation",
        },
        {
          label: "Whiteboard Animation",
          url: "/video-animation/whiteboard-animation",
        },
        {
          label: "Explainer Videos",
          url: "/digital-marketing/explainer-videos",
        },
      ],
        //  backgroundImage: noise,
    },
    {
      image: MotionGraphics,
      title: "Motion Graphics",
      links: [
        {
          label: "Animated Logos",
          url: "/video-animation/animated-logos",
        },
        {
          label: "Lottie & Web Animation",
          url: "/video-animation/lottie-web-animation",
        },
        {
          label: "Text Animation",
          url: "/video-animation/text-animation",
        },
        {
          label: "Motion Tracking",
          url: "/video-animation/motion-tracking",
        },
        {
          label: "Transition & Effects",
          url: "/video-animation/transition-effects",
        },
      ],
        //  backgroundImage: noise,
    },
    {
      image: SocialMarketingVideo,
      title: "Social & Marketing Videos",
      links: [
        {
          label: "Video & Commercials",
          url: "/video-animation/video-commercials",
        },
        {
          label: "Social Media Videos",
          url: "/video-animation/social-media-videos",
        },
        { label: "Slideshow Videos", 
          url: "/video-animation/slideshow-videos" },
        {
          label: "Explainer Video Production",
          url: "/video-animation/explainer-video-production",
        },
      ],
        //  backgroundImage: noise,
    },
  ];

  return (
    <div>
      <Hero
        bloomColor1="rgba(12, 187, 20, 0.8)"  //change to 
        bloomColor2="rgba(12, 187, 20, 0.8)"
        heroHeight="300px"
        bloomSize="500px"
        title="Video & Animation"
        paragraph="Bring your story to life with creative videos."
      />
      <div>
        <h2 className="dark:text-white text-primaryText font-roboto text-center text-2xl lg:text-3xl font-bold mt-4 border-b-2 border-[#333333] w-[max-content] mx-auto pb-1">
          Featured Video & Animation
        </h2>
        <div className="w-11/12 mx-auto max-w-[1440px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {categories.map((category, index) => (
            <CategoryCard
              key={index}
              image={category.image}
              title={category.title}
              links={category.links}
              backgroundImage={category.backgroundImage}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoAnimation;
