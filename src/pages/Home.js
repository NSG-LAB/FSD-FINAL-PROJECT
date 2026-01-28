import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          🏠 Enhance Your Home's Value
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Get personalized property enhancement recommendations tailored for the Indian market
        </p>
        
        <div className="flex gap-4 justify-center mb-12">
          <button
            onClick={() => navigate('/register')}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold"
          >
            Get Started
          </button>
          <button
            onClick={() => navigate('/recommendations')}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg border-2 border-blue-600 hover:bg-blue-50 font-semibold"
          >
            View Recommendations
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 border rounded-lg hover:shadow-lg transition">
              <h3 className="text-xl font-bold mb-4">📊 Data-Driven</h3>
              <p className="text-gray-600">
                Get recommendations based on real market data for your neighborhood and property type.
              </p>
            </div>

            <div className="p-6 border rounded-lg hover:shadow-lg transition">
              <h3 className="text-xl font-bold mb-4">💡 Expert Insights</h3>
              <p className="text-gray-600">
                Curated suggestions from industry experts focused on the Indian residential market.
              </p>
            </div>

            <div className="p-6 border rounded-lg hover:shadow-lg transition">
              <h3 className="text-xl font-bold mb-4">📈 ROI Focused</h3>
              <p className="text-gray-600">
                Understand the potential return on investment for every improvement suggestion.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhancement Categories */}
      <div className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Enhancement Categories</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <div key={idx} className="bg-white p-4 rounded-lg border hover:shadow-lg transition">
                <div className="text-3xl mb-2">{category.icon}</div>
                <h4 className="font-bold mb-1">{category.name}</h4>
                <p className="text-sm text-gray-600">{category.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Increase Your Property's Value?</h2>
          <p className="text-lg mb-6">Join thousands of homeowners enhancing their properties</p>
          <button
            onClick={() => navigate('/register')}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 font-semibold"
          >
            Start Your Journey
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>&copy; 2026 Property Value Enhancement Platform. All rights reserved.</p>
          <p className="text-sm text-gray-400 mt-2">Designed for Indian middle-class homeowners</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
