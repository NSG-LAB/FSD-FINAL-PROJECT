import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setUser, setLoading, setError } from '../redux/authSlice';
import { authAPI, primeApiConnection } from '../services/api';
import { toast } from 'react-toastify';
import OnboardingWizard from '../components/OnboardingWizard';
import { preloadCommonDashboards, preloadDashboardByRole } from '../utils/routePreload';

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Show onboarding for authenticated users who haven't completed it
    if (isAuthenticated && user) {
      const onboardingCompleted = localStorage.getItem(`onboarding_completed_${user.id}`);
      if (!onboardingCompleted) {
        setShowOnboarding(true);
      }
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    primeApiConnection();
    preloadCommonDashboards();
  }, []);

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
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

  return (
    <div className="ui-page bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto mobile-container py-12 sm:py-16 md:py-24 text-center">
        <h1 className="mobile-heading font-bold text-gray-900 mb-4 leading-tight pt-16">
          🏠 Enhance Your Home's Value
        </h1>
        <p className="mobile-text text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto">
          Get personalized property enhancement recommendations tailored for the Indian market
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 sm:mb-12">
          <button
            onClick={() => navigate('/register')}
            className="btn-primary px-8 py-4 text-lg font-semibold touch-target"
          >
            Get Started
          </button>
          <button
            onClick={() => navigate('/recommendations')}
            className="btn-secondary px-8 py-4 text-lg font-semibold touch-target border-2"
          >
            View Recommendations
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white mobile-section border-y border-slate-200">
        <div className="max-w-6xl mx-auto mobile-container">
          <h2 className="mobile-heading font-bold text-center mb-8 sm:mb-12 text-gray-900">Why Choose Us?</h2>

          <div className="mobile-grid gap-6 sm:gap-8 stagger-container">
            <div className="ui-card-item mobile-card rounded-xl hover:shadow-lg transition-all duration-300">
              <h3 className="ui-card-title text-lg sm:text-xl font-bold mb-3 sm:mb-4">📊 Data-Driven</h3>
              <p className="mobile-text text-gray-600">
                Get recommendations based on real market data for your neighborhood and property type.
              </p>
            </div>

            <div className="ui-card-item mobile-card rounded-xl hover:shadow-lg transition-all duration-300">
              <h3 className="ui-card-title text-lg sm:text-xl font-bold mb-3 sm:mb-4">💡 Expert Insights</h3>
              <p className="mobile-text text-gray-600">
                Curated suggestions from industry experts focused on the Indian residential market.
              </p>
            </div>

            <div className="ui-card-item mobile-card rounded-xl hover:shadow-lg transition-all duration-300">
              <h3 className="ui-card-title text-lg sm:text-xl font-bold mb-3 sm:mb-4">📈 ROI Focused</h3>
              <p className="mobile-text text-gray-600">
                Understand the potential return on investment for every improvement suggestion.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhancement Categories */}
      <div className="mobile-section">
        <div className="max-w-6xl mx-auto mobile-container">
          <h2 className="mobile-heading font-bold text-center mb-8 sm:mb-12 text-gray-900">Enhancement Categories</h2>

          <div className="mobile-grid gap-4 sm:gap-6 card-grid">
            {[
              { icon: '🍳', name: 'Kitchen & Bathroom', desc: 'Modern fittings and upgrades' },
              { icon: '🪵', name: 'Flooring', desc: 'Premium flooring solutions' },
              { icon: '🎨', name: 'Wall & Paint', desc: 'Color schemes and treatments' },
              { icon: '💡', name: 'Lighting & Fixtures', desc: 'Modern lighting solutions' },
              { icon: '🌿', name: 'Garden & Outdoor', desc: 'Landscaping and outdoor spaces' },
              { icon: '🔒', name: 'Safety & Security', desc: 'Advanced security features' },
              { icon: '⚡', name: 'Energy Efficiency', desc: 'Solar and water systems' },
              { icon: '🛋️', name: 'Interior Design', desc: 'Space optimization' },
              { icon: '🔧', name: 'Electrical & Plumbing', desc: 'Modern infrastructure' },
            ].map((category, idx) => (
              <div key={idx} className="ui-card-item mobile-card rounded-xl hover:shadow-lg transition-all duration-300">
                <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">{category.icon}</div>
                <h4 className="ui-card-title font-bold mb-1 sm:mb-2 text-sm sm:text-base">{category.name}</h4>
                <p className="mobile-text text-gray-600">{category.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white mobile-section">
        <div className="max-w-6xl mx-auto mobile-container text-center">
          <h2 className="mobile-heading font-bold mb-4 sm:mb-6">Ready to Increase Your Property's Value?</h2>
          <p className="mobile-text mb-6 sm:mb-8 max-w-2xl mx-auto">
            Join thousands of homeowners enhancing their properties with expert recommendations
          </p>
          <button
            onClick={() => navigate('/register')}
            className="btn-secondary px-8 py-4 text-lg font-semibold touch-target border-white text-white hover:bg-white hover:text-blue-600 transition-all duration-200"
          >
            Start Your Journey
          </button>
        </div>
      </div>

      {/* Demo Access Section */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 mobile-section border-y border-indigo-200">
        <div className="max-w-6xl mx-auto mobile-container">
          <h2 className="mobile-heading font-bold text-center mb-4 sm:mb-6 text-gray-900 animate-slideDown">Try Demo Accounts</h2>
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            Explore the platform features with our pre-configured demo accounts. No sign-up required!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto stagger-container">
            {/* User Demo Card */}
            <div className="ui-card rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-400">
              <div className="text-4xl mb-3 animate-bounce">👤</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">User Demo</h3>
              <p className="text-sm text-gray-600 mb-4">
                Explore personal dashboard, property management, and personalized recommendations.
              </p>
              <button
                onClick={() => handleDemoLogin('user')}
                onMouseEnter={() => preloadDashboardByRole('user')}
                onFocus={() => preloadDashboardByRole('user')}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-md transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                Try User Demo
              </button>
            </div>

            {/* Admin Demo Card */}
            <div className="ui-card rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-purple-400">
              <div className="text-4xl mb-3 animate-bounce" style={{ animationDelay: '0.2s' }}>👨‍💼</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Admin Demo</h3>
              <p className="text-sm text-gray-600 mb-4">
                Access admin dashboard, analytics, system monitoring, and content management.
              </p>
              <button
                onClick={() => handleDemoLogin('admin')}
                onMouseEnter={() => preloadDashboardByRole('admin')}
                onFocus={() => preloadDashboardByRole('admin')}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium rounded-md transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                Try Admin Demo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 sm:py-12">
        <div className="max-w-6xl mx-auto mobile-container text-center">
          <p className="text-sm sm:text-base">&copy; 2026 Property Value Enhancement Platform. All rights reserved.</p>
          <p className="mobile-text text-gray-400 mt-2">Designed for Indian middle-class homeowners</p>
        </div>
      </footer>

      {/* Onboarding Wizard */}
      <OnboardingWizard
        isOpen={showOnboarding}
        onClose={handleOnboardingClose}
      />
    </div>
  );
};

export default Home;
