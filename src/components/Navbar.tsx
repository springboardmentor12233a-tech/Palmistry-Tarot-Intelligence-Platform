import React from 'react';
import { 
  Sparkles, 
  Hand, 
  Layers, 
  BarChart3, 
  FileText, 
  Database, 
  User, 
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface NavbarProps {
  activeTab: 'studio' | 'palm' | 'tarot' | 'reports';
  setActiveTab: (tab: 'studio' | 'palm' | 'tarot' | 'reports') => void;
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  userProfile,
  setUserProfile,
  onOpenProfile,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-amber-500/20 bg-[#0d0e1b]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Brand */}
          <div 
            id="brand-logo"
            onClick={() => setActiveTab('studio')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 via-purple-600/25 to-amber-400/20 border border-amber-500/40 flex items-center justify-center group-hover:border-amber-400 transition-colors shadow-lg shadow-amber-500/10">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-cinzel text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100">
                  Mystiq
                </span>
              </div>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <button
              id="nav-studio"
              onClick={() => setActiveTab('studio')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'studio'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-serif text-lg">Reading Studio</span>
            </button>

            <button
              id="nav-palm"
              onClick={() => setActiveTab('palm')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'palm'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Hand className="w-4 h-4 text-cyan-400" />
              <span className="font-serif text-lg">Palm Scanner</span>
            </button>

            <button
              id="nav-tarot"
              onClick={() => setActiveTab('tarot')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'tarot'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Layers className="w-4 h-4 text-purple-400" />
              <span className="font-serif text-lg">Tarot Sanctum</span>
            </button>

            <button
              id="nav-reports"
              onClick={() => setActiveTab('reports')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'reports'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <FileText className="w-4 h-4 text-rose-400" />
              <span className="font-serif text-lg">Report Archive</span>
            </button>
          </nav>

          {/* Right User Profile Controls */}
          <div className="flex items-center space-x-3">
            {/* Profile Avatar Button */}
            <button
              id="user-profile-btn"
              onClick={onOpenProfile}
              className="flex items-center space-x-2 p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 to-amber-500 flex items-center justify-center text-white text-xs font-bold font-serif">
                {userProfile.name.charAt(0)}
              </div>
              <span className="text-xs font-medium text-slate-200 hidden lg:inline max-w-[100px] truncate">
                {userProfile.name}
              </span>
            </button>
          </div>

        </div>

        {/* Mobile Submenu Bar */}
        <div className="flex md:hidden overflow-x-auto py-2 space-x-2 border-t border-slate-800/60 scrollbar-none">
          <button
            onClick={() => setActiveTab('studio')}
            className={`px-3 py-1 rounded-md text-xs whitespace-nowrap ${
              activeTab === 'studio' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400'
            }`}
          >
            Studio
          </button>
          <button
            onClick={() => setActiveTab('palm')}
            className={`px-3 py-1 rounded-md text-xs whitespace-nowrap ${
              activeTab === 'palm' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400'
            }`}
          >
            Palm Vision
          </button>
          <button
            onClick={() => setActiveTab('tarot')}
            className={`px-3 py-1 rounded-md text-xs whitespace-nowrap ${
              activeTab === 'tarot' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400'
            }`}
          >
            Tarot Spread
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1 rounded-md text-xs whitespace-nowrap ${
              activeTab === 'reports' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400'
            }`}
          >
            Reports
          </button>
        </div>

      </div>
    </header>
  );
};
