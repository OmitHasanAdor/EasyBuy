"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Sparkles, MoveHorizontal } from "lucide-react";

type BeforeAfterSliderProps = {
  originalImage: string;
  generatedImage: string;
  productTitle?: string;
};

export default function BeforeAfterSlider({
  originalImage,
  generatedImage,
  productTitle,
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging) return;
      handleMove(e.touches[0].clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-[#E7DCC4] bg-[#2B2420] select-none shadow-lg">
      <div
        ref={containerRef}
        className="relative h-[480px] sm:h-[560px] w-full cursor-ew-resize overflow-hidden"
        onMouseDown={(e) => {
          setIsDragging(true);
          handleMove(e.clientX);
        }}
        onTouchStart={(e) => {
          setIsDragging(true);
          handleMove(e.touches[0].clientX);
        }}
      >
        {/* Original Photo (Underneath / Left Side View) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={originalImage}
          alt="Your original photo"
          className="absolute inset-0 h-full w-full object-contain bg-[#1F1915]"
          draggable={false}
        />

        {/* AI Dressed Photo (Top Layer / Clipped) */}
        <div
          className="absolute inset-0 h-full w-full overflow-hidden"
          style={{
            clipPath: `inset(0 0 0 ${sliderPosition}%)`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={generatedImage}
            alt={productTitle || "AI Try-On Result"}
            className="absolute inset-0 h-full w-full object-contain bg-[#1F1915]"
            draggable={false}
          />
        </div>

        {/* Vertical Divider Line with Floating Handle */}
        <div
          className="absolute top-0 bottom-0 z-20 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#2B2420] shadow-xl border-2 border-[#C05620]">
            <MoveHorizontal className="h-4 w-4" />
          </div>
        </div>

        {/* Left / Right Floating Tags */}
        <div className="absolute top-4 left-4 z-10 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-medium text-white/90">
          Original
        </div>
        <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 rounded-full bg-[#C05620]/90 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white shadow-sm">
          <Sparkles className="h-3 w-3" />
          AI Try-On
        </div>

        {/* Drag Hint at Bottom */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 rounded-full bg-black/50 backdrop-blur-md px-3 py-1 text-[11px] text-white/80 pointer-events-none">
          Drag slider to compare
        </div>
      </div>
    </div>
  );
}
