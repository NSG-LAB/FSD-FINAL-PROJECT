import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../redux/authSlice';
import { authAPI } from '../services/api';
import { Menu, X, LogOut, LayoutDashboard, Bell, Calculator, TrendingUp, User } from 'lucide-react';

const Navigation = () => {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {}
    dispatch(logout());
    navigate('/');
  };

  const navClass = `fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
    scrolled ? 'glass shadow-lg py-2' : 'bg-transparent py-4'
  }`;

  const linkClass = ({ isActive }) => (
    `px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
      isActive
        ? 'text-gold'
        : 'text-indigo hover:text-gold'
    }`
  );

  return (
    <nav className={navClass}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl serif font-bold text-indigo flex items-center gap-2">
          Ghar<span className="text-gold">Mulya</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-4">
          <NavLink to="/recommendations" className={linkClass}>
            <TrendingUp size={18} /> Recommendations
          </NavLink>
          <NavLink to="/roi-planner" className={linkClass}>
            <Calculator size={18} /> ROI Planner
          </NavLink>
          <NavLink to="/valuation" className={linkClass}>
            Valuation
          </NavLink>

          <div className="h-6 w-px bg-indigo/10 mx-2" />

          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <NavLink to="/notifications" className={linkClass}>
                <Bell size={18} />
              </NavLink>

              <NavLink to="/profile" className={linkClass}>
                <User size={18} /> Profile
              </NavLink>
              
              <Link 
                to={user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'} 
                className="btn btn-primary text-xs py-2 px-4"
              >
                <LayoutDashboard size={16} /> {user?.role === 'admin' ? 'Admin' : 'Dashboard'}
              </Link>

              <button 
                onClick={handleLogout}
                className="p-2 text-indigo hover:text-coral transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-indigo font-bold hover:text-gold transition-colors px-4">
                Login
              </Link>
              <Link to="/register" className="btn btn-gold py-2 px-6 text-sm">
                Join Now
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-indigo"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-indigo/5 shadow-2xl py-6 px-6 flex flex-col gap-4 animate-in slide-in-from-top-2">
          <NavLink to="/recommendations" className="text-lg font-medium text-indigo">Recommendations</NavLink>
          <NavLink to="/roi-planner" className="text-lg font-medium text-indigo">ROI Planner</NavLink>
          <NavLink to="/valuation" className="text-lg font-medium text-indigo">Valuation</NavLink>
          
          <div className="h-px bg-indigo/5 my-2" />
          
          {isAuthenticated ? (
            <>
              <Link to={user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'} className="btn btn-primary w-full justify-start">My Dashboard</Link>
              <Link to="/profile" className="btn btn-outline w-full justify-start">My Profile</Link>
              <button onClick={handleLogout} className="btn btn-outline w-full justify-start text-coral border-coral hover:bg-coral">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline w-full">Login</Link>
              <Link to="/register" className="btn btn-gold w-full">Join Now</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navigation;

