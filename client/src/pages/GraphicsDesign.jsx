import CategoryCard from "../components/CategoryCard";
import Hero from "../components/Hero";
// import noise from "../assets/noise.svg";
import ArtIllustration from "../assets/GraphicsDesign/ArtIllustration.jpg";
import CoverPackageDesign from "../assets/GraphicsDesign/CoverPackageDesign.jpg";
import Design3d from "../assets/GraphicsDesign/Design3d.jpg";
import FashionDesign from "../assets/GraphicsDesign/FashionDesign.jpg";
import LogoBrand from "../assets/GraphicsDesign/LogoBrand.jpg";
import MarketingDesign from "../assets/GraphicsDesign/MarketingDesign.jpg";
import VisualDesign from "../assets/GraphicsDesign/VisualDesign.jpg";
import WebAppDesign from "../assets/GraphicsDesign/WebAppDesign.jpg";

const GraphicsDesign = () => {
  const categories = [
    {
      image: LogoBrand,
      title: "Logo & Brand Identity",
      links: [
        {
          label: "Logo Design",
          url: "/graphics-design/logo-design",
        },
        {
          label: "Brand Style Guides",
          url: "/graphics-design/brand-style-guides",
        },
        {
          label: "Business Cards Stationary",
          url: "/graphics-design/business-cards-stationary",
        },
        {
          label: "Fonts & Typography",
          url: "/graphics-design/fonts-typography",
        },
      ],
      // backgroundImage: noise,
    },
    {
      image: WebAppDesign,
      title: "Web & App Design",
      links: [
        {
          label: "Web Design",
          url: "/graphics-design/web-design",
        },
        {
          label: "App Design",
          url: "/graphics-design/app-design",
        },
        {
          label: "UX Design",
          url: "/graphics-design/ux-design",
        },
        {
          label: "Landing Page Design",
          url: "/graphics-design/landing-page-design",
        },
        {
          label: "Icon Design",
          url: "/graphics-design/icon-design",
        },
      ],
      // backgroundImage: noise,
    },
    {
      image: ArtIllustration,
      title: "Art & Illustration",
      links: [
        {
          label: "Illustration",
          url: "/graphics-design/illustration",
        },
        {
          label: "Children's Book Illustration",
          url: "/graphics-design/children-book-illustration",
        },
        {
          label: "Pattern Design",
          url: "/graphics-design/pattern-design",
        },
        {
          label: "Cartoon & Comics",
          url: "/graphics-design/cartoon-comics",
        },
      ],
      // backgroundImage: noise,
    },
    {
      image: VisualDesign,
      title: "Visual Design",
      links: [
        {
          label: "Image Editing",
          url: "/graphics-design/image-editing",
        },
        {
          label: "Presentation Design",
          url: "/graphics-design/presentation-design",
        },
        {
          label: "Infographic Design",
          url: "/graphics-design/infographic-design",
        },
        {
          label: "Resume Design",
          url: "/graphics-design/resume-design",
        },
      ],
      // backgroundImage: noise,
    },
    {
      image: CoverPackageDesign,
      title: "Cover & Package Design",
      links: [
        {
          label: "Packaging & Label Design",
          url: "/graphics-design/packaging-label-design",
        },
        {
          label: "Book Design",
          url: "/graphics-design/book-design",
        },
        {
          label: "Book Covers",
          url: "/graphics-design/book-covers",
        },
        {
          label: "Album Cover Design",
          url: "/graphics-design/album-cover-design",
        },
      ],
      // backgroundImage: noise,
    },
    {
      image: MarketingDesign,
      title: "Marketing Design",
      links: [
        {
          label: "Social Media Design",
          url: "/graphics-design/social-media-design",
        },
        {
          label: "Thumbnail Design",
          url: "/graphics-design/thumbnail-design",
        },
        {
          label: "Email Design",
          url: "/graphics-design/email-design",
        },
        {
          label: "Web Banners",
          url: "/graphics-design/web-banners",
        },
      ],
      // backgroundImage: noise,
    },
    {
      image: FashionDesign,
      title: "Fashion & Marchandise",
      links: [
        {
          label: "T-Shirt & Marchandise",
          url: "/graphics-design/t-shirt-marchandise",
        },
        {
          label: "Fashion Design",
          url: "/graphics-design/fashion-design",
        },
        {
          label: "Jewelry Design",
          url: "/graphics-design/jewelry-design",
        },
      ],
      // backgroundImage: noise,
    },
    {
      image: Design3d,
      title: "3D Design",
      links: [
        {
          label: "3D Architecture",
          url: "/graphics-design/3d-architecture",
        },
        {
          label: "3D Industrial Design",
          url: "/graphics-design/3d-industrial-design",
        },
        {
          label: "3D Fashion & Garment",
          url: "/graphics-design/3d-fashion-garment",
        },
        {
          label: "3D Landscape Design",
          url: "/graphics-design/3d-landscape-design",
        },
        {
          label: "3D Jewelry Design",
          url: "/graphics-design/3d-jewelry-design",
        },
      ],
      // backgroundImage: noise,
    },
  ];
  return (
    <div>
      <Hero
        bloomColor1="rgba(255, 255, 0, 0.8)"
        bloomColor2="rgba(232, 0, 151, 0.8)"
        heroHeight="300px"
        bloomSize="500px"
        title="Graphics & Design"
        paragraph="Designs that make your brand impossible to ignore."
      />
      <div>
        <h2 className="text-primaryText dark:text-white font-roboto text-center text-2xl lg:text-3xl font-bold mt-4 border-b-2 border-[#333333] w-[max-content] mx-auto pb-1">
          Featured Graphics & Design
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

export default GraphicsDesign;
