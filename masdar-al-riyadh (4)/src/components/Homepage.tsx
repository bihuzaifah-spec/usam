import React from 'react';
import { useStore } from '../context/StoreContext';
import { HeroSlider } from './HeroSlider';
import { Truck, Sparkles, Star, Award, ShieldAlert, Heart, Map, MapPin, Layers, MoveRight } from 'lucide-react';

export const Homepage: React.FC = () => {
  const { categories, setCurrentTab, setSelectedCategory } = useStore();

  const handleCategoryClick = (catId: string) => {
    setSelectedCategory(catId);
    setCurrentTab('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const trustStats = [
    { icon: Truck, title: "Express Riyadh Logistics", desc: "Flatbed and crane delivery directly to your construction site" },
    { icon: Layers, title: "Full Structural Range", desc: "Fine timber, steel rebars, PPR piping, and safety PPE" },
    { icon: Star, title: "4.9 Developer Index", desc: "Trusted by major developers and contractors across Riyadh" }
  ];

  const philosophyCards = [
    {
      icon: Award,
      title: "Premium Timber & Wood",
      desc: "Kiln-dried European Ash, Beech wood, sustainably sourced Romanian white wood, and phenolic-faced shuttering plywood."
    },
    {
      icon: Heart,
      title: "Reinforcing Steel",
      desc: "Hot-rolled deformed concrete rebars and high-tensile wire mesh fully certified to SASO, ASTM, and SABER standards."
    },
    {
      icon: Sparkles,
      title: "Industrial Tools & Safety",
      desc: "Certified personal protective equipment (PPE), heavy-duty fasteners, PPR/PVC plumbing networks, and masonry hand tools."
    }
  ];

  return (
    <div className="bg-[#0c0d10] text-brand-gray-light animate-fade-in">
      
      {/* 1. HERO SLIDER */}
      <HeroSlider />

      {/* 2. STATS / TRUST BAR */}
      <div className="border-y border-[#1c1d24] bg-brand-charcoal py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:divide-x md:divide-[#1c1d24]">
            {trustStats.map((stat, idx) => {
              const StatIcon = stat.icon;
              return (
                <div key={idx} className="flex flex-col items-center space-y-2 md:px-6">
                  <div className="p-3 bg-[#0c0d10] border border-[#252731] rounded-full text-[#cfa861]">
                    <StatIcon className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif text-sm tracking-widest text-white uppercase font-medium">
                    {stat.title}
                  </h4>
                  <p className="text-xs text-brand-gray-muted font-light">
                    {stat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. EDITORIAL PHILOSOPHY SECTION */}
      <section className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 text-left">
        {/* Quote Headings */}
        <div className="max-w-4xl space-y-6">
          <span className="text-[#cfa861] tracking-[0.4em] text-[10px] sm:text-xs font-semibold uppercase block">
            Brand Manifesto
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl text-white font-medium leading-tight tracking-tight">
            “Building the future of Riyadh with structural integrity.”
          </h2>
          <div className="h-[2px] w-20 bg-[#cfa861]" />
          <p className="text-sm sm:text-base text-brand-gray-muted font-light leading-relaxed max-w-2xl font-sans">
            In an era of rapid expansion, Masdar Al-Riyadh delivers the raw materials that anchor modern architectural landmarks. From foundational deformed steel to premium European timbers, we guarantee precision, durability, and compliance.
          </p>
        </div>

        {/* Core Pillars Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {philosophyCards.map((card, idx) => {
            const CardIcon = card.icon;
            return (
              <div 
                key={idx} 
                className="bg-brand-charcoal/40 border border-[#1c1d24] hover:border-[#cfa861]/20 p-8 sm:p-10 rounded-sm space-y-4 transition-all duration-300"
              >
                <div className="text-[#cfa861]">
                  <CardIcon className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-base text-white font-semibold uppercase tracking-wider">
                  {card.title}
                </h3>
                <p className="text-xs text-brand-gray-muted leading-relaxed font-light font-sans">
                  {card.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. CURATED COLLECTIONS / CATEGORIES BROWSING SHORTCUTS */}
      <section className="bg-brand-charcoal/30 border-t border-[#1c1d24] py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-left">
          <div className="space-y-2">
            <span className="text-[#cfa861] tracking-[0.4em] text-[10px] font-semibold uppercase block">
              Architectural Materials
            </span>
            <h3 className="font-serif text-2xl sm:text-4xl text-white tracking-wide uppercase font-medium">
              Explore Our Materials
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className="group relative h-96 overflow-hidden rounded-sm border border-[#1c1d24] hover:border-[#cfa861]/30 cursor-pointer transition-all duration-500"
              >
                {/* Image Overlay Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent z-10" />
                <img
                  src={cat.image}
                  alt={cat.name}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-6 z-20 space-y-2">
                  <h4 className="font-serif text-lg text-white font-medium group-hover:text-[#cfa861] transition-colors uppercase">
                    {cat.name}
                  </h4>
                  <p className="text-[10px] text-brand-gray-muted font-light leading-relaxed font-sans line-clamp-2">
                    {cat.description}
                  </p>
                  <div className="pt-2 flex items-center gap-1.5 text-[10px] tracking-widest text-[#cfa861] uppercase font-semibold">
                    <span>Browse Inventory</span>
                    <MoveRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. LOCATION / AL-RIYADH LOCAL PRESENCE */}
      <section className="border-t border-[#1c1d24] py-20 sm:py-28 bg-[#0c0d10]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Detail Column (5 span) */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <span className="text-[#cfa861] tracking-[0.4em] text-[10px] sm:text-xs font-semibold uppercase block">
              Flagship Logistics
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl text-white leading-tight uppercase font-medium">
              Available in Al Riyadh
            </h3>
            <p className="text-xs sm:text-sm text-brand-gray-muted font-light leading-relaxed font-sans">
              We operate a state-of-the-art flatbed fleet with crane attachment options to serve job sites across Riyadh instantly. Every shipment is quality-checked at our Al-Yasmin logistics hub, arriving with full SASO certificates and delivery verification reports.
            </p>
            
            <div className="space-y-4 border-l border-[#cfa861]/40 pl-5 text-xs font-sans">
              <div>
                <strong className="text-white block font-semibold mb-1">On-Site Crane Unloading</strong>
                <span className="text-brand-gray-muted font-light">Equipped with specialized heavy-duty machinery for safe and prompt site drops.</span>
              </div>
              <div>
                <strong className="text-white block font-semibold mb-1">SASO & ASTM Material Standards</strong>
                <span className="text-brand-gray-muted font-light">Every steel bundle and timber shipment arrives with certified manufacturer test reports.</span>
              </div>
              <div>
                <strong className="text-white block font-semibold mb-1">Riyadh Bulk-Order Discount Coordinates</strong>
                <span className="text-brand-gray-muted font-light">Direct phone concierge line for bespoke custom construction project estimates.</span>
              </div>
            </div>
          </div>

          {/* Right Vector Map Graphic Column (7 span) */}
          <div className="lg:col-span-7 bg-brand-charcoal/40 border border-[#1c1d24] p-8 sm:p-12 rounded-sm relative flex flex-col justify-center items-center overflow-hidden">
            <div className="absolute top-4 left-4 flex items-center gap-1.5 text-[9px] tracking-widest text-[#cfa861] uppercase font-mono font-semibold">
              <MapPin className="w-3.5 h-3.5" />
              <span>RIYADH / SAUDI ARABIA</span>
            </div>

            {/* HIGHLY STYLIZED SVG CITY GRID MAP MAP IN GOLD LINES */}
            <svg 
              viewBox="0 0 600 400" 
              className="w-full h-auto max-w-lg opacity-85 hover:opacity-100 transition-opacity" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Background Map Grid Streets lines */}
              <path d="M 0 50 Q 150 70 300 120 T 600 150" stroke="#cfa861" strokeWidth="0.5" strokeOpacity="0.15" />
              <path d="M 0 150 Q 200 180 350 220 T 600 300" stroke="#cfa861" strokeWidth="0.5" strokeOpacity="0.15" />
              <path d="M 0 280 Q 250 250 400 320 T 600 380" stroke="#cfa861" strokeWidth="0.5" strokeOpacity="0.15" />
              
              <path d="M 100 0 Q 120 150 220 300 T 300 400" stroke="#cfa861" strokeWidth="0.5" strokeOpacity="0.15" />
              <path d="M 300 0 Q 320 120 450 280 T 500 400" stroke="#cfa861" strokeWidth="0.5" strokeOpacity="0.15" />
              
              {/* Main Arterial roads King Fahd Road & King Abdullah Road */}
              {/* King Fahd Road (Vertical Gold Highway) */}
              <path d="M 280 0 Q 295 180 310 400" stroke="#cfa861" strokeWidth="2" strokeOpacity="0.55" strokeDasharray="4 2" />
              {/* King Abdullah Road (Horizontal Gold Highway) */}
              <path d="M 0 200 Q 300 190 600 210" stroke="#cfa861" strokeWidth="2" strokeOpacity="0.55" strokeDasharray="4 2" />
              
              {/* Ring Road */}
              <circle cx="300" cy="200" r="130" stroke="#cfa861" strokeWidth="1" strokeOpacity="0.25" />
              <circle cx="300" cy="200" r="180" stroke="#cfa861" strokeWidth="0.75" strokeOpacity="0.1" />

              {/* Riyadh Center Node Pointer */}
              <circle cx="300" cy="200" r="8" fill="#cfa861" fillOpacity="0.15" />
              <circle cx="300" cy="200" r="4" fill="#cfa861" />
              <line x1="300" y1="170" x2="300" y2="230" stroke="#cfa861" strokeWidth="1" strokeOpacity="0.7" />
              <line x1="270" y1="200" x2="330" y2="200" stroke="#cfa861" strokeWidth="1" strokeOpacity="0.7" />

              {/* Text labels on SVG */}
              <text x="315" y="195" fill="#ffffff" fontSize="10" fontFamily="sans-serif" fontWeight="bold" letterSpacing="1">MASDAR CENTER</text>
              <text x="315" y="210" fill="#cfa861" fontSize="8" fontFamily="sans-serif" letterSpacing="1">AL YASMIN DISTRICT</text>
              <text x="295" y="80" fill="#8e9096" fontSize="7" fontFamily="sans-serif" transform="rotate(82, 295, 80)">KING FAHD ROAD</text>
              <text x="100" y="185" fill="#8e9096" fontSize="7" fontFamily="sans-serif">KING ABDULLAH ROAD</text>
            </svg>

            <span className="text-[10px] text-brand-gray-muted text-center mt-6 max-w-sm leading-relaxed font-sans">
              Our King Abdulaziz Road office resides directly inside Al Yasmin District, connecting prompt support coordinates seamlessly.
            </span>
          </div>

        </div>
      </section>

    </div>
  );
};
