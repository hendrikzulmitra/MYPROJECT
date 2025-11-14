import { Link, useNavigate } from 'react-router-dom';
import { Music, LogOut, User, Home, ListMusic } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-spotify-black border-b border-spotify-darkgray sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 text-white hover:text-spotify-green transition">
            <Music className="w-8 h-8" />
            <span className="text-xl font-bold">SpotAI</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-spotify-lightgray hover:text-white transition"
            >
              <Home className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/playlists"
              className="flex items-center gap-2 text-spotify-lightgray hover:text-white transition"
            >
              <ListMusic className="w-5 h-5" />
              <span>My Playlists Songs</span>
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-8 h-8 rounded-full"     
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-spotify-green flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
              <span className="text-white hidden sm:block">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-spotify-lightgray hover:text-white transition"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:block">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;