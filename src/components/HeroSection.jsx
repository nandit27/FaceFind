import React from 'react';
import { Spotlight } from './ui/spotlight';
import { TextGenerateEffect } from './ui/text-generate-effect';

export const HeroSection = () => {
  return (
    <div className="h-[40rem] w-full rounded-md flex md:items-center md:justify-center bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="white"
      />
      <div className="p-4 max-w-7xl mx-auto relative z-10 w-full pt-20 md:pt-0">
        <h1 className="text-4xl md:text-7xl font-bold font-space text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50">
          FaceFind <br />
          <span className="text-cyan-400">Discover Your Photos</span>
        </h1>
        <div className="mt-4 font-normal text-base text-neutral-300 max-w-lg text-center mx-auto text-center font-mono placeholder">
          <TextGenerateEffect duration={0.8} words="Automatically scan folders to find photos containing your face. A private, intelligent photo extraction terminal." />
        </div>
      </div>
    </div>
  );
};
