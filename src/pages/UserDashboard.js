import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setProperties, setLoading } from '../redux/propertySlice';
import { propertyAPI, recommendationAPI, valuationAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import PropertyFormWizard from '../components/PropertyFormWizard';
import SkeletonLoader from '../components/SkeletonLoader';

const UserDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { properties, loading } = useSelector(state => state.property);
  const [showForm, setShowForm] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalValue: 0,
    pendingRecommendations: 0,
    completedImprovements: 0
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    dispatch(setLoading(true));
    try {
      const [propertiesRes, recommendationsRes] = await Promise.all([
        propertyAPI.getProperties(),
        recommendationAPI.getRecommendations()
      ]);

      dispatch(setProperties(propertiesRes.data.properties));
      setRecommendations(recommendationsRes.data.recommendations || []);

      // Calculate stats
      const properties = propertiesRes.data.properties || [];
      const totalValue = properties.reduce((sum, prop) => sum + (prop.currentValue || 0), 0);
      const pendingRecommendations = recommendationsRes.data.recommendations?.length || 0;

      setStats({
        totalProperties: properties.length,
        totalValue,
        pendingRecommendations,
        completedImprovements: 0 // This would come from a separate API in a real app
      });
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen ui-page py-8">
      <div className="max-w-6xl mx-auto mobile-container">
        <div className="ui-card rounded-xl mobile-card">
          <h1 className="ui-card-title mobile-heading font-bold mb-2">🏠 Property Command Center</h1>
          <p className="mobile-text text-gray-600 mb-8">Manage your properties, track improvements, and maximize your investment potential.</p>

          {/* Stats Cards */}
          {loading ? (
            <SkeletonLoader type="dashboard-stats" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Properties</p>
                    <p className="text-2xl font-bold">{stats.totalProperties}</p>
                  </div>
                  <div className="text-3xl">🏢</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Portfolio Value</p>
                    <p className="text-2xl font-bold">₹{(stats.totalValue / 100000).toFixed(1)}L</p>
                  </div>
                  <div className="text-3xl">💰</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Available Tips</p>
                    <p className="text-2xl font-bold">{stats.pendingRecommendations}</p>
                  </div>
                  <div className="text-3xl">💡</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Completed</p>
                    <p className="text-2xl font-bold">{stats.completedImprovements}</p>
                  </div>
                  <div className="text-3xl">✅</div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">⚡ Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary p-4 text-center hover:shadow-lg transition-all duration-200"
              >
                <div className="text-2xl mb-2">🏠</div>
                <div className="font-semibold">Add Property</div>
                <div className="text-sm opacity-80">Submit new property</div>
              </button>

              <button
                onClick={() => navigate('/valuation')}
                className="btn-secondary p-4 text-center hover:shadow-lg transition-all duration-200"
              >
                <div className="text-2xl mb-2">📊</div>
                <div className="font-semibold">Get Valuation</div>
                <div className="text-sm opacity-80">Estimate property value</div>
              </button>

              <button
                onClick={() => navigate('/recommendations')}
                className="btn-secondary p-4 text-center hover:shadow-lg transition-all duration-200"
              >
                <div className="text-2xl mb-2">💡</div>
                <div className="font-semibold">View Tips</div>
                <div className="text-sm opacity-80">Browse improvements</div>
              </button>

              <button
                onClick={() => navigate('/roi-planner')}
                className="btn-secondary p-4 text-center hover:shadow-lg transition-all duration-200"
              >
                <div className="text-2xl mb-2">📈</div>
                <div className="font-semibold">ROI Planner</div>
                <div className="text-sm opacity-80">Plan investments</div>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">📋 Recent Properties</h2>
              {loading ? (
                <SkeletonLoader type="property-list" />
              ) : properties.length > 0 ? (
                <div className="space-y-3">
                  {properties.slice(0, 3).map(property => (
                    <div key={property._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{property.title}</p>
                        <p className="text-sm text-gray-600">{property.location.city}, {property.location.state}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">₹{property.currentValue?.toLocaleString()}</p>
                        <span className={`inline-block px-2 py-1 text-xs rounded ${
                          property.status === 'approved' ? 'bg-green-100 text-green-800' :
                          property.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {property.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {properties.length > 3 && (
                    <p className="text-sm text-blue-600 text-center pt-2">
                      +{properties.length - 3} more properties
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No properties yet. Add your first property to get started!</p>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">💡 Recommended Improvements</h2>
              {recommendations.length > 0 ? (
                <div className="space-y-3">
                  {recommendations.slice(0, 3).map(rec => (
                    <div key={rec._id} className="p-3 bg-blue-50 rounded-lg">
                      <p className="font-medium text-gray-900 text-sm">{rec.title}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          rec.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                          rec.difficulty === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {rec.difficulty}
                        </span>
                        <span className="text-sm font-semibold text-green-600">
                          {rec.expectedROI}% ROI
                        </span>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => navigate('/recommendations')}
                    className="w-full mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View all recommendations →
                  </button>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Loading recommendations...</p>
              )}
            </div>
          </div>

          {showForm && (
            <PropertyFormWizard
              onClose={() => setShowForm(false)}
              onSuccess={fetchProperties}
            />
          )}

          {/* Detailed Properties Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Your Properties ({properties.length})</h2>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary px-4 py-2 text-sm"
              >
                + Add Property
              </button>
            </div>

            {properties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {properties.map(property => (
                  <div key={property._id} className="ui-card-item rounded-xl p-5 hover:shadow-lg transition-all duration-300">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="ui-card-title font-bold text-lg">{property.title}</h3>
                      <span className={`inline-block px-2 py-1 text-xs rounded ${
                        property.status === 'approved' ? 'bg-green-100 text-green-800' :
                        property.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {property.status}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <p className="text-gray-600">📍 {property.location.city}, {property.location.state}</p>
                      <p className="text-sm text-gray-500">
                        🏠 {property.propertyType} • {property.bedrooms} BHK • {property.builUpArea} sq ft
                      </p>
                      <p className="text-sm text-gray-500">
                        📅 Age: {property.age} years • Condition: {property.condition}
                      </p>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-2xl font-bold text-green-600">₹{property.currentValue?.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Current Value</p>
                      </div>
                      <button
                        onClick={() => navigate('/valuation')}
                        className="btn-secondary px-3 py-2 text-sm"
                      >
                        Get Valuation
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Properties Yet</h3>
                <p className="text-gray-600 mb-6">Start building your property portfolio by adding your first property.</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="btn-primary px-6 py-3"
                >
                  Add Your First Property
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
