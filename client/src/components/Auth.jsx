import { useState } from "react";
import element1 from "../assets/elements/element-1.png";
import element2 from "../assets/elements/element-2.png";
import GoogleIcon from "../assets/icons/google.png";
import Logo from "../assets/logo.png";
import DarkLogo from "../assets/DarkLogo.png"
import InputField from "./InputField";

const Auth = ({
  mode,
  onSubmit,
  credentials,
  onChange,
  onFileChange,
  isLoading,
  error,
}) => {
  const [countries] = useState([
    "Afghanistan",
    "Albania",
    "Algeria",
    "Andorra",
    "Angola",
    "Antigua and Barbuda",
    "Argentina",
    "Armenia",
    "Australia",
    "Austria",
    "Azerbaijan",
    "Bahamas",
    "Bahrain",
    "Bangladesh",
    "Barbados",
    "Belarus",
    "Belgium",
    "Belize",
    "Benin",
    "Bhutan",
    "Bolivia",
    "Bosnia and Herzegovina",
    "Botswana",
    "Brazil",
    "Brunei",
    "Bulgaria",
    "Burkina Faso",
    "Burundi",
    "Cabo Verde",
    "Cambodia",
    "Cameroon",
    "Canada",
    "Central African Republic",
    "Chad",
    "Chile",
    "China",
    "Colombia",
    "Comoros",
    "Congo (Congo-Brazzaville)",
    "Costa Rica",
    "Croatia",
    "Cuba",
    "Cyprus",
    "Czechia (Czech Republic)",
    "Democratic Republic of the Congo",
    "Denmark",
    "Djibouti",
    "Dominica",
    "Dominican Republic",
    "Ecuador",
    "Egypt",
    "El Salvador",
    "Equatorial Guinea",
    "Eritrea",
    "Estonia",
    "Eswatini ",
    "Ethiopia",
    "Fiji",
    "Finland",
    "France",
    "Gabon",
    "Gambia",
    "Georgia",
    "Germany",
    "Ghana",
    "Greece",
    "Grenada",
    "Guatemala",
    "Guinea",
    "Guinea-Bissau",
    "Guyana",
    "Haiti",
    "Holy See",
    "Honduras",
    "Hungary",
    "Iceland",
    "India",
    "Indonesia",
    "Iran",
    "Iraq",
    "Ireland",
    "Israel",
    "Italy",
    "Jamaica",
    "Japan",
    "Jordan",
    "Kazakhstan",
    "Kenya",
    "Kiribati",
    "Kuwait",
    "Kyrgyzstan",
    "Laos",
    "Latvia",
    "Lebanon",
    "Lesotho",
    "Liberia",
    "Libya",
    "Liechtenstein",
    "Lithuania",
    "Luxembourg",
    "Madagascar",
    "Malawi",
    "Malaysia",
    "Maldives",
    "Mali",
    "Malta",
    "Marshall Islands",
    "Mauritania",
    "Mauritius",
    "Mexico",
    "Micronesia",
    "Moldova",
    "Monaco",
    "Mongolia",
    "Montenegro",
    "Morocco",
    "Mozambique",
    "Myanmar (formerly Burma)",
    "Namibia",
    "Nauru",
    "Nepal",
    "Netherlands",
    "New Zealand",
    "Nicaragua",
    "Niger",
    "Nigeria",
    "North Korea",
    "North Macedonia",
    "Norway",
    "Oman",
    "Pakistan",
    "Palau",
    "Palestine State",
    "Panama",
    "Papua New Guinea",
    "Paraguay",
    "Peru",
    "Philippines",
    "Poland",
    "Portugal",
    "Qatar",
    "Romania",
    "Russia",
    "Rwanda",
    "Saint Kitts and Nevis",
    "Saint Lucia",
    "Saint Vincent and the Grenadines",
    "Samoa",
    "San Marino",
    "Sao Tome and Principe",
    "Saudi Arabia",
    "Senegal",
    "Serbia",
    "Seychelles",
    "Sierra Leone",
    "Singapore",
    "Slovakia",
    "Slovenia",
    "Solomon Islands",
    "Somalia",
    "South Africa",
    "South Korea",
    "South Sudan",
    "Spain",
    "Sri Lanka",
    "Sudan",
    "Suriname",
    "Sweden",
    "Switzerland",
    "Syria",
    "Tajikistan",
    "Tanzania",
    "Thailand",
    "Timor-Leste",
    "Togo",
    "Tonga",
    "Trinidad and Tobago",
    "Tunisia",
    "Turkey",
    "Turkmenistan",
    "Tuvalu",
    "Uganda",
    "Ukraine",
    "United Arab Emirates",
    "United Kingdom",
    "United States of America",
    "Uruguay",
    "Uzbekistan",
    "Vanuatu",
    "Venezuela",
    "Vietnam",
    "Yemen",
    "Zambia",
    "Zimbabwe",
  ]);
  const isSignUp = mode === "sign-up";

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL
      }/api/auth/googlelogin`;
  };

  const handleFacebookLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL
      }/api/auth/facebooklogin`;
  };

  return (
    <div className="max-w-[1440px] flex items-center justify-center  py-4 mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row w-full lg:w-[90%] px-8 py-8 rounded-xl justify-between items-center mx-auto dark:bg-[#222222]  gap-6 lg:gap-16px">
        <div className="w-full lg:w-[400px]">
          <div className="flex flex-col gap-6">
            <div className="text-primaryText dark:text-[#ededed] flex flex-col gap-5">
              <div className="flex justify-center lg:justify-start">
                <img
                  src={Logo}
                  alt="Logo"
                  className="dark:hidden ml-[-15px] mb-2"
                />
                <img
                  src={DarkLogo}
                  alt="Logo Of Digital NexGen"
                  className=" hidden dark:block ml-[-15px] mb-2"
                />
              </div>
              <div>
                <h3 className="text-2xl font-openSans font-medium text-center lg:text-left">
                  {isSignUp ? "Get Started" : "Welcome Back"}
                </h3>
                <p className="font-openSans text-base text-[#777777] text-center lg:text-left">
                  {isSignUp
                    ? "Welcome to Eagle Boost - Let's create your account"
                    : "Let's sign in to your account"}
                </p>
              </div>
            </div>
            <form className="flex flex-col gap-3" onSubmit={onSubmit}>
              <InputField
                label="Username"
                id="username"
                type="text"
                name="username"
                value={credentials.username}
                onChange={onChange}
                required
              />
              <InputField
                label="Password"
                id="password"
                type="password"
                name="password"
                value={credentials.password}
                onChange={onChange}
                required
              />
              {!isSignUp && (
                <div className="text-right">
                  <a
                    href="/auth/forgot-password"
                    className="text-primaryText dark:text-[#ededed] text-sm hover:underline"
                  >
                    Forgot Password?
                  </a>
                </div>
              )}
              {isSignUp && (
                <>
                  <InputField
                    label="Email"
                    id="email"
                    type="email"
                    name="email"
                    value={credentials.email}
                    onChange={onChange}
                    required
                  />
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="country"
                      className="text-primaryText dark:text-[#ededed] font-openSans font-semibold"
                    >
                      Select Your Country
                    </label>
                    <select
                      id="country"
                      name="country"
                      value={credentials.country}
                      onChange={onChange}
                      className="bg-inherit border border-colorNeonPink focus:outline-none focus:shadow-focusNeonPink px-2 py-2 rounded-md dark:text-[#ededed] text-primaryText"
                      required
                    >
                      <option value="" disabled>
                        Select a country
                      </option>
                      {countries.map((country) => (
                        <option
                          key={country}
                          value={country}
                          className="bg-black text-white"
                        >
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="profilePicture"
                      className="text-primaryText dark:text-[#ededed] font-openSans font-semibold"
                    >
                      Upload Your Image (Optional)
                    </label>
                    <input
                      className="bg-inherit border border-colorNeonPink focus:outline-none focus:shadow-focusNeonPink px-2 py-2 rounded-md dark:text-[#ededed] text-primaryText"
                      id="profilePicture"
                      type="file"
                      name="profilePicture"
                      accept="image/*"
                      onChange={onFileChange}
                    />
                  </div>
                </>
              )}
              <div>
                <button
                  className="text-black button-gradient w-full px-2 py-2 rounded-md font-openSans font-semibold"
                  disabled={isLoading}
                >
                  {isSignUp ? "Sign Up" : "Sign In"}
                </button>
              </div>
            </form>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div>
              <p className="text-[#666666] text-center font-openSans font-bold">
                Or
              </p>
              <div className="mt-4">
                <button
                  onClick={handleGoogleLogin}
                  className="w-full font-openSans flex items-center justify-between font-medium bg-white text-black py-2 px-4 rounded-md hover:scale-105 transition-transform duration-300 mb-3"
                >
                  <img src={GoogleIcon} alt="google icon" className="w-6" />
                  Continue with Google
                  <div></div>
                </button>
                {/* <button
                  onClick={handleFacebookLogin}
                  className="w-full font-openSans flex items-center justify-between font-medium bg-white text-black py-2 px-4 rounded-md hover:scale-105 transition-transform duration-300 mb-3"
                >
                  <img src={FacebookIcon} alt="facebook icon" className="w-6" />
                  Continue with Facebook
                  <div></div>
                </button> */}
              </div>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="dark:bg-[url('/auth-bg.png')]   bg-light-bg auth-bg w-full h-[500px] lg:w-[600px] lg:h-[650px] rounded-xl relative bg-cover bg-top">
          <h1 className="text-3xl sm:text-5xl absolute top-10 left-4 sm:left-10 font-roboto italic text-gray-600 dark:text-[#ededed]">
            Embrace <br /> the Next Wave
          </h1>
          <h1 className="absolute top-36 sm:top-40 left-10 sm:left-32 text-3xl sm:text-5xl font-roboto italic  text-gray-600  dark:text-[#ededed]">
            of Digital <br /> Transformation
          </h1>
          <div className="absolute bottom-4 left-2   dark:bg-white/20 backdrop-blur-md border border-white/10 shadow-lg rounded-xl p-3 sm:p-6">
            <img
              src={element1}
              className="w-[80px] lg:w-[150px]"
              alt="Decorative element 1 "
              loading="lazy"
            />
          </div>
          <div className="absolute bottom-20 right-3    dark:bg-white/20 backdrop-blur-md border border-white/10 shadow-lg rounded-xl p-3 sm:p-6">
            <img
              src={element2}
              className="w-[150px] lg:w-[300px]"
              alt="Decorative element 2"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
