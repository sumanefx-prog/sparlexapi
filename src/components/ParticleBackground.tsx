import React from 'react';

interface ParticleBackgroundProps {
  isDark: boolean;
}

export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({ isDark }) => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 transition-colors duration-500">
      
      {/* Dynamic Background Base */}
      <div 
        className={`absolute inset-0 transition-opacity duration-700 ${
          isDark 
            ? 'bg-[#060913]' 
            : 'bg-gradient-to-br from-[#F0F6FF] via-[#E6F0FA] to-[#EDF4FC]'
        }`} 
      />

      {/* Subtle Geometric Tech Mesh Grid */}
      <div 
        className={`absolute inset-0 opacity-[0.035] dark:opacity-[0.06] bg-[linear-gradient(to_right,#3B82F6_1px,transparent_1px),linear-gradient(to_bottom,#3B82F6_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]`} 
      />

      {/* Red Neon Glowing Energy Orb 1 (Top Right) */}
      <div className="absolute -top-24 -right-24 sm:w-[650px] sm:h-[650px] w-96 h-96 rounded-full bg-gradient-to-br from-[#FF1E27]/30 via-[#E51D24]/15 to-transparent blur-[120px] dark:blur-[140px] animate-neon-pulse" />

      {/* Cobalt / Cyan Blue Glowing Energy Orb 2 (Center-Left) */}
      <div className="absolute top-1/3 -left-36 sm:w-[550px] sm:h-[550px] w-80 h-80 rounded-full bg-gradient-to-tr from-[#2563EB]/25 via-[#38BDF8]/15 to-transparent blur-[110px] dark:blur-[130px] animate-neon-pulse [animation-delay:2.5s]" />

      {/* Electric Neon Accent 3 (Bottom Center) */}
      <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 sm:w-[700px] sm:h-[450px] w-96 h-72 rounded-full bg-gradient-to-t from-[#E51D24]/20 via-[#3B82F6]/15 to-transparent blur-[130px]" />

      {/* Floating Gradient Particles (Staggered positions & float animations) */}
      {/* Particle 1: Fiery Red Particle */}
      <div className="absolute top-[18%] left-[12%] w-3.5 h-3.5 rounded-full bg-[#FF2B32] shadow-[0_0_16px_#FF2B32] animate-float-slow opacity-75" />

      {/* Particle 2: Electric Cyan Particle */}
      <div className="absolute top-[28%] right-[22%] w-4 h-4 rounded-full bg-[#00D2FF] shadow-[0_0_20px_#00D2FF] animate-float-delayed opacity-80" />

      {/* Particle 3: Sapphire Blue Particle */}
      <div className="absolute top-[65%] left-[18%] w-3 h-3 rounded-full bg-[#3B82F6] shadow-[0_0_14px_#3B82F6] animate-float-fast opacity-70" />

      {/* Particle 4: Ruby Crimson Glow Orb */}
      <div className="absolute top-[52%] right-[14%] w-5 h-5 rounded-full bg-[#FF1E27] shadow-[0_0_22px_#FF1E27] animate-float-slow opacity-85 [animation-delay:1.5s]" />

      {/* Particle 5: Soft Micro Particle */}
      <div className="absolute top-[78%] right-[35%] w-2 h-2 rounded-full bg-[#38BDF8] shadow-[0_0_10px_#38BDF8] animate-float-delayed opacity-60" />

      {/* Particle 6: Accent Orb Left */}
      <div className="absolute top-[40%] left-[8%] w-2.5 h-2.5 rounded-full bg-[#FF2B32] shadow-[0_0_12px_#FF2B32] animate-float-fast opacity-65 [animation-delay:3s]" />

    </div>
  );
};
