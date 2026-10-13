import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, PlusCircle, LayoutDashboard, History, UserCheck, LogOut, LogIn, UserPlus } from 'lucide-react';

export function Navbar() {
  const { user, isAuthenticated, isReviewer, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-sage-200/60 subtle-shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-forest-700 flex items-center justify-center text-white shadow-md group-hover:bg-forest-600 transition-colors">
              <ShieldCheck className="w-6 h-6 text-sage-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-forest-800 flex items-center gap-1">
                GreenProof <span className="text-forest-600 font-extrabold text-sm px-1.5 py-0.5 rounded bg-sage-200/70 text-forest-700">AI</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-charcoal-500">Environmental Claim Verifier</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/"
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                isActive('/') ? 'text-forest-700 bg-sage-100/70' : 'text-charcoal-700 hover:text-forest-700 hover:bg-sage-50'
              }`}
            >
              Home
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive('/dashboard') ? 'text-forest-700 bg-sage-100/70' : 'text-charcoal-700 hover:text-forest-700 hover:bg-sage-50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>

                <Link
                  to="/assessments/new"
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive('/assessments/new') ? 'text-forest-700 bg-sage-100/70' : 'text-charcoal-700 hover:text-forest-700 hover:bg-sage-50'
                  }`}
                >
                  <PlusCircle className="w-4 h-4 text-forest-600" />
                  New Assessment
                </Link>

                <Link
                  to="/history"
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive('/history') ? 'text-forest-700 bg-sage-100/70' : 'text-charcoal-700 hover:text-forest-700 hover:bg-sage-50'
                  }`}
                >
                  <History className="w-4 h-4" />
                  History
                </Link>

                {isReviewer && (
                  <Link
                    to="/reviews"
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      isActive('/reviews') ? 'text-indigo-800 bg-indigo-50 border border-indigo-200' : 'text-indigo-700 hover:bg-indigo-50/60'
                    }`}
                  >
                    <UserCheck className="w-4 h-4 text-indigo-600" />
                    Review Queue
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Right Action / Auth */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-semibold text-charcoal-800">{user?.name}</span>
                  <span className="text-[10px] text-charcoal-500 capitalize bg-sage-100 px-1.5 py-0.2 rounded font-medium self-end">
                    {user?.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-xs text-charcoal-700 hover:text-rose-600 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-rose-200 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-forest-700 hover:text-forest-800 px-3 py-2 rounded-lg hover:bg-sage-50 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-white bg-forest-700 hover:bg-forest-800 px-3.5 py-2 rounded-lg shadow-sm transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
