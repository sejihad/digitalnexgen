import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const JoinSection = () => {
  const navigate = useNavigate();
  const bloom1Ref = useRef(null);
  const bloom2Ref = useRef(null);
  const bloom3Ref = useRef(null);
  const bloom4Ref = useRef(null);

  useEffect(() => {
    const blooms = [bloom1Ref, bloom2Ref, bloom3Ref, bloom4Ref];

    const animateBlooms = () => {
      blooms.forEach((bloom, index) => {
        if (bloom.current) {
          const time = Date.now() / 2000;
          const x = Math.sin(time + index * 2) * 30;
          const y = Math.cos(time + index * 3) * 20;
          const scale = 1 + Math.sin(time + index) * 0.1;

          bloom.current.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
        }
      });

      requestAnimationFrame(animateBlooms);
    };

    const animationFrame = requestAnimationFrame(animateBlooms);

    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <div className="max-w-[1200px] mx-auto px-4 mt-20">
      <div
        className="relative overflow-hidden rounded-2xl p-8 md:p-12 text-center shadow-xl 
        bg-gradient-to-r from-green-600 to-purple-600 
        dark:from-gray-900 dark:to-gray-800 border dark:border-gray-700 group"
      >
        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full animate-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>

        {/* Dynamic Bloom Effect 1 - Runs around */}
        <div
          ref={bloom1Ref}
          className="absolute -top-32 -left-32 w-[400px] h-[400px] rounded-full blur-[100px] opacity-60 
          bg-gradient-to-br from-green-400/40 via-purple-400/30 to-transparent 
          dark:from-green-400/20 dark:via-purple-400/20 transition-transform duration-300 ease-out"
        ></div>

        {/* Dynamic Bloom Effect 2 - Runs around */}
        <div
          ref={bloom2Ref}
          className="absolute -bottom-32 -right-32 w-[450px] h-[450px] rounded-full blur-[120px] opacity-60 
          bg-gradient-to-tr from-pink-400/40 via-indigo-400/30 to-transparent 
          dark:from-pink-400/20 dark:via-indigo-400/20 transition-transform duration-300 ease-out"
        ></div>

        {/* Additional Bloom Effect 3 - Dancing in the middle */}
        <div
          ref={bloom3Ref}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] 
          rounded-full blur-[90px] opacity-40 
          bg-gradient-to-r from-yellow-400/30 via-orange-400/30 to-red-400/30 
          dark:from-yellow-400/20 dark:via-orange-400/20 dark:to-red-400/20
          transition-transform duration-300 ease-out animate-pulse-slow"
        ></div>

        {/* Additional Bloom Effect 4 - Swirling around */}
        <div
          ref={bloom4Ref}
          className="absolute top-20 right-20 w-[300px] h-[300px] rounded-full blur-[80px] opacity-30 
          bg-gradient-to-l from-cyan-400/30 via-teal-400/30 to-emerald-400/30 
          dark:from-cyan-400/20 dark:via-teal-400/20 dark:to-emerald-400/20
          transition-transform duration-300 ease-out animate-spin-slow"
        ></div>

        {/* Animated Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
          <defs>
            <linearGradient
              id="line-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="white" stopOpacity="0.2" />
              <stop offset="50%" stopColor="white" stopOpacity="0.5" />
              <stop offset="100%" stopColor="white" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          {[...Array(5)].map((_, i) => (
            <line
              key={i}
              x1={`${Math.random() * 100}%`}
              y1={`${Math.random() * 100}%`}
              x2={`${Math.random() * 100}%`}
              y2={`${Math.random() * 100}%`}
              stroke="url(#line-gradient)"
              strokeWidth="1"
              className="animate-dash"
              style={{
                animationDelay: `${i * 0.5}s`,
                animationDuration: "3s",
              }}
            />
          ))}
        </svg>

        {/* Content */}
        <div className="relative z-10">
          {/* Title with gradient animation */}
          <h2
            className="text-2xl md:text-3xl font-bold mb-4 animate-gradient-x
            bg-gradient-to-r from-white via-yellow-200 to-white 
            dark:from-gray-100 dark:via-green-200 dark:to-gray-100 
            bg-clip-text text-transparent bg-[length:200%_auto]"
          >
            Join Digital NexGen Today
          </h2>

          {/* Subtitle with fade animation */}
          <p className="text-white/80 dark:text-gray-400 mb-6 text-sm md:text-base max-w-xl mx-auto animate-fade-in-up">
            Start your journey with us and explore unlimited digital
            possibilities.
          </p>

          {/* Button with enhanced hover effect */}
          <button
            onClick={() => navigate("/auth/login")}
            className="relative bg-white text-gray-900 dark:bg-gray-100 px-8 py-3 rounded-full font-semibold 
              hover:scale-110 hover:shadow-2xl transition-all duration-300 group overflow-hidden
              before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent 
              before:via-white/50 before:to-transparent before:translate-x-[-200%] 
              hover:before:translate-x-[200%] before:transition-transform before:duration-700
              after:absolute after:inset-0 after:bg-white/20 after:scale-x-0 after:origin-left
              hover:after:scale-x-100 after:transition-transform after:duration-500"
          >
            <span className="relative z-10">Join Now</span>
          </button>
        </div>

        {/* Overlay for depth with hover effect */}
        <div
          className="absolute inset-0 bg-white/5 dark:bg-black/20 pointer-events-none 
          group-hover:bg-white/10 dark:group-hover:bg-black/30 transition-all duration-500"
        ></div>
      </div>

      <style jsx>{`
        @keyframes particle {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.5;
          }
          90% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(-100px) translateX(100px);
            opacity: 0;
          }
        }

        .animate-particle {
          animation: particle linear infinite;
        }

        @keyframes gradient-x {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }

        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }

        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.1);
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        @keyframes dash {
          0% {
            stroke-dasharray: 0, 100;
            opacity: 0;
          }
          50% {
            stroke-dasharray: 100, 0;
            opacity: 0.5;
          }
          100% {
            stroke-dasharray: 0, 100;
            opacity: 0;
          }
        }

        .animate-dash {
          animation: dash 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default JoinSection;
