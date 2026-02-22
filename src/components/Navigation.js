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
    `px-3 py-2 rounded-md text-sm font-medium transition ${
      isActive
        ? 'bg-blue-700 text-white'
        : 'text-blue-50 hover:bg-blue-500 hover:text-white'
    }`
  );

  const registerClass = 'btn-success px-4 py-2 text-sm font-medium';

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-blue-600 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 h-16 flex justify-between items-center">
        <div className="text-xl md:text-2xl font-bold">
          <Link to="/" className="hover:text-blue-100 transition">🏠 Property Value</Link>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="md:hidden px-3 py-2 rounded-md border border-blue-400 text-white"
        >
          {isOpen ? 'Close' : 'Menu'}
        </button>

        <div className="hidden md:flex gap-2 items-center">
          <NavLink to="/recommendations" className={linkClass}>Recommendations</NavLink>
          <NavLink to="/roi-planner" className={linkClass}>ROI Planner</NavLink>
          <NavLink to="/valuation" className={linkClass}>Valuation</NavLink>

          {isAuthenticated ? (
            <>
              {user?.role === 'admin' ? (
                <NavLink to="/admin/dashboard" className={linkClass}>Admin Panel</NavLink>
              ) : (
                <NavLink to="/user/dashboard" className={linkClass}>My Dashboard</NavLink>
              )}
              <NavLink to="/notifications" className={linkClass}>Notifications</NavLink>

              <div className="flex items-center gap-3 ml-2">
                <span className="text-sm text-blue-50">Hi, {user?.firstName}!</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-600 transition"
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

      {isOpen && (
        <div className="md:hidden border-t border-blue-500 bg-blue-600 px-4 py-3 space-y-2">
          <NavLink to="/recommendations" className={linkClass}>Recommendations</NavLink>
          <NavLink to="/roi-planner" className={linkClass}>ROI Planner</NavLink>
          <NavLink to="/valuation" className={linkClass}>Valuation</NavLink>

          {isAuthenticated ? (
            <>
              {user?.role === 'admin' ? (
                <NavLink to="/admin/dashboard" className={linkClass}>Admin Panel</NavLink>
              ) : (
                <NavLink to="/user/dashboard" className={linkClass}>My Dashboard</NavLink>
              )}
              <NavLink to="/notifications" className={linkClass}>Notifications</NavLink>
              <div className="pt-2 text-sm text-blue-50">Hi, {user?.firstName}!</div>
              <button
                onClick={handleLogout}
                className="w-full bg-red-500 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-600 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>Login</NavLink>
              <NavLink to="/register" className={`block ${registerClass} text-center`}>
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
