import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../redux/authSlice';

const Navigation = () => {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const linkClass = ({ isActive }) => (
    `px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 touch-target ${
      isActive
        ? 'bg-blue-700 text-white shadow-md'
        : 'text-blue-50 hover:bg-blue-500 hover:text-white'
    }`
  );

  const mobileLinkClass = ({ isActive }) => (
    `block px-4 py-3 rounded-md text-base font-medium transition-all duration-200 ${
      isActive
        ? 'bg-blue-700 text-white shadow-md'
        : 'text-blue-50 hover:bg-blue-500 hover:text-white'
    }`
  );

  const registerClass = 'btn-success px-6 py-3 text-sm font-medium touch-target';

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-blue-600 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
        <div className="text-lg sm:text-xl md:text-2xl font-bold">
          <Link to="/" className="hover:text-blue-100 transition touch-target py-2">
            🏠 Property Value
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="md:hidden touch-target px-3 py-2 rounded-md border border-blue-400 text-white hover:bg-blue-500 transition-all duration-200"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        <div className="hidden md:flex gap-2 items-center">
          <NavLink to="/recommendations" className={linkClass}>Recommendations</NavLink>
          <NavLink to="/roi-planner" className={linkClass}>ROI Planner</NavLink>
          <NavLink to="/valuation" className={linkClass}>Valuation</NavLink>

          {isAuthenticated ? (
            <>
              {user?.role === 'admin' ? (
                <>
                  <NavLink to="/admin/dashboard" className={linkClass}>Admin Panel</NavLink>
                  <NavLink to="/monitoring" className={linkClass}>Monitoring</NavLink>
                </>
              ) : (
                <NavLink to="/user/dashboard" className={linkClass}>My Dashboard</NavLink>
              )}
              <NavLink to="/notifications" className={linkClass}>Notifications</NavLink>

              <div className="flex items-center gap-3 ml-2 pl-4 border-l border-blue-500">
                <span className="text-sm text-blue-50 hidden lg:block">Hi, {user?.firstName}!</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-600 transition-all duration-200 touch-target"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>Login</NavLink>
              <NavLink to="/register" className={registerClass}>
                Register
              </NavLink>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-blue-500 bg-blue-600 px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <NavLink to="/recommendations" className={mobileLinkClass}>Recommendations</NavLink>
          <NavLink to="/roi-planner" className={mobileLinkClass}>ROI Planner</NavLink>
          <NavLink to="/valuation" className={mobileLinkClass}>Valuation</NavLink>

          {isAuthenticated ? (
            <>
              {user?.role === 'admin' ? (
                <>
                  <NavLink to="/admin/dashboard" className={mobileLinkClass}>Admin Panel</NavLink>
                  <NavLink to="/monitoring" className={mobileLinkClass}>Monitoring</NavLink>
                </>
              ) : (
                <NavLink to="/user/dashboard" className={mobileLinkClass}>My Dashboard</NavLink>
              )}
              <NavLink to="/notifications" className={mobileLinkClass}>Notifications</NavLink>

              <div className="pt-3 pb-2 border-t border-blue-500">
                <div className="text-base text-blue-50 mb-3">Hi, {user?.firstName}!</div>
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-500 px-4 py-3 rounded-md text-base font-medium hover:bg-red-600 transition-all duration-200 touch-target"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <NavLink to="/login" className={mobileLinkClass}>Login</NavLink>
              <NavLink to="/register" className={`block ${registerClass} text-center mt-4`}>
                Register
              </NavLink>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navigation;
