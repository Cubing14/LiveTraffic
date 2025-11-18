import { useState, useEffect } from 'react';

type FontSize = 'small' | 'normal' | 'large' | 'extra-large';

export const useFontSize = () => {
  const [fontSize, setFontSize] = useState<FontSize>(() => {
    const saved = localStorage.getItem('livetraffic-font-size');
    return (saved as FontSize) || 'normal';
  });

  useEffect(() => {
    localStorage.setItem('livetraffic-font-size', fontSize);
    document.documentElement.setAttribute('data-font-size', fontSize);
  }, [fontSize]);

  const increaseFontSize = () => {
    const sizes: FontSize[] = ['small', 'normal', 'large', 'extra-large'];
    const currentIndex = sizes.indexOf(fontSize);
    if (currentIndex < sizes.length - 1) {
      setFontSize(sizes[currentIndex + 1]);
    }
  };

  const decreaseFontSize = () => {
    const sizes: FontSize[] = ['small', 'normal', 'large', 'extra-large'];
    const currentIndex = sizes.indexOf(fontSize);
    if (currentIndex > 0) {
      setFontSize(sizes[currentIndex - 1]);
    }
  };

  const resetFontSize = () => {
    setFontSize('normal');
  };

  return {
    fontSize,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    setFontSize
  };
};