import { useState, useEffect } from "react";

export const HeroBackground = () => {
  const [lineCount, setLineCount] = useState(18);

  useEffect(() => {
    const updateLineCount = () => {
      const viewportWidth = window.innerWidth;
      const lineWidth = 82;
      setLineCount(Math.ceil(viewportWidth / lineWidth));
    };

    updateLineCount();
    window.addEventListener("resize", updateLineCount);
    return () => window.removeEventListener("resize", updateLineCount);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Animated gradient overlay - positioned lower and shifted right */}
      <div
        className="absolute bottom-0 left-[10%] right-0 h-[70%] opacity-30"
        style={{
          background:
            "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.1) 50%, rgba(139, 92, 246, 0.1) 100%)",
          backgroundSize: "200% 200%",
          animation: "gradientShift 15s ease infinite",
        }}
      />

      {/* Colored ellipses with blur and subtle animation */}
      <div
        className="absolute w-[927px] h-[401px] left-[42px] top-[709px] bg-[#FFDC3C] blur-[98px] opacity-66 animate-pulse"
        style={{ animationDuration: "8s" }}
      />
      <div
        className="absolute w-[927px] h-[401px] left-[-12px] top-[509px] bg-[#E2D391] blur-[98px] mix-blend-color-dodge animate-pulse"
        style={{ animationDuration: "10s", animationDelay: "1s" }}
      />
      <div
        className="absolute w-[927px] h-[401px] left-[619px] top-[693px] bg-[#079669] blur-[98px] animate-pulse"
        style={{ animationDuration: "12s", animationDelay: "2s" }}
      />
      <div
        className="absolute w-[927px] h-[401px] left-[264px] top-[492px] bg-[#6BA08F] blur-[98px] mix-blend-color-dodge animate-pulse"
        style={{ animationDuration: "9s", animationDelay: "0.5s" }}
      />
      <div
        className="absolute w-[927px] h-[401px] left-[-38px] top-[564px] bg-[#E055BD] blur-[98px] animate-pulse"
        style={{ animationDuration: "11s", animationDelay: "1.5s" }}
      />
      <div
        className="absolute w-[927px] h-[401px] left-[534px] top-[451px] bg-[#FDE3A9] blur-[98px] mix-blend-color-dodge animate-pulse"
        style={{ animationDuration: "13s", animationDelay: "2.5s" }}
      />

      {/* Vertical lines pattern */}
      <div className="absolute inset-0 flex">
        {Array.from({ length: lineCount }).map((_, i) => (
          <div
            key={i}
            className="w-[82px] h-full bg-gradient-to-r from-transparent to-black/14 blur-[5.5px] backdrop-blur-[18px]"
          />
        ))}
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
};
