import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../redux/authSlice';

const Navigation = () => {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold">
          <a href="/">🏠 Property Value</a>
        </div>

        <div className="flex gap-6 items-center">
          <a href="/recommendations" className="hover:text-gray-200">Recommendations</a>
          
          {isAuthenticated ? (
            <>
              {user?.role === 'admin' ? (
                <a href="/admin/dashboard" className="hover:text-gray-200">Admin Panel</a>
              ) : (
                <a href="/user/dashboard" className="hover:text-gray-200">My Dashboard</a>
              )}
              
              <div className="flex items-center gap-4">
                <span className="text-sm">Hi, {user?.firstName}!</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <a href="/login" className="hover:text-gray-200">Login</a>
              <a href="/register" className="bg-green-500 px-4 py-2 rounded hover:bg-green-600">Register</a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
