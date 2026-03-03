import { useEffect, useRef } from "react";

export default function FancyCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  const mouse = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });
  const rafId = useRef(null);

  useEffect(() => {
    // touch device এ disable (optional but recommended)
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) return;

    document.body.style.cursor = "none";

    const onMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    const animate = () => {
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouse.current.x}px, ${mouse.current.y}px, 0)`;
      }

      ring.current.x += (mouse.current.x - ring.current.x) * 0.12;
      ring.current.y += (mouse.current.y - ring.current.y) * 0.12;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0)`;
      }

      rafId.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    rafId.current = requestAnimationFrame(animate);

    return () => {
      document.body.style.cursor = "auto";
      window.removeEventListener("mousemove", onMove);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <>
      {/* DOT */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 h-2 w-2 rounded-full pointer-events-none z-[999999]
                   bg-black/90 dark:bg-white/95 will-change-transform"
        style={{ transform: "translate3d(-100px, -100px, 0)" }}
      />

      {/* RING */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 h-[34px] w-[34px] rounded-full pointer-events-none z-[999998]
                   border-2 border-black/35 dark:border-white/35 will-change-transform"
        style={{ transform: "translate3d(-100px, -100px, 0)" }}
      />
    </>
  );
}
