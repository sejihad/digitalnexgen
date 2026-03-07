import { Building2, Mail, MapPin, Phone, Users } from "lucide-react";

const companyDetails = [
  {
    icon: Building2,
    label: "Company Name",
    value: "Digital NexGen LTD",
  },
  {
    icon: Building2,
    label: "Company Number",
    value: "16930063",
  },
  {
    icon: MapPin,
    label: "Address",
    value:
      "Suite A, 82 James Carter Road, Mildenhall, Bury St. Edmunds, United Kingdom, IP28 7DE",
  },
  {
    icon: Mail,
    label: "Email",
    value: "info@digitalnexgen.co",
    href: "mailto:info@digitalnexgen.co",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+44 7482 799 921",
    href: "tel:+447482799921",
  },
  {
    icon: Users,
    label: "Team Members",
    value: "21+",
  },
];

const AboutUs = () => {
  return (
    <div className="min-h-screen container mx-auto bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-gray-200 dark:border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950" />
        <div className="absolute -top-10 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-emerald-400/20 blur-3xl dark:bg-emerald-500/10" />
        <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-500/10" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 text-center">
          <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-300">
            About Digital NexGen
          </div>

          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white">
            Empowering Businesses
            <span className="block text-emerald-600 dark:text-emerald-400">
              Through Digital Innovation
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-base sm:text-lg leading-8 text-gray-600 dark:text-gray-300">
            Digital NexGen LTD is a global digital solutions company helping
            businesses grow faster, smarter, and stronger in the modern digital
            world.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Left content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm dark:border-gray-800 dark:bg-gray-800/60">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                About Us – Digital NexGen
              </h2>

              <div className="mt-6 space-y-5 text-gray-700 dark:text-gray-300 leading-8 text-base sm:text-lg">
                <p>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Digital NexGen LTD
                  </span>{" "}
                  is a global digital solutions company dedicated to helping
                  businesses grow in the modern digital world. Founded in{" "}
                  <span className="font-semibold">2022</span> in the{" "}
                  <span className="font-semibold">United Kingdom</span>, the
                  company provides innovative and result-driven services to
                  clients worldwide.
                </p>

                <p>
                  At Digital NexGen, we specialize in digital marketing, website
                  development, app development, graphic design, and technology
                  solutions. Our mission is to help businesses build a strong
                  online presence, reach their target audience, and achieve
                  long-term success.
                </p>

                <p>
                  With a talented team of{" "}
                  <span className="font-semibold">
                    21+ skilled professionals
                  </span>
                  , we combine creativity, technology, and strategy to deliver
                  high-quality services. Our experts work closely with clients
                  to understand their goals and create customized solutions that
                  bring real results.
                </p>

                <p>
                  We believe that the future belongs to businesses that embrace
                  digital transformation. That’s why Digital NexGen focuses on
                  innovation, reliability, and customer satisfaction in every
                  project we deliver.
                </p>

                <p>
                  Whether you are a startup, entrepreneur, or established
                  company, Digital NexGen is committed to helping you grow
                  faster and smarter in the digital era.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-800/60">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Founded
                </p>
                <h3 className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  2022
                </h3>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-800/60">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Team Size
                </p>
                <h3 className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  21+
                </h3>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-800/60">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Based In
                </p>
                <h3 className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  UK
                </h3>
              </div>
            </div>
          </div>

          {/* Right details card */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 sm:p-8 shadow-sm dark:border-gray-800 dark:from-gray-800 dark:to-gray-900">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Company Details
              </h2>
              <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Official company information for Digital NexGen LTD.
              </p>

              <div className="mt-6 space-y-4">
                {companyDetails.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800/80"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                          <Icon className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            {item.label}
                          </p>

                          {item.href ? (
                            <a
                              href={item.href}
                              className="mt-1 block break-words text-base font-semibold text-gray-900 hover:text-emerald-600 dark:text-white dark:hover:text-emerald-400"
                            >
                              {item.value}
                            </a>
                          ) : (
                            <p className="mt-1 break-words text-base font-semibold text-gray-900 dark:text-white">
                              {item.value}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 rounded-2xl bg-emerald-50 p-4 text-sm leading-7 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200">
                We are committed to innovation, reliability, and customer
                satisfaction in every project we deliver.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
