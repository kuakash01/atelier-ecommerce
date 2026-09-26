'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const DotLottieReact = dynamic(
  () => import('@lottiefiles/dotlottie-react').then((mod) => mod.DotLottieReact),
  { ssr: false }
);

const Loading = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex items-center justify-center h-full fixed top-0 left-0 right-0 bottom-0 z-[99999] bg-[rgba(0,0,0,0.5)]">
      <div className="relative w-40 h-40 flex items-center justify-center">
        {mounted ? (
          <DotLottieReact
            src="https://lottie.host/1c5154c6-3c67-46f6-a0b3-6d9db97b50c8/t83qlYneqV.lottie"
            loop
            autoplay
          />
        ) : (
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        )}
      </div>
    </div>
  );
};

export default Loading;
