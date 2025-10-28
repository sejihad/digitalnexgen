import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

const AboutUs = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleServiceClick = (payload) => {
    const { id, category = id, subcategory = null } = payload || {};
    try {
      dispatch({
        type: "services/setActiveService",
        payload: { id, category, subcategory },
      });
    } catch {
      // ignore if slice is not registered; navigation will still work
    }
    navigate(`/services#${category}`);
  };
  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Hero */}
<h1 className="text-4xl font-bold text-center p-14 text-primaryRgb">About Us</h1>
      {/* Main Content */}
      <div className="container mx-auto px-5 lg:px-0 py-12 md:py-16 space-y-16">
        {/* About Digital NexGen */}
        <section>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-3xl mb-6  font-bold text-primaryRgb">About Digital NexGen</h2>
              <p>
                At Digital NexGen, we&apos;re your one-stop solution for all things in Information Technology. With a focus on excellence and innovation, we offer a wide range of services to help your business improve in the digital world.
              </p>
              <p>
                From Digital Marketing to App Development, Web Design to Cybersecurity, and everything in between, we&apos;ve got you covered. Our team of experts is dedicated to delivering top-notch solutions tailored to your unique needs.
              </p>
            </div>
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-tr from-primaryRgb/20 to-emerald-400/20 rounded-2xl blur-lg dark:from-primaryRgb/10 dark:to-emerald-300/10"></div>
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop"
                alt="Digital NexGen team collaborating"
                className="relative w-full aspect-video object-cover rounded-2xl shadow-xl ring-1 ring-black/5 dark:ring-white/10"
                loading="lazy"
              />
            </div>
          </div>
        </section>

        {/* Your Complete Digital Solution */}
        <section>
       
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-tr from-primaryRgb/20 to-emerald-400/20 rounded-2xl blur-lg dark:from-primaryRgb/10 dark:to-emerald-300/10"></div>
              <img
                src="https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=1200&auto=format&fit=crop"
                alt="Comprehensive digital solutions illustration"
                className="relative w-full aspect-video object-cover rounded-2xl shadow-xl ring-1 ring-black/5 dark:ring-white/10"
                loading="lazy"
              />
            </div>
            <div>
                 <h2 className="text-3xl font-bold mb-6 text-primaryRgb">Your Complete Digital Solution</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                At Digital NexGen, we cover all your digital needs. We provide comprehensive solutions for all your digital needs, ensuring your success across various online platforms. Let us handle your digital journey, so you can focus on growing your business hassle-free.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-8 text-primaryRgb">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            <Link to="/services#digital-marketing" onClick={() => handleServiceClick({ id: "digital-marketing", category: "digital-marketing" })} className="group h-full flex flex-col bg-white/70 dark:bg-gray-800/70 backdrop-blur p-6 rounded-2xl border border-black/5 dark:border-white/10 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[rgb(12,187,20)]/60" aria-label="Digital Marketing">
              <h3 className="text-xl font-semibold mb-3">Digital Marketing</h3>
              <p className="text-gray-700 dark:text-gray-300">
                In the 21st century, Digital Marketing is essential for your business. It must be strategic, data-driven, engaging, and cost-effective to boost your online presence. Our digital marketing package offers comprehensive solutions, including SEO, social media, and email campaigns, ensuring you get maximum ROI without extra costs.
              </p>
              <span className="mt-auto inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md bg-[rgb(12,187,20)] text-white/90 group-hover:text-white transition">Read more</span>
            </Link>

            <Link to="/services#graphics-design" onClick={() => handleServiceClick({ id: "graphics-design", category: "graphics-design", subcategory: "graphics-design" })} className="group h-full flex flex-col bg-white/70 dark:bg-gray-800/70 backdrop-blur p-6 rounded-2xl border border-black/5 dark:border-white/10 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[rgb(12,187,20)]/60" aria-label="Graphics Design">
              <h3 className="text-xl font-semibold mb-3">Graphics Design</h3>
              <p className="text-gray-700 dark:text-gray-300">
                At our IT agency, we&apos;re the wizards of making things look great! We specialize in graphic design, which is all about creating eye-catching images and visuals. From logos to posters to digital artwork, we&apos;ve got the magic touch to make your brand shine. Our team of creative geniuses will work closely with you to turn your ideas into stunning visuals that grab attention and leave a lasting impression. Let&apos;s sprinkle some magic on your brand!
              </p>
              <span className="mt-auto inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md bg-[rgb(12,187,20)] text-white/90 group-hover:text-white transition">Read more</span>
            </Link>

            <Link to="/services#graphics-design" onClick={() => handleServiceClick({ id: "web-design", category: "graphics-design", subcategory: "web-design" })} className="group h-full flex flex-col bg-white/70 dark:bg-gray-800/70 backdrop-blur p-6 rounded-2xl border border-black/5 dark:border-white/10 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[rgb(12,187,20)]/60" aria-label="Web Design">
              <h3 className="text-xl font-semibold mb-3">Web Design</h3>
              <p className="text-gray-700 dark:text-gray-300">
                At our IT agency, we&apos;re here to make your online presence shine! We specialize in web design, crafting websites that captivate attention and inspire trust. Our team is dedicated to creating visually stunning designs that not only catch the eye but also build trust with your visitors. With user-friendly layouts and seamless navigation, we ensure that every interaction with your website leaves a lasting impression.
              </p>
              <span className="mt-auto inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md bg-[rgb(12,187,20)] text-white/90 group-hover:text-white transition">Read more</span>
            </Link>

            <Link to="/services#programming-tech" onClick={() => handleServiceClick({ id: "web-development", category: "programming-tech", subcategory: "website-development" })} className="group h-full flex flex-col bg-white/70 dark:bg-gray-800/70 backdrop-blur p-6 rounded-2xl border border-black/5 dark:border-white/10 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[rgb(12,187,20)]/60" aria-label="Web Development">
              <h3 className="text-xl font-semibold mb-3">Web Development</h3>
              <p className="text-gray-700 dark:text-gray-300">
                In the 21st century, most activities are now conducted online. Establishing a strong online presence is important to have a website showcasing your work and business. The website should be mobile-friendly, easy to navigate, and offer a great user experience. At Digital NexGen, we specialize in building modern and high-quality websites for individuals, businesses, and enterprises using the latest technologies and best practices.
              </p>
              <span className="mt-auto inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md bg-[rgb(12,187,20)] text-white/90 group-hover:text-white transition">Read more</span>
            </Link>

            <Link to="/services#programming-tech" onClick={() => handleServiceClick({ id: "app-development", category: "programming-tech", subcategory: "mobile-app-development" })} className="group h-full flex flex-col bg-white/70 dark:bg-gray-800/70 backdrop-blur p-6 rounded-2xl border border-black/5 dark:border-white/10 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[rgb(12,187,20)]/60" aria-label="App Development">
              <h3 className="text-xl font-semibold mb-3">App Development</h3>
              <p className="text-gray-700 dark:text-gray-300">
                At our IT agency, we make phone apps. We take your ideas and turn them into cool apps you can use on your phone or tablet. Our team knows all the latest tricks to make sure your app looks great and works smoothly. Whether it&apos;s a game, a tool, or something fun, we&apos;re here to help you bring it to life. We&apos;ll work closely with you to make sure the app is just the way you want it. Let&apos;s make something awesome together! We trust that we are perfect.
              </p>
              <span className="mt-auto inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md bg-[rgb(12,187,20)] text-white/90 group-hover:text-white transition">Read more</span>
            </Link>

            <Link to="/services#programming-tech" onClick={() => handleServiceClick({ id: "cyber-security", category: "programming-tech", subcategory: "cyber-security" })} className="group h-full flex flex-col bg-white/70 dark:bg-gray-800/70 backdrop-blur p-6 rounded-2xl border border-black/5 dark:border-white/10 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[rgb(12,187,20)]/60" aria-label="Cyber Security">
              <h3 className="text-xl font-semibold mb-3">Cyber Security</h3>
              <p className="text-gray-700 dark:text-gray-300">
                At our IT agency, we specialize in keeping your digital world safe from cyber threats through our cybersecurity and ethical hacking services. We understand the importance of protecting your sensitive information and systems from malicious attacks. Our team of experts employs advanced techniques to identify vulnerabilities in your network and applications, just like ethical hackers would, but with the sole intention of strengthening your defenses. By proactively addressing weaknesses, we help prevent cyber-attacks and safeguard your valuable assets. With our cybersecurity and ethical hacking expertise, you can rest assured that your digital assets are in safe hands.
              </p>
              <span className="mt-auto inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md bg-[rgb(12,187,20)] text-white/90 group-hover:text-white transition">Read more</span>
            </Link>

            <Link to="/services#writing-translation" onClick={() => handleServiceClick({ id: "book-formatting", category: "writing-translation", subcategory: "book-formatting" })} className="group h-full flex flex-col bg-white/70 dark:bg-gray-800/70 backdrop-blur p-6 rounded-2xl border border-black/5 dark:border-white/10 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[rgb(12,187,20)]/60" aria-label="Book Formatting">
              <h3 className="text-xl font-semibold mb-3">Book Formatting</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Book formatting is the process of making a book look good and easy to read. It involves things like choosing the right font and size for the text, setting margins and spacing between lines and paragraphs, adding headers and footers with page numbers, and making sure chapter titles stand out. Good formatting makes a book look professional and helps readers enjoy the content without distractions.
              </p>
              <span className="mt-auto inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md bg-[rgb(12,187,20)] text-white/90 group-hover:text-white transition">Read more</span>
            </Link>
          </div>
        </section>

      
      </div>
    </div>
  );
};

export default AboutUs;
