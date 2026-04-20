import React from "react";
import { useNavigate } from "react-router-dom";

const AuthModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/80 animate-minimal-in">
      <div className="bg-white border-4 border-black max-w-sm w-full p-8 space-y-8">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-black flex items-center justify-center mx-auto">
             <span className="text-2xl font-black">?</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black uppercase tracking-tighter">Wait a moment</h2>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-30 leading-relaxed">
              Hey! seems you forgot to log in. Please sign in to confirm your train reservation.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <button 
            onClick={() => { onClose(); navigate('/login'); }}
            className="w-full py-4 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black border-2 border-black transition-colors"
          >
            Sign In
          </button>
          <button 
            onClick={() => { onClose(); navigate('/login'); }}
            className="w-full py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white border-2 border-black transition-colors"
          >
            Create Account
          </button>
          
          <button 
            onClick={onClose} 
            className="w-full py-2 text-[8px] font-black uppercase tracking-widest opacity-20 hover:opacity-100 transition-opacity"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
