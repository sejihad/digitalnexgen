import CategoryCard from "../components/CategoryCard";
import Hero from "../components/Hero";
// import noise from "../assets/noise.svg";
import BookPublishing from "../assets/WritingTranslation/BookPublishing.jpg";
import ContentWriting from "../assets/WritingTranslation/ContentWriting.jpg";
import Translation from "../assets/WritingTranslation/Translation.jpg";

const WritingTranslation = () => {
  const categories = [
    {
      image: ContentWriting,
      title: "Content Writing",
      links: [
        {
          label: "Blog Writing",
          url: "/writing-translation/blog-writing",
        },
        {
          label: "Copywriting",
          url: "/writing-translation/copywriting",
        },
        {
          label: "Website Content",
          url: "/writing-translation/website-content",
        },
        {
          label: "Creative Writing",
          url: "/writing-translation/creative-writing",
        },
        {
          label: "Speech Writing",
          url: "/writing-translation/speech-writing",
        },
      ],
      //  backgroundImage: noise,
    },
    {
      image: BookPublishing,
      title: "Book & Ebook Publishing",
      links: [
        {
          label: "Book Formatting",
          url: "/writing-translation/book-formatting",
        },
        {
          label: "Book & eBook Writing",
          url: "/writing-translation/book-ebook-writing",
        },
        {
          label: "Beta Reading",
          url: "/writing-translation/beta-reading",
        },
        {
          label: "Proofreading & Editing",
          url: "/writing-translation/proofreading-editing",
        },
      ],
      //  backgroundImage: noise,
    },
    {
      image: Translation,
      title: "Translation & Transcription",
      links: [
        {
          label: "Translation",
          url: "/writing-translation/translation",
        },
        {
          label: "Transcription",
          url: "/writing-translation/transcription",
        },
        {
          label: "Localization",
          url: "/writing-translation/localization",
        },
      ],
      //  backgroundImage: noise,
    },
  ];

  return (
    <div>
      <Hero
        bloomColor1="rgba(0, 255, 170, .8)"
        bloomColor2="rgba(232, 0, 151, 0.8)"
        heroHeight="300px"
        bloomSize="500px"
        title="Writing & Translation"
        paragraph="Get your message across in any language."
      />
      <div>
        <h2 className="text-primaryText dark:text-white font-roboto text-center text-2xl lg:text-3xl font-bold mt-4 border-b-2 border-[#333333] w-[max-content] mx-auto pb-1">
          Featured Writing & Translation
        </h2>
        <div className="w-11/12 mx-auto max-w-[1440px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
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

export default WritingTranslation;
