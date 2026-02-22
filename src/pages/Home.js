import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import OnboardingWizard from '../components/OnboardingWizard';

const Home = () => {
  const navigate = useNavigate();
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

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
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

          <div className="mobile-grid gap-6 sm:gap-8">
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

          <div className="mobile-grid gap-4 sm:gap-6">
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
