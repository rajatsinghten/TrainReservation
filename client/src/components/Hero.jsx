import React from 'react';
import SearchForm from './train-search/SearchForm';

const Hero = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white px-6">
      <div className="max-w-xl w-full text-center space-y-8 animate-minimal-in">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
            Find. <br/>
            Book. <br/>
            Travel.
          </h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-black/40 font-bold">
            The Professional Railway Reservation Desk
          </p>
        </div>
        
        <div className="w-full pt-8">
          <SearchForm inline />
        </div>
        
        <div className="grid grid-cols-3 gap-8 pt-12 border-t-2 border-black/5">
          {[
            { val: "50K+", label: "BOOKED" },
            { val: "1.2K", label: "ROUTES" },
            { val: "24/7", label: "SUPPORT" }
          ].map(s => (
            <div key={s.label}>
              <p className="text-xl font-black">{s.val}</p>
              <p className="text-[8px] font-black uppercase tracking-widest opacity-30">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;
