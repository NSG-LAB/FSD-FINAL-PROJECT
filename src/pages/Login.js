import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { setUser, setLoading, setError } from '../redux/authSlice';
import { authAPI, primeApiConnection } from '../services/api';
import { toast } from 'react-toastify';
import { useEffect } from 'react';
import { preloadCommonDashboards, preloadDashboardByRole } from '../utils/routePreload';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    primeApiConnection();
    preloadCommonDashboards();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDemoLogin = async (role) => {
    dispatch(setLoading(true));
    try {
      preloadDashboardByRole(role);

      const demoCredentials = {
        user: { email: 'user@demo.com', password: 'User@123456' },
        admin: { email: 'admin@demo.com', password: 'Admin@123456' },
      };

      const credentials = demoCredentials[role];
      const response = await authAPI.login(credentials);
      dispatch(setUser(response.data));
      toast.success(`${role.charAt(0).toUpperCase() + role.slice(1)} Demo Login successful!`);
      navigate(response.data.user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
    } catch (error) {
      const message = error.response?.data?.message || `${role} demo login failed. Please try manual login.`;
      dispatch(setError(message));
      toast.error(message);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setLoading(true));

    try {
      const response = await authAPI.login(formData);
      dispatch(setUser(response.data));
      toast.success('Login successful!');
      navigate(response.data.user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
    } catch (error) {
      const validationErrors = error.response?.data?.errors;
      const detailedMessage = Array.isArray(validationErrors)
        ? validationErrors.map((item) => item.message).join(', ')
        : null;
      const message = detailedMessage || error.response?.data?.message || 'Login failed';
      dispatch(setError(message));
      toast.error(message);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center ui-page py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full ui-card rounded-2xl p-8">
        <h2 className="ui-card-title text-3xl font-bold text-center mb-2">Welcome Back</h2>
        <p className="text-center text-sm text-gray-600 mb-6">Sign in to manage your properties and recommendations.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full btn-primary py-2.5 px-4"
          >
            Login
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account? <Link to="/register" className="text-blue-600 hover:underline font-medium">Register</Link>
        </p>

        {/* Demo Buttons Section */}
        <div className="mt-8 pt-6 border-t border-gray-200 animate-slideUp">
          <p className="text-center text-xs font-medium text-gray-500 mb-3 uppercase">Quick Demo Login</p>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('user')}
              onMouseEnter={() => preloadDashboardByRole('user')}
              onFocus={() => preloadDashboardByRole('user')}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-medium rounded-md transition-all duration-300 shadow-sm transform hover:scale-105 active:scale-95"
            >
              👤 Demo User
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              onMouseEnter={() => preloadDashboardByRole('admin')}
              onFocus={() => preloadDashboardByRole('admin')}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white font-medium rounded-md transition-all duration-300 shadow-sm transform hover:scale-105 active:scale-95"
            >
              👨‍💼 Demo Admin
            </button>
          </div>
          <p className="text-center text-xs text-gray-400 mt-3">Demo accounts show all features without creating a new account</p>
        </div>
</div>
    </div>
  );
};

export default Login;
