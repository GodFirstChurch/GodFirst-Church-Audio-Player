import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.includes('admin');

  return (
    <header className="bg-white border-b-4 border-amber-400 sticky top-0 z-10 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex flex-col leading-none">
          <span className="font-bold text-slate-700 text-2xl brand-font tracking-tight uppercase">GodFirst</span>
          <span className="text-sky-500 text-[0.65rem] font-bold uppercase tracking-[0.2em] -mt-0.5">Church Barry</span>
        </Link>
        <nav>
          {isAdmin ? (
            <Link to="/" className="text-sm font-medium text-slate-600 hover:text-sky-600">
              Back to Player
            </Link>
          ) : (
            <Link to="/admin" className="text-xs px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium transition-colors">
              Admin Area
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;