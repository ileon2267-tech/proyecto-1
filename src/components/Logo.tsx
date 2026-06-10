import React from 'react';

export default function Logo({ className = "w-10 h-10", showNeon = true }: { className?: string, showNeon?: boolean }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 group ${className}`}>
      {showNeon && (
        <>
          {/* Static Cosmic Gradient Border (replaces rainbow) */}
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400 via-teal-500 to-cyan-500 rounded-xl pointer-events-none opacity-100 group-hover:scale-[1.02] transition-transform shadow-[0_0_15px_rgba(45,212,191,0.3)]" />
          
          {/* Deep Blur Glow Effect */}
          <div className="absolute inset-[-4px] bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-600 rounded-xl pointer-events-none blur-xl opacity-60 group-hover:opacity-90 dark:opacity-50 transition-all duration-300" />
        </>
      )}
      
      {/* Inner Masking Card */}
      <div className={`absolute inset-[2px] rounded-[10px] z-0 pointer-events-none ${showNeon ? 'bg-white dark:bg-slate-950 transition-colors' : 'bg-transparent'}`} />
      
      {/* Inner Gradient Glass */}
      <div className={`relative z-10 w-full h-full rounded-[10px] overflow-hidden flex items-center justify-center ${showNeon ? 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800/80 dark:to-slate-900/80 border border-white/40 dark:border-white/10 backdrop-blur-md' : 'bg-gradient-to-tr from-teal-600 to-cyan-600 shadow-md border border-teal-500/50'}`}>
         
         {/* Cute Dentito Avatar */}
         <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.8" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={`w-[60%] h-[60%] drop-shadow-[0_0_8px_rgba(45,212,191,0.6)] transition-all duration-500 ${showNeon ? 'text-teal-600 dark:text-teal-400 group-hover:scale-110 group-hover:text-cyan-400' : 'text-white'}`}
          >
            {/* Dentito Body */}
            <path d="M 7 4 C 3 4 3 7 3 9 v 2 C 3 13 4 14 5 15 L 6.5 19 C 7.5 21 9 20 9 18 L 10 14 C 10.5 12 13.5 12 14 14 L 15 18 C 15 20 16.5 21 17.5 19 L 19 15 C 20 14 21 13 21 11 V 9 C 21 7 21 4 17 4 C 15 4 13.5 5 12 6 C 10.5 5 9 4 7 4 Z" fill="currentColor" fillOpacity="0.1" />
            
            {/* Eyes */}
            <circle cx="8.5" cy="10" r="1.2" fill="currentColor" stroke="none" className="group-hover:animate-pulse" />
            <circle cx="15.5" cy="10" r="1.2" fill="currentColor" stroke="none" className="group-hover:animate-pulse" />
            
            {/* Cute Smile */}
            <path d="M 10.5 13 Q 12 14.5 13.5 13" strokeLinecap="round" strokeWidth="1.5" />
         </svg>

      </div>
    </div>
  );
}
