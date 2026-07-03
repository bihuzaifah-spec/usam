import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

export const HeroSlider: React.FC = () => {
  const { settings, categories, setCurrentTab, setSelectedCategory } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  const slides = settings.heroSlides || [];

  // Auto-play interval
  useEffect(() => {
    if (slides.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6000); // Crossfade every 6s
    return () => clearInterval(interval);
  }, [slides.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handleExploreCategory = (categoryLabel: string) => {
    const label = categoryLabel.toLowerCase();
    
    // Find matching category ID from the actual loaded categories
    const matchedCat = categories.find(cat => 
      label.includes(cat.name.toLowerCase()) || 
      cat.name.toLowerCase().split(' ').some(word => word.length > 3 && label.includes(word))
    );
    
    // Custom fallbacks if standard match doesn't hit
    let catId: string | null = matchedCat ? matchedCat.id : null;
    if (!catId) {
      if (label.includes('timber') || label.includes('wood')) {
        catId = 'timber-wood';
      } else if (label.includes('steel') || label.includes('rebar')) {
        catId = 'structural-steel';
      } else if (label.includes('pipe') || label.includes('plumbing') || label.includes('piping')) {
        catId = 'plumbing-pipes';
      } else if (label.includes('fastener') || label.includes('safety') || label.includes('ppe')) {
        catId = 'fasteners-safety';
      }
    }
    
    setSelectedCategory(catId);
    setCurrentTab('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (slides.length === 0) return null;

  return (
    <div className="relative w-full h-[70vh] sm:h-[80vh] bg-black overflow-hidden select-none">
      {/* Slides wrapper with crossfade */}
      {slides.map((slide, idx) => (
        <div
          key={slide.id}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Background image with high contrast vignette overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/80 z-10" />
          <img
            src={slide.image}
            alt={slide.category}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover scale-105 transform transition-transform duration-[6000ms] ease-out"
          />
          
          {/* Content overlay */}
          <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl animate-fade-in space-y-4 sm:space-y-6">
              {/* Category tag */}
              <span className="font-sans text-[10px] sm:text-xs tracking-[0.4em] text-[#cfa861] uppercase font-semibold block">
                {slide.category}
              </span>
              
              {/* Poetic description title */}
              <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl text-white font-medium leading-tight tracking-tight">
                {idx === 0 && 'The New Luxury is Quiet.'}
                {idx === 1 && 'Form Follows Sanctuary.'}
                {idx === 2 && 'Crafted for Generations.'}
              </h1>
              
              {/* Poetic Description details */}
              <p className="font-sans text-xs sm:text-sm text-brand-gray-muted leading-relaxed max-w-xl mx-auto font-light">
                {slide.description}
              </p>

              {/* Call to action button */}
              <div className="pt-4">
                <button
                  onClick={() => handleExploreCategory(slide.category)}
                  className="inline-flex items-center gap-2 border border-[#cfa861] text-[#cfa861] hover:text-[#0c0d10] hover:bg-[#cfa861] transition-all duration-300 font-sans text-xs tracking-[0.2em] uppercase px-6 sm:px-8 py-3 rounded-sm font-medium cursor-pointer"
                >
                  <span>Explore Collection</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Slide Navigation Controls */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full border border-white/10 bg-black/30 text-white/50 hover:text-white hover:border-[#cfa861]/40 transition-all cursor-pointer"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full border border-white/10 bg-black/30 text-white/50 hover:text-white hover:border-[#cfa861]/40 transition-all cursor-pointer"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Progress Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex space-x-3">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'bg-[#cfa861] w-6' : 'bg-white/30 hover:bg-white/50'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
