import React, { useEffect, useState } from 'react';
import { recommendationAPI } from '../services/api';
import { toast } from 'react-toastify';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ category: '', difficulty: '' });

  useEffect(() => {
    fetchRecommendations();
  }, [filters]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await recommendationAPI.getRecommendations(filters);
      setRecommendations(response.data.recommendations);
    } catch (error) {
      toast.error('Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold mb-6">Property Enhancement Recommendations</h1>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All Categories</option>
                <option value="kitchen-bathroom">Kitchen & Bathroom</option>
                <option value="flooring">Flooring</option>
                <option value="wall-paint">Wall & Paint</option>
                <option value="lighting-fixtures">Lighting & Fixtures</option>
                <option value="garden-outdoor">Garden & Outdoor</option>
                <option value="safety-security">Safety & Security</option>
                <option value="energy-efficiency">Energy Efficiency</option>
                <option value="interior-design">Interior Design</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Difficulty</label>
              <select
                value={filters.difficulty}
                onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All Difficulty Levels</option>
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="difficult">Difficult</option>
              </select>
            </div>
          </div>

          {loading ? (
            <p className="text-center">Loading recommendations...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map(rec => (
                <div key={rec._id} className="border rounded-lg p-4 hover:shadow-lg transition">
                  <h3 className="font-bold text-lg mb-2">{rec.title}</h3>
                  <p className="text-gray-600 mb-3 text-sm min-h-[60px]">{rec.description.substring(0, 100)}...</p>
                  
                  <div className="mb-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{rec.category}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        rec.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                        rec.difficulty === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {rec.difficulty}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <p className="text-sm text-gray-700 mb-1">
                      <strong>ROI:</strong> {rec.expectedROI}%
                    </p>
                    {rec.estimatedCost && (
                      <p className="text-sm text-gray-700 mb-1">
                        <strong>Cost:</strong> ₹{rec.estimatedCost.min?.toLocaleString()}-₹{rec.estimatedCost.max?.toLocaleString()}
                      </p>
                    )}
                    {rec.timeframe && (
                      <p className="text-sm text-gray-700">
                        <strong>Duration:</strong> {rec.timeframe}
                      </p>
                    )}
                  </div>

                  {rec.benefits && rec.benefits.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs font-semibold text-gray-700 mb-1">Benefits:</p>
                      <ul className="text-xs text-gray-600">
                        {rec.benefits.slice(0, 3).map((benefit, idx) => (
                          <li key={idx}>• {benefit}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {!loading && recommendations.length === 0 && (
            <p className="text-center text-gray-500 py-8">No recommendations found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
