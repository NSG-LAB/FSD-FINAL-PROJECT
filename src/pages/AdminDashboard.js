import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setRecommendations, setLoading, addRecommendation } from '../redux/recommendationSlice';
import { recommendationAPI, analyticsAPI } from '../services/api';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { recommendations } = useSelector(state => state.recommendation);
  const [activeTab, setActiveTab] = useState('overview');
  const [analyticsData, setAnalyticsData] = useState({
    overview: null,
    userActivity: null,
    properties: null,
    performance: null
  });
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'kitchen-bathroom',
    description: '',
    benefits: [],
    estimatedCost: { min: 0, max: 0 },
    expectedROI: 0,
    difficulty: 'moderate',
    timeframe: '',
    tips: [],
    applicablePropertyTypes: ['all'],
    applicableConditions: [],
  });

  useEffect(() => {
    fetchRecommendations();
    fetchAnalyticsData();
  }, []);

  const fetchRecommendations = async () => {
    dispatch(setLoading(true));
    try {
      const response = await recommendationAPI.getRecommendations();
      dispatch(setRecommendations(response.data.recommendations));
    } catch (error) {
      toast.error('Failed to fetch recommendations');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      const [overviewRes, userActivityRes, propertiesRes, performanceRes] = await Promise.all([
        analyticsAPI.getOverview(),
        analyticsAPI.getUserActivity(),
        analyticsAPI.getProperties(),
        analyticsAPI.getPerformance()
      ]);

      setAnalyticsData({
        overview: overviewRes.data.data,
        userActivity: userActivityRes.data.data,
        properties: propertiesRes.data.data,
        performance: performanceRes.data.data
      });
    } catch (error) {
      toast.error('Failed to fetch analytics data');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await recommendationAPI.createRecommendation(formData);
      dispatch(addRecommendation(response.data.recommendation));
      toast.success('Recommendation created successfully!');
      setShowForm(false);
      setFormData({
        title: '',
        category: 'kitchen-bathroom',
        description: '',
        benefits: [],
        estimatedCost: { min: 0, max: 0 },
        expectedROI: 0,
        difficulty: 'moderate',
        timeframe: '',
        tips: [],
        applicablePropertyTypes: ['all'],
        applicableConditions: [],
      });
    } catch (error) {
      toast.error('Failed to create recommendation');
    }
  };

  const renderOverviewTab = () => {
    if (!analyticsData.overview) return <div className="text-center py-8">Loading analytics data...</div>;

    const { users, properties, recommendations, notifications, distributions } = analyticsData.overview;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="ui-card-item rounded-xl p-6 text-center">
          <h3 className="text-2xl font-bold text-blue-600">{users.total}</h3>
          <p className="text-gray-600">Total Users</p>
          <p className="text-sm text-green-600">+{users.new} new this month</p>
        </div>
        <div className="ui-card-item rounded-xl p-6 text-center">
          <h3 className="text-2xl font-bold text-green-600">{properties.total}</h3>
          <p className="text-gray-600">Total Properties</p>
          <p className="text-sm text-blue-600">+{properties.new} new this month</p>
        </div>
        <div className="ui-card-item rounded-xl p-6 text-center">
          <h3 className="text-2xl font-bold text-purple-600">{recommendations.total}</h3>
          <p className="text-gray-600">Recommendations</p>
          <p className="text-sm text-green-600">{recommendations.active} active</p>
        </div>
        <div className="ui-card-item rounded-xl p-6 text-center">
          <h3 className="text-2xl font-bold text-orange-600">{notifications.total}</h3>
          <p className="text-gray-600">Notifications</p>
          <p className="text-sm text-red-600">{notifications.unread} unread</p>
        </div>
      </div>
    );
  };

  const renderUserActivityTab = () => {
    if (!analyticsData.userActivity) return <div className="text-center py-8">Loading user activity data...</div>;

    const { userRegistrations, propertySubmissions, topUsers } = analyticsData.userActivity;

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="ui-card-item rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">User Registrations (Last 30 Days)</h3>
            <div className="space-y-2">
              {userRegistrations.slice(-7).map((reg, index) => (
                <div key={index} className="flex justify-between">
                  <span>{new Date(reg.date).toLocaleDateString()}</span>
                  <span className="font-semibold">{reg.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="ui-card-item rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Property Submissions (Last 30 Days)</h3>
            <div className="space-y-2">
              {propertySubmissions.slice(-7).map((sub, index) => (
                <div key={index} className="flex justify-between">
                  <span>{new Date(sub.date).toLocaleDateString()}</span>
                  <span className="font-semibold">{sub.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="ui-card-item rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4">Top Active Users</h3>
          <div className="space-y-3">
            {topUsers.map((user, index) => (
              <div key={user.id} className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{user.name}</span>
                  <span className="text-gray-500 text-sm ml-2">({user.email})</span>
                </div>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {user.propertyCount} properties
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderPropertiesTab = () => {
    if (!analyticsData.properties) return <div className="text-center py-8">Loading properties data...</div>;

    const { statusDistribution, locationDistribution, averageValues } = analyticsData.properties;

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="ui-card-item rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Property Status</h3>
            <div className="space-y-2">
              {statusDistribution.map((status, index) => (
                <div key={index} className="flex justify-between">
                  <span className="capitalize">{status.status}</span>
                  <span className="font-semibold">{status.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="ui-card-item rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Top Locations</h3>
            <div className="space-y-2">
              {locationDistribution.slice(0, 10).map((loc, index) => (
                <div key={index} className="flex justify-between">
                  <span>{loc.location}</span>
                  <span className="font-semibold">{loc.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="ui-card-item rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Average Values by Type</h3>
            <div className="space-y-2">
              {averageValues.map((type, index) => (
                <div key={index} className="flex justify-between">
                  <span className="capitalize">{type.type}</span>
                  <span className="font-semibold">₹{type.avgValue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPerformanceTab = () => {
    if (!analyticsData.performance) return <div className="text-center py-8">Loading performance data...</div>;

    const { system, database, cache } = analyticsData.performance;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="ui-card-item rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">System Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Uptime:</span>
                <span>{Math.floor(system.uptime / 3600)}h {Math.floor((system.uptime % 3600) / 60)}m</span>
              </div>
              <div className="flex justify-between">
                <span>Memory Usage:</span>
                <span>{(system.memoryUsage.heapUsed / 1024 / 1024).toFixed(1)} MB</span>
              </div>
              <div className="flex justify-between">
                <span>Node Version:</span>
                <span>{system.nodeVersion}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform:</span>
                <span>{system.platform}</span>
              </div>
            </div>
          </div>
          <div className="ui-card-item rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Database Status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={`font-semibold ${database.status === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
                  {database.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Dialect:</span>
                <span>{database.dialect}</span>
              </div>
            </div>
          </div>
          <div className="ui-card-item rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Cache Status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Redis Status:</span>
                <span className={`font-semibold ${cache.status === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
                  {cache.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen ui-page py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="ui-card rounded-xl p-8">
          <h1 className="ui-card-title text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 mb-6">Monitor system analytics and manage recommendations.</p>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-200 pb-4">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'activity', label: 'User Activity' },
              { id: 'properties', label: 'Properties' },
              { id: 'performance', label: 'Performance' },
              { id: 'recommendations', label: 'Recommendations' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'activity' && renderUserActivityTab()}
          {activeTab === 'properties' && renderPropertiesTab()}
          {activeTab === 'performance' && renderPerformanceTab()}

          {/* Recommendations Management */}
          {activeTab === 'recommendations' && (
            <>
              <button
                onClick={() => setShowForm(!showForm)}
                className="mb-6 btn-primary px-6 py-2.5"
              >
                {showForm ? 'Cancel' : 'Create Recommendation'}
              </button>

              {showForm && (
                <form onSubmit={handleSubmit} className="mb-8 border-t border-slate-200 pt-6">
                  <h2 className="text-2xl font-semibold mb-4">Create New Recommendation</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="block w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="block w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option>kitchen-bathroom</option>
                        <option>flooring</option>
                        <option>wall-paint</option>
                        <option>lighting-fixtures</option>
                        <option>garden-outdoor</option>
                        <option>safety-security</option>
                        <option>energy-efficiency</option>
                        <option>interior-design</option>
                        <option>electrical-plumbing</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="4"
                      required
                      className="block w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Min Cost (₹)</label>
                      <input
                        type="number"
                        name="costMin"
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          estimatedCost: { ...prev.estimatedCost, min: e.target.value }
                        }))}
                        className="block w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Cost (₹)</label>
                      <input
                        type="number"
                        name="costMax"
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          estimatedCost: { ...prev.estimatedCost, max: e.target.value }
                        }))}
                        className="block w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expected ROI (%)</label>
                      <input
                        type="number"
                        name="expectedROI"
                        value={formData.expectedROI}
                        onChange={handleChange}
                        className="block w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                      <select
                        name="difficulty"
                        value={formData.difficulty}
                        onChange={handleChange}
                        className="block w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option>easy</option>
                        <option>moderate</option>
                        <option>difficult</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Timeframe</label>
                      <input
                        type="text"
                        name="timeframe"
                        value={formData.timeframe}
                        onChange={handleChange}
                        placeholder="e.g., 2-3 weeks"
                        className="block w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full btn-success py-2.5"
                  >
                    Create Recommendation
                  </button>
                </form>
              )}

              <div className="border-t border-slate-200 pt-6">
                <h2 className="text-2xl font-semibold mb-4">Recommendations ({recommendations.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recommendations.map(rec => (
                    <div key={rec._id} className="ui-card-item rounded-xl p-5 hover:shadow-lg transition">
                      <h3 className="ui-card-title font-bold text-lg mb-2">{rec.title}</h3>
                      <p className="text-gray-600 mb-2 text-sm">{rec.description ? `${rec.description.substring(0, 100)}...` : 'No description available.'}</p>
                      <div className="flex justify-between mb-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{rec.category}</span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">{rec.difficulty}</span>
                      </div>
                      <p className="text-sm text-gray-500">ROI: <strong className="ui-positive">{rec.expectedROI}%</strong></p>
                      {rec.estimatedCost && (
                        <p className="text-sm text-gray-500">Cost: ₹{rec.estimatedCost.min?.toLocaleString()} - ₹{rec.estimatedCost.max?.toLocaleString()}</p>
                      )}
                    </div>
                  ))}
                </div>
                {recommendations.length === 0 && (
                  <p className="text-gray-500 mt-4">No recommendations available yet. Create one to get started.</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
