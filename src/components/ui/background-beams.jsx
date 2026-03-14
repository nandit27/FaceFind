"use client";
import React, { useEffect, useRef, useState } from "react";
import { cn } from "../../utils/cn";

export const BackgroundBeams = ({ className }) => {
  return (
    <div
      className={cn(
        "absolute inset-0 z-0 h-full w-full bg-neutral-950",
        className
      )}
    >
      {/* Fallback to simple stars/gradient since background beams component logic is heavy for a static export. Using a beautiful static substitute from Aceternity styling guidelines. */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-neutral-950/80 to-transparent"></div>
    </div>
  );
};
